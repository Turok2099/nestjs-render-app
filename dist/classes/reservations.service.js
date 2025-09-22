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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("./entities/class.entity");
const reservation_entity_1 = require("./entities/reservation.entity");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let ReservationsService = class ReservationsService {
    constructor(classesRepo, resRepo, subs) {
        this.classesRepo = classesRepo;
        this.resRepo = resRepo;
        this.subs = subs;
    }
    async book(userId, classId) {
        const cls = await this.classesRepo.findOne({
            where: { id: classId, isActive: true },
        });
        if (!cls)
            throw new common_1.NotFoundException('Clase no encontrada o inactiva');
        const has = await this.subs.hasActive(userId);
        if (!has) {
            throw new common_1.ForbiddenException('Necesitas una suscripción activa para reservar');
        }
        const existing = await this.resRepo.findOne({ where: { userId, classId } });
        if (existing && existing.status === 'booked') {
            throw new common_1.BadRequestException('Ya tienes una reserva para esta clase');
        }
        const bookedCount = await this.resRepo.count({
            where: { classId, status: 'booked' },
        });
        if (bookedCount >= cls.capacity) {
            throw new common_1.BadRequestException('La clase está llena');
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
    async cancelMine(userId, classId) {
        const existing = await this.resRepo.findOne({
            where: { userId, classId, status: 'booked' },
        });
        if (!existing) {
            throw new common_1.NotFoundException('No tienes una reserva activa para esta clase');
        }
        existing.status = 'cancelled';
        const saved = await this.resRepo.save(existing);
        return { reservationId: saved.id, status: saved.status };
    }
    async setStatusAsTrainerOrAdmin(user, classId, reservationId, status) {
        const allowed = ['attended', 'no_show', 'cancelled', 'booked'];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException('Estado inválido');
        }
        const cls = await this.classesRepo.findOne({ where: { id: classId } });
        if (!cls)
            throw new common_1.NotFoundException('Clase no encontrada');
        if (user.role !== 'admin' && cls.trainerId !== user.userId) {
            throw new common_1.ForbiddenException('No autorizado');
        }
        const res = await this.resRepo.findOne({ where: { id: reservationId, classId } });
        if (!res)
            throw new common_1.NotFoundException('Reserva no encontrada');
        res.status = status;
        const saved = await this.resRepo.save(res);
        return { reservationId: saved.id, status: saved.status };
    }
    async userHistory(userId, page = 1, limit = 10, status) {
        const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
        const where = { userId };
        if (status)
            where.status = status;
        const [rows, total] = await this.resRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
        if (!rows.length)
            return { page, limit: take, total, items: [] };
        const classIds = [...new Set(rows.map((r) => r.classId))];
        const classes = classIds.length
            ? await this.classesRepo.findBy({ id: (0, typeorm_2.In)(classIds) })
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
    async findByUser(userId, q) {
        return this.userHistory(userId, q?.page ?? 1, q?.limit ?? 10, q?.status);
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        subscriptions_service_1.SubscriptionsService])
], ReservationsService);
