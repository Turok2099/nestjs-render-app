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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const plans_service_1 = require("../plans/plans.service");
let SubscriptionsService = class SubscriptionsService {
    constructor(subsRepo, plans) {
        this.subsRepo = subsRepo;
        this.plans = plans;
    }
    now() {
        return new Date();
    }
    async hasActive(userId) {
        const now = this.now();
        const active = await this.subsRepo.findOne({
            where: { userId, status: 'active', endAt: (0, typeorm_2.MoreThan)(now) },
            order: { endAt: 'DESC' },
        });
        return !!active;
    }
    async statusFor(userId) {
        const now = this.now();
        const sub = await this.subsRepo.findOne({
            where: { userId, status: 'active', endAt: (0, typeorm_2.MoreThan)(now) },
            order: { endAt: 'DESC' },
        });
        if (!sub) {
            const last = await this.subsRepo.findOne({
                where: { userId, endAt: (0, typeorm_2.LessThan)(now) },
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
    async createFromPlan(userId, planId) {
        const plan = await this.plans.findOne(planId);
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return this.extendOrCreate(userId, plan.durationDays, plan.id);
    }
    async createAdmin(dto) {
        let duration = dto.durationDays;
        let effectivePlanId = dto.planId ?? null;
        if (!duration && dto.planId) {
            const plan = await this.plans.findOne(dto.planId);
            if (!plan)
                throw new common_1.NotFoundException('Plan not found');
            duration = plan.durationDays;
            effectivePlanId = plan.id;
        }
        duration = duration ?? 30;
        return this.extendOrCreate(dto.userId, duration, effectivePlanId);
    }
    async extendOrCreate(userId, durationDays, planId) {
        const now = this.now();
        const existing = await this.subsRepo.findOne({
            where: { userId, status: 'active', endAt: (0, typeorm_2.MoreThan)(now) },
            order: { endAt: 'DESC' },
        });
        if (existing) {
            existing.endAt = new Date(existing.endAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
            if (planId)
                existing.planId = planId;
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
    async cancel(id) {
        const sub = await this.subsRepo.findOne({ where: { id } });
        if (!sub)
            throw new common_1.BadRequestException('Subscription not found');
        sub.status = 'cancelled';
        return this.subsRepo.save(sub);
    }
    async adminList(q) {
        const page = q.page ? Number(q.page) : 1;
        const limit = q.limit ? Number(q.limit) : 20;
        const where = {};
        if (q.status)
            where.status = q.status;
        if (q.userId)
            where.userId = q.userId;
        if (q.planId)
            where.planId = q.planId;
        const [sortField, sortDir] = (q.sort || 'createdAt:DESC').split(':');
        const order = { [sortField]: sortDir };
        const [data, total] = await this.subsRepo.findAndCount({
            where,
            order,
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
    async adminChangeStatus(id, dto) {
        const sub = await this.subsRepo.findOne({ where: { id } });
        if (!sub)
            throw new common_1.NotFoundException('Subscripción no encontrada');
        sub.status = dto.status;
        return this.subsRepo.save(sub);
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        plans_service_1.PlansService])
], SubscriptionsService);
