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
exports.ReviewsSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const reservation_entity_1 = require("../../classes/entities/reservation.entity");
const reviews_front_mock_1 = require("./reviews.front-mock");
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
let ReviewsSeedService = class ReviewsSeedService {
    constructor(reviewsRepo, reservationsRepo) {
        this.reviewsRepo = reviewsRepo;
        this.reservationsRepo = reservationsRepo;
    }
    async run(maxTotal = 30) {
        const reservations = await this.reservationsRepo.find({
            where: [{ status: 'booked' }, { status: 'attended' }],
            take: 500,
            order: { createdAt: 'DESC' },
        });
        if (reservations.length === 0) {
            console.log('ReviewsSeed: no hay reservas, nada para sembrar');
            return { created: 0, skipped: 0 };
        }
        const byUser = new Map();
        for (const r of reservations) {
            if (!byUser.has(r.userId))
                byUser.set(r.userId, []);
            byUser.get(r.userId).push(r);
        }
        const userIds = Array.from(byUser.keys());
        const existing = await this.reviewsRepo.find({
            where: { userId: (0, typeorm_2.In)(userIds), isActive: true },
            select: ['id', 'userId'],
        });
        const already = new Set(existing.map(e => e.userId));
        let created = 0;
        let skipped = 0;
        for (const userId of userIds) {
            if (created >= maxTotal)
                break;
            if (already.has(userId)) {
                skipped++;
                continue;
            }
            const sample = pick(reviews_front_mock_1.reviewSamples);
            const anyRes = pick(byUser.get(userId));
            const entity = this.reviewsRepo.create({
                userId,
                rating: sample.rating,
                comment: sample.comment,
                classId: anyRes.classId,
                trainerId: null,
                status: 'approved',
                isActive: true,
            });
            await this.reviewsRepo.save(entity);
            created++;
        }
        console.log(`ReviewsSeed: created=${created}, skipped=${skipped}`);
        return { created, skipped };
    }
};
exports.ReviewsSeedService = ReviewsSeedService;
exports.ReviewsSeedService = ReviewsSeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsSeedService);
