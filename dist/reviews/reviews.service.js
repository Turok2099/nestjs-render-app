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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const reservation_entity_1 = require("../classes/entities/reservation.entity");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let ReviewsService = class ReviewsService {
    constructor(reviews, reservations, subs) {
        this.reviews = reviews;
        this.reservations = reservations;
        this.subs = subs;
    }
    async assertUserCanReview(userId) {
        const count = await this.reservations.count({
            where: [
                { userId, status: "booked" },
                { userId, status: "attended" },
            ],
        });
        if (count === 0) {
            throw new common_1.ForbiddenException("Debes haber reservado al menos una clase para reseñar");
        }
    }
    async create(userId, dto) {
        await this.assertUserCanReview(userId);
        const hasActive = await this.subs.hasActive(userId);
        if (!hasActive) {
            throw new common_1.ForbiddenException("Necesitas una suscripción activa para reseñar");
        }
        const entity = this.reviews.create({
            userId,
            rating: dto.rating,
            comment: dto.comment ?? null,
            classId: dto.classId ?? null,
            trainerId: dto.trainerId ?? null,
            status: "pending",
            isActive: true,
        });
        return this.reviews.save(entity);
    }
    async listPublic(q) {
        const page = q.page ?? 1;
        const take = Math.min(q.limit ?? 10, 50);
        const skip = (page - 1) * take;
        const where = { isActive: true, status: "approved" };
        if (q.rating)
            where.rating = q.rating;
        const [items, total] = await this.reviews.findAndCount({
            where,
            relations: { user: true },
            select: {
                id: true,
                userId: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: { id: true, name: true },
            },
            order: q.order === "top"
                ? { rating: "DESC", createdAt: "DESC" }
                : { createdAt: "DESC" },
            take,
            skip,
        });
        return { page, limit: take, total, items };
    }
    async myReviews(userId, q) {
        const page = q.page ?? 1;
        const take = Math.min(q.limit ?? 10, 50);
        const skip = (page - 1) * take;
        const [items, total] = await this.reviews.findAndCount({
            where: { userId, isActive: true },
            order: { createdAt: "DESC" },
            take,
            skip,
        });
        return { page, limit: take, total, items };
    }
    async update(userId, id, dto) {
        const r = await this.reviews.findOne({ where: { id } });
        if (!r || !r.isActive)
            throw new common_1.NotFoundException("Review no encontrada");
        if (r.userId !== userId)
            throw new common_1.ForbiddenException("No puedes editar esta review");
        if (dto.rating !== undefined) {
            if (dto.rating < 1 || dto.rating > 5)
                throw new common_1.BadRequestException("Rating inválido");
            r.rating = dto.rating;
        }
        if (dto.comment !== undefined)
            r.comment = dto.comment ?? null;
        if (dto.classId !== undefined)
            r.classId = dto.classId ?? null;
        if (dto.trainerId !== undefined)
            r.trainerId = dto.trainerId ?? null;
        return this.reviews.save(r);
    }
    async softDelete(userId, id) {
        const r = await this.reviews.findOne({ where: { id } });
        if (!r || !r.isActive)
            throw new common_1.NotFoundException("Review no encontrada");
        if (r.userId !== userId)
            throw new common_1.ForbiddenException("No puedes eliminar esta review");
        r.isActive = false;
        return this.reviews.save(r);
    }
    async adminList(q) {
        const page = q.page ?? 1;
        const take = Math.min(q.limit ?? 10, 100);
        const skip = (page - 1) * take;
        const where = {};
        if (!q.includeInactive || q.includeInactive !== "true")
            where.isActive = true;
        if (q.status)
            where.status = q.status;
        if (q.rating)
            where.rating = q.rating;
        const [items, total] = await this.reviews.findAndCount({
            where,
            order: q.order === "top"
                ? { rating: "DESC", createdAt: "DESC" }
                : { createdAt: "DESC" },
            take,
            skip,
        });
        return { page, limit: take, total, items };
    }
    async adminSetStatus(id, isActive) {
        const r = await this.reviews.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException("Review no encontrada");
        r.isActive = isActive;
        return this.reviews.save(r);
    }
    async adminModerate(id, status) {
        const r = await this.reviews.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException("Review no encontrada");
        r.status = status;
        return this.reviews.save(r);
    }
    async stats() {
        const base = (await this.reviews
            .createQueryBuilder("r")
            .select("COALESCE(AVG(r.rating), 0)", "avg")
            .addSelect("COUNT(*)", "total")
            .where("r.is_active = true")
            .andWhere("r.status = 'approved'")
            .getRawOne()) ?? {
            avg: null,
            total: null,
        };
        const total = Number(base.total ?? 0);
        const average = total ? Number(Number(base.avg ?? 0).toFixed(2)) : 0;
        const rows = await this.reviews
            .createQueryBuilder("r")
            .select("r.rating", "rating")
            .addSelect("COUNT(*)", "count")
            .where("r.is_active = true")
            .andWhere("r.status = 'approved'")
            .groupBy("r.rating")
            .getRawMany();
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        for (const row of rows) {
            distribution[Number(row.rating)] = Number(row.count);
        }
        return { total, average, distribution };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        subscriptions_service_1.SubscriptionsService])
], ReviewsService);
