"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const luxon_1 = require("luxon");
const emails_service_1 = require("../emails/emails.service");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const subscription_reminder_entity_1 = require("./entities/subscription-reminder.entity");
let RemindersService = RemindersService_1 = class RemindersService {
    constructor(subsRepo, reminderRepo, emails) {
        this.subsRepo = subsRepo;
        this.reminderRepo = reminderRepo;
        this.emails = emails;
        this.logger = new common_1.Logger(RemindersService_1.name);
    }
    cronsEnabled() {
        return (process.env.CRON_ENABLED ?? '1') !== '0';
    }
    mode() {
        const m = (process.env.REMINDERS_BENEFITS_MODE || 'both').toLowerCase();
        return (m === '10m' || m === '60m' || m === 'both') ? m : 'both';
    }
    tz() {
        return process.env.CRON_TZ || 'America/Mexico_City';
    }
    async sendBenefitsNudgeBatch() {
        const since = luxon_1.DateTime.now().setZone(this.tz()).minus({ hours: 24 }).toJSDate();
        const already = await this.reminderRepo.find({
            where: { type: 'benefits_nudge', createdAt: (0, typeorm_2.MoreThan)(since) },
            select: { subscriptionId: true },
        });
        const blocked = new Set(already.map((r) => r.subscriptionId));
        const subs = await this.subsRepo
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.user', 'u')
            .where('s.status = :status', { status: 'active' })
            .limit(50)
            .getMany();
        const discoverUrl = process.env.FRONT_DISCOVER_URL ||
            `${process.env.FRONT_ORIGIN || 'http://localhost:3000'}/descubre`;
        let sent = 0;
        for (const s of subs) {
            const u = s.user;
            if (!u?.email)
                continue;
            if (blocked.has(s.id))
                continue;
            try {
                await this.emails.sendByTemplate(u.email, 'benefits_nudge', {
                    name: u.name || 'miembro',
                    discoverUrl,
                });
                await this.reminderRepo.save(this.reminderRepo.create({
                    subscriptionId: s.id,
                    type: 'benefits_nudge',
                }));
                this.logger.log(`benefits_nudge enviado a ${u.email}`);
                sent++;
            }
            catch (e) {
                this.logger.error(`Error enviando a ${u?.email}: ${e?.message || String(e)}`);
            }
        }
        return sent;
    }
    async benefitsEvery10m() {
        if (!this.cronsEnabled())
            return;
        const m = this.mode();
        if (m !== '10m' && m !== 'both')
            return;
        const sent = await this.sendBenefitsNudgeBatch();
        if (sent)
            this.logger.log(`[CRON 10m] Enviados: ${sent}`);
    }
    async benefitsHourly() {
        if (!this.cronsEnabled())
            return;
        const m = this.mode();
        if (m !== '60m' && m !== 'both')
            return;
        const sent = await this.sendBenefitsNudgeBatch();
        if (sent)
            this.logger.log(`[CRON 60m] Enviados: ${sent}`);
    }
    async runBenefitsOnce() {
        const sent = await this.sendBenefitsNudgeBatch();
        return { ok: true, sent };
    }
};
exports.RemindersService = RemindersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "benefitsEvery10m", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "benefitsHourly", null);
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_reminder_entity_1.SubscriptionReminder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        emails_service_1.EmailsService])
], RemindersService);
