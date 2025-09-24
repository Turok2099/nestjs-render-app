import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { DateTime } from "luxon";

import { EmailsService } from "src/emails/emails.service";
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { SubscriptionReminder } from "./entities/subscription-reminder.entity";

const CRON_TZ = process.env.CRON_TZ || "America/Mexico_City";

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

  // ==== Helpers ENV ====
  private cronsEnabled(): boolean {
    return (process.env.CRON_ENABLED ?? "1") !== "0";
  }

  /** '2m' | '60m' | 'both'  (por defecto 'both' para demo) */
  private mode(): "2m" | "60m" | "both" {
    const raw = (process.env.REMINDERS_BENEFITS_MODE || "both").toLowerCase();
    return (["2m", "60m", "both"] as const).includes(raw as any)
      ? (raw as any)
      : "both";
  }

  /** Ventana de desduplicación en minutos (por defecto 1440 = 24h; para demo usa 5–15) */
  private dedupMinutes(): number {
    const n = Number(process.env.REMINDERS_DEDUP_MINUTES ?? "1440");
    return Number.isFinite(n) && n > 0 ? n : 1440;
  }

  // ==== Core job ====
  private async sendBenefitsNudgeBatch(): Promise<number> {
    const since = DateTime.now()
      .setZone(CRON_TZ)
      .minus({ minutes: this.dedupMinutes() })
      .toJSDate();

    // dedupe últimos N minutos
    const already = await this.reminderRepo.find({
      where: { type: "benefits_nudge", createdAt: MoreThan(since) } as any,
      select: { subscriptionId: true } as any,
    });
    const blocked = new Set(already.map((r) => r.subscriptionId));

    // suscripciones activas (cap a 50 por tick)
    const subs = await this.subsRepo
      .createQueryBuilder("s")
      .leftJoinAndSelect("s.user", "u")
      .where("s.status = :status", { status: "active" })
      .orderBy("s.updatedAt", "DESC")
      .take(50)
      .getMany();

    const discoverUrl =
      process.env.FRONT_DISCOVER_URL ||
      `${process.env.FRONT_ORIGIN || "http://localhost:3000"}/descubre`;

    let sent = 0;
    for (const s of subs) {
      const u = (s as any).user;
      if (!u?.email) continue;
      if (blocked.has((s as any).id)) continue;

      // En demo puedes forzar envío a un solo correo
      const to = process.env.DEMO_EMAIL || u.email;

      try {
        await this.emails.sendByTemplate(to, "benefits_nudge", {
          name: u.name || "miembro",
          discoverUrl,
        });

        await this.reminderRepo.save(
          this.reminderRepo.create({
            subscriptionId: (s as any).id,
            type: "benefits_nudge",
          }) as any,
        );

        this.logger.log(`benefits_nudge enviado a ${to}`);
        sent++;
      } catch (e: any) {
        this.logger.error(`Error enviando a ${to}: ${e?.message || String(e)}`);
      }
    }
    return sent;
  }

  // ==== Crons programados ====

  /** 🔔 Cada 2 minutos (modo demo) */
  @Cron("*/2 * * * *", { timeZone: CRON_TZ })
  async benefitsEvery2m() {
    this.logger.debug(
      `[CRON 2m] tick mode=${this.mode()} dedup=${this.dedupMinutes()} enabled=${this.cronsEnabled()}`,
    );
    if (!this.cronsEnabled()) return;
    const m = this.mode();
    if (m !== "2m" && m !== "both") return;

    const sent = await this.sendBenefitsNudgeBatch();
    this.logger.log(`[CRON 2m] Enviados: ${sent}`);
  }

  /** 📅 Cada hora (modo normal) */
  @Cron(CronExpression.EVERY_HOUR, { timeZone: CRON_TZ })
  async benefitsHourly() {
    if (!this.cronsEnabled()) return;
    const m = this.mode();
    if (m !== "60m" && m !== "both") return;

    const sent = await this.sendBenefitsNudgeBatch();
    if (sent) this.logger.log(`[CRON 60m] Enviados: ${sent}`);
  }

  /** Endpoint manual (POST /reminders/run-benefits) para pruebas en vivo */
  async runBenefitsOnce() {
    const sent = await this.sendBenefitsNudgeBatch();
    return { ok: true, sent };
  }
}
