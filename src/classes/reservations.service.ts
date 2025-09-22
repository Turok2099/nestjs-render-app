import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Reservation } from './entities/reservation.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

type ReservationStatus = 'booked' | 'cancelled' | 'attended' | 'no_show';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepo: Repository<Class>,
    @InjectRepository(Reservation)
    private readonly resRepo: Repository<Reservation>,
    private readonly subs: SubscriptionsService,
  ) {}

  async book(userId: string, classId: string) {
    // 1) Clase activa
    const cls = await this.classesRepo.findOne({
      where: { id: classId, isActive: true },
    });
    if (!cls) throw new NotFoundException('Clase no encontrada o inactiva');

    const has = await this.subs.hasActive(userId);
    if (!has) {
      throw new ForbiddenException('Necesitas una suscripción activa para reservar');
    }

    const existing = await this.resRepo.findOne({ where: { userId, classId } });

    if (existing && existing.status === 'booked') {
      throw new BadRequestException('Ya tienes una reserva para esta clase');
    }

    const bookedCount = await this.resRepo.count({
      where: { classId, status: 'booked' },
    });
    if (bookedCount >= cls.capacity) {
      throw new BadRequestException('La clase está llena');
    }

    if (existing) {
      existing.status = 'booked';
      const saved = await this.resRepo.save(existing);
      return {
        reservationId: saved.id,
        classId: cls.id,
        title: cls.title,
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        trainer: { id: cls.trainerId },
        status: saved.status,
        createdAt: saved.createdAt,
      };
    }

    const res = this.resRepo.create({
      userId,
      classId,
      status: 'booked',
    });
    const saved = await this.resRepo.save(res);
    return {
      reservationId: saved.id,
      classId: cls.id,
      title: cls.title,
      date: cls.date,
      startTime: cls.startTime,
      endTime: cls.endTime,
      trainer: { id: cls.trainerId },
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  async cancelMine(userId: string, classId: string) {
    const existing = await this.resRepo.findOne({
      where: { userId, classId, status: 'booked' },
    });
    if (!existing) {
      throw new NotFoundException('No tienes una reserva activa para esta clase');
    }

    existing.status = 'cancelled';
    const saved = await this.resRepo.save(existing);
    return { reservationId: saved.id, status: saved.status };
  }

  async setStatusAsTrainerOrAdmin(
    user: { userId: string; role: string },
    classId: string,
    reservationId: string,
    status: ReservationStatus,
  ) {
    const allowed: ReservationStatus[] = ['attended', 'no_show', 'cancelled', 'booked'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Estado inválido');
    }

    const cls = await this.classesRepo.findOne({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Clase no encontrada');

    if (user.role !== 'admin' && cls.trainerId !== user.userId) {
      throw new ForbiddenException('No autorizado');
    }

    const res = await this.resRepo.findOne({ where: { id: reservationId, classId } });
    if (!res) throw new NotFoundException('Reserva no encontrada');

    res.status = status;
    const saved = await this.resRepo.save(res);
    return { reservationId: saved.id, status: saved.status };
  }

  async userHistory(
  userId: string,
  page = 1,
  limit = 10,
  status?: ReservationStatus,         
) {
  const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where: Partial<Reservation> = { userId };
  if (status) (where as any).status = status;

  const [rows, total] = await this.resRepo.findAndCount({
    where,
    order: { createdAt: 'DESC' },
    skip,
    take,
  });

  if (!rows.length) return { page, limit: take, total, items: [] };

  const classIds = [...new Set(rows.map((r) => r.classId))];
  const classes = classIds.length
    ? await this.classesRepo.findBy({ id: In(classIds) }) 
    : [];
  const byId = new Map(classes.map((c) => [c.id, c]));

  const items = rows.map((r) => {
    const cls = byId.get(r.classId);
    return {
      reservationId: r.id,
      status: r.status,
      createdAt: r.createdAt,
      class: cls
        ? {
            id: cls.id,
            title: cls.title,
            date: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            trainerId: cls.trainerId,
          }
        : null,
    };
  });

  return { page, limit: take, total, items };
}
  async findByUser(
    userId: string,
    q: { page?: number; limit?: number; status?: ReservationStatus },
  ) {
    return this.userHistory(userId, q?.page ?? 1, q?.limit ?? 10, q?.status);
  }

}