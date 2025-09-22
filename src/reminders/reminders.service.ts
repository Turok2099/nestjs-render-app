import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DateTime } from 'luxon';

import { EmailsService } from '../emails/emails.service';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionReminder } from './entities/subscription-reminder.entity';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subsRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionReminder)
    private readonly reminderRepo: Repository<SubscriptionReminder>,
    private readonly emails: EmailsService,
  ) {}

  // === Helpers que leen las envs ===
  private cronsEnabled() {
    return (process.env.CRON_ENABLED ?? '1') !== '0';
  }

  private mode(): '10m' | '60m' | 'both' {
    const m = (process.env.REMINDERS_BENEFITS_MODE || 'both').toLowerCase();
    return (m === '10m' || m === '60m' || m === 'both') ? (m as any) : 'both';
  }

  private tz() {
    return process.env.CRON_TZ || 'America/Mexico_City';
  }

  // === Core job: enviar beneficios ===
  private async sendBenefitsNudgeBatch(): Promise<number> {
    const since = DateTime.now().setZone(this.tz()).minus({ hours: 24 }).toJSDate();

    // dedupe: buscar ya enviados en últimas 24h
    const already = await this.reminderRepo.find({
      where: { type: 'benefits_nudge', createdAt: MoreThan(since) } as any,
      select: { subscriptionId: true } as any,
    });
    const blocked = new Set(already.map((r) => r.subscriptionId));

    // suscripciones activas
    const subs = await this.subsRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .where('s.status = :status', { status: 'active' })
      .limit(50)
      .getMany();

    const discoverUrl =
      process.env.FRONT_DISCOVER_URL ||
      `${process.env.FRONT_ORIGIN || 'http://localhost:3000'}/descubre`;

    let sent = 0;
    for (const s of subs) {
      // @ts-ignore: relación user cargada
      const u = (s as any).user;
      if (!u?.email) continue;
      if (blocked.has((s as any).id)) continue;

      try {
        await this.emails.sendByTemplate(u.email, 'benefits_nudge', {
          name: u.name || 'miembro',
          discoverUrl,
        });

        await this.reminderRepo.save(
          this.reminderRepo.create({
            subscriptionId: (s as any).id,
            type: 'benefits_nudge',
          }) as any,
        );

        this.logger.log(`benefits_nudge enviado a ${u.email}`);
        sent++;
      } catch (e: any) {
        this.logger.error(
          `Error enviando a ${u?.email}: ${e?.message || String(e)}`,
        );
      }
    }
    return sent;
  }

  // === Crons programados ===

  /** Cada 10 minutos (modo demo) */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async benefitsEvery10m() {
    if (!this.cronsEnabled()) return;
    const m = this.mode();
    if (m !== '10m' && m !== 'both') return;

    const sent = await this.sendBenefitsNudgeBatch();
    if (sent) this.logger.log(`[CRON 10m] Enviados: ${sent}`);
  }

  /** Cada hora (modo normal) */
  @Cron(CronExpression.EVERY_HOUR)
  async benefitsHourly() {
    if (!this.cronsEnabled()) return;
    const m = this.mode();
    if (m !== '60m' && m !== 'both') return;

    const sent = await this.sendBenefitsNudgeBatch();
    if (sent) this.logger.log(`[CRON 60m] Enviados: ${sent}`);
  }

  /** Endpoint manual (POST /reminders/run-benefits) */
  async runBenefitsOnce() {
    const sent = await this.sendBenefitsNudgeBatch();
    return { ok: true, sent };
  }
}
