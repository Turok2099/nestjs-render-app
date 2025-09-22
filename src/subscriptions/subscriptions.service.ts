import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { AdminCreateSubscriptionDto } from './dto/create-subscription.dto';
import { PlansService } from '../plans/plans.service';
import { AdminListSubscriptionsDto, AdminPatchSubscriptionStatusDto } from './dto/admin-subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subsRepo: Repository<Subscription>,
    private readonly plans: PlansService,
  ) {}

  private now() {
    return new Date();
  }

  async hasActive(userId: string): Promise<boolean> {
    const now = this.now();
    const active = await this.subsRepo.findOne({
      where: { userId, status: 'active', endAt: MoreThan(now) },
      order: { endAt: 'DESC' },
    });
    return !!active;
  }

  async statusFor(userId: string) {
    const now = this.now();
    const sub = await this.subsRepo.findOne({
      where: { userId, status: 'active', endAt: MoreThan(now) },
      order: { endAt: 'DESC' },
    });

    if (!sub) {
      const last = await this.subsRepo.findOne({
        where: { userId, endAt: LessThan(now) },
        order: { endAt: 'DESC' },
      });
      return {
        active: false,
        status: last?.status === 'cancelled' ? 'cancelada' : 'vencida',
        current: null,
      };
    }

    const msLeft = sub.endAt.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const porVencer = daysLeft <= 3;

    return {
      active: true,
      status: porVencer ? 'por_vencer' : 'vigente',
      current: {
        id: sub.id,
        planId: sub.planId,
        startAt: sub.startAt,
        endAt: sub.endAt,
        daysLeft,
      },
    };
  }

  /**
   * Usuario: crea/ajusta su suscripción en base a un planId.
   * Usa plan.durationDays para calcular la extensión (o creación).
   */
  async createFromPlan(userId: string, planId: string) {
    const plan = await this.plans.findOne(planId);
    if (!plan) throw new NotFoundException('Plan not found');

    return this.extendOrCreate(userId, plan.durationDays, plan.id);
  }

  /**
   * Admin/webhook: crea o extiende para cualquier user.
   * Si viene planId y no viene durationDays, usa la duración del plan.
   * Si no viene nada, default 30 días.
   */
  async createAdmin(dto: AdminCreateSubscriptionDto) {
    let duration = dto.durationDays;
    let effectivePlanId = dto.planId ?? null;

    if (!duration && dto.planId) {
      const plan = await this.plans.findOne(dto.planId);
      if (!plan) throw new NotFoundException('Plan not found');
      duration = plan.durationDays;
      effectivePlanId = plan.id;
    }

    duration = duration ?? 30;
    return this.extendOrCreate(dto.userId, duration, effectivePlanId);
  }

  private async extendOrCreate(userId: string, durationDays: number, planId: string | null) {
    const now = this.now();
    const existing = await this.subsRepo.findOne({
      where: { userId, status: 'active', endAt: MoreThan(now) },
      order: { endAt: 'DESC' },
    });

    if (existing) {
      existing.endAt = new Date(existing.endAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      if (planId) existing.planId = planId;
      return this.subsRepo.save(existing);
    }

    const startAt = now;
    const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const sub = this.subsRepo.create({
      userId,
      planId,
      startAt,
      endAt,
      status: 'active',
    });
    return this.subsRepo.save(sub);
  }

  async cancel(id: string) {
    const sub = await this.subsRepo.findOne({ where: { id } });
    if (!sub) throw new BadRequestException('Subscription not found');
    sub.status = 'cancelled';
    return this.subsRepo.save(sub);
  }
   async adminList(q: AdminListSubscriptionsDto) {
  const page = q.page ? Number(q.page) : 1;
  const limit = q.limit ? Number(q.limit) : 20;

  const where: any = {};
  if (q.status) where.status = q.status;
  if (q.userId) where.userId = q.userId;
  if (q.planId) where.planId = q.planId;

  const [sortField, sortDir] = (q.sort || 'createdAt:DESC').split(':') as any;
  const order = { [sortField]: sortDir };

  const [data, total] = await this.subsRepo.findAndCount({
    where,
    order,
    skip: (page - 1) * limit,
    take: limit,
  });

  return { data, total, page, limit };
}

  async adminChangeStatus(id: string, dto: AdminPatchSubscriptionStatusDto) {
    const sub = await this.subsRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscripción no encontrada');

    // Si tu enum de la entidad NO incluye 'paused' o 'expired', limita aquí:
    // if (!['active','cancelled'].includes(dto.status)) throw new BadRequestException('Status inválido');
    sub.status = dto.status as any;

    // TODO opcional: guardar dto.reason en un campo de auditoría o disparar email/evento
    return this.subsRepo.save(sub);
  }
}
