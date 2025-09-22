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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("./entities/class.entity");
const reservation_entity_1 = require("./entities/reservation.entity");
const user_entity_1 = require("../user/entities/user.entity");
const GOAL_ALIASES = {
    'perder peso': 'weight_loss',
    'bajar de peso': 'weight_loss',
    'definicion': 'definition',
    'definición': 'definition',
    'masa muscular': 'muscle_gain',
    'fuerza': 'muscle_gain',
    'fuerza maxima': 'muscle_gain',
    'fuerza máxima': 'muscle_gain',
    'hipertrofia': 'muscle_gain',
    'resistencia muscular': 'cardio',
    'cardio': 'cardio',
    'movilidad': 'mobility',
};
function normalize(s) {
    if (!s)
        return '';
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function toGoalTag(input) {
    if (!input)
        return undefined;
    const n = normalize(input);
    if (['weight_loss', 'definition', 'muscle_gain', 'mobility', 'cardio'].includes(n))
        return n;
    return GOAL_ALIASES[n];
}
function toPgTime(s) {
    if (!s)
        return undefined;
    return s.length === 5 ? `${s}:00` : s;
}
let ClassesService = class ClassesService {
    constructor(classesRepo, resRepo, usersRepo) {
        this.classesRepo = classesRepo;
        this.resRepo = resRepo;
        this.usersRepo = usersRepo;
    }
    async create(dto) {
        if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        const entity = this.classesRepo.create({
            title: dto.title,
            trainerId: dto.trainerId,
            date: dto.date,
            startTime: toPgTime(dto.startTime),
            endTime: toPgTime(dto.endTime),
            capacity: dto.capacity ?? 20,
            goalTag: dto.goalTag ?? null,
            coach: dto.coach ?? null,
            isActive: dto.isActive ?? true,
        });
        entity.setDateWithDayOfWeek(dto.date);
        return this.classesRepo.save(entity);
    }
    async findAll() {
        const classes = await this.classesRepo.find();
        return classes.map((c) => ({
            id: c.id,
            name: c.title,
            title: c.title,
            date: c.date,
            startTime: c.startTime,
            endTime: c.endTime,
            dayOfWeek: c.dayOfWeek,
            coach: c.coach ?? [],
            capacity: c.capacity,
            createdAt: c.createdAt,
        }));
    }
    async findByDay(dayOfWeek) {
        return this.classesRepo.find({
            where: { dayOfWeek: dayOfWeek, isActive: true },
            order: { startTime: 'ASC' },
        });
    }
    async findById(id) {
        const classEntity = await this.classesRepo.findOne({ where: { id } });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID ${id} not found`);
        }
        return classEntity;
    }
    async schedule(q) {
        const page = Number(q.page || 1);
        const take = Math.min(Number(q.limit || 10), 50);
        const skip = (page - 1) * take;
        const where = { isActive: true };
        const tag = toGoalTag(q.goal);
        if (tag)
            where.goalTag = tag;
        if (q.trainerId)
            where.trainerId = q.trainerId;
        if (q.date)
            where.date = q.date;
        let startRange;
        let endRange;
        if (q.timeOfDay === 'morning') {
            startRange = toPgTime('05:00');
            endRange = toPgTime('12:00');
        }
        if (q.timeOfDay === 'afternoon') {
            startRange = toPgTime('12:00');
            endRange = toPgTime('18:00');
        }
        if (q.timeOfDay === 'evening') {
            startRange = toPgTime('18:00');
            endRange = toPgTime('23:00');
        }
        const timeFilter = (startRange && endRange) ? { startTime: (0, typeorm_2.Between)(startRange, endRange) } : {};
        const [items, total] = await this.classesRepo.findAndCount({
            where: { ...where, ...timeFilter },
            order: { date: 'ASC', startTime: 'ASC' },
            skip, take,
        });
        const ids = items.map((c) => c.id);
        const counts = ids.length
            ? await this.resRepo
                .createQueryBuilder('r')
                .select('r.class_id', 'classId')
                .addSelect("SUM(CASE WHEN r.status = 'booked' THEN 1 ELSE 0 END)", 'booked')
                .where('r.class_id IN (:...ids)', { ids })
                .groupBy('r.class_id')
                .getRawMany()
            : [];
        const byId = new Map(counts.map((c) => [c.classId, Number(c.booked)]));
        const mapped = items.map((c) => {
            const occupied = byId.get(c.id) || 0;
            return {
                id: c.id,
                title: c.title,
                date: c.date,
                startTime: c.startTime,
                endTime: c.endTime,
                capacity: c.capacity,
                occupied,
                available: Math.max(c.capacity - occupied, 0),
                goalTag: c.goalTag,
                trainerId: c.trainerId,
            };
        });
        return { page, limit: take, total, items: mapped };
    }
    async getActiveClassOrThrow(classId) {
        const cls = await this.classesRepo.findOne({ where: { id: classId, isActive: true } });
        if (!cls)
            throw new common_1.BadRequestException('Class not found or inactive');
        return cls;
    }
    async adminList(q) {
        const base = await this.schedule({ ...q, goal: q.goal });
        if (q.includeInactive === 'true') {
            const where = {};
            const tag = toGoalTag(q.goal);
            if (tag)
                where.goalTag = tag;
            if (q.trainerId)
                where.trainerId = q.trainerId;
            if (q.date)
                where.date = q.date;
            const [inactive, count] = await this.classesRepo.findAndCount({
                where: { ...where, isActive: false },
                order: { date: 'ASC', startTime: 'ASC' },
            });
            const ids = inactive.map((c) => c.id);
            if (ids.length) {
                const counts = await this.resRepo
                    .createQueryBuilder('r')
                    .select('r.class_id', 'classId')
                    .addSelect("SUM(CASE WHEN r.status = 'booked' THEN 1 ELSE 0 END)", 'booked')
                    .where('r.class_id IN (:...ids)', { ids })
                    .groupBy('r.class_id')
                    .getRawMany();
                const byId = new Map(counts.map((c) => [c.classId, Number(c.booked)]));
                base.items.push(...inactive.map((c) => ({
                    id: c.id,
                    title: c.title,
                    date: c.date,
                    startTime: c.startTime,
                    endTime: c.endTime,
                    capacity: c.capacity,
                    occupied: byId.get(c.id) || 0,
                    available: Math.max(c.capacity - (byId.get(c.id) || 0), 0),
                    goalTag: c.goalTag,
                    trainerId: c.trainerId,
                    isActive: c.isActive,
                })));
                base.total += count;
            }
        }
        return base;
    }
    async adminUpdate(id, dto) {
        const cls = await this.classesRepo.findOne({ where: { id } });
        if (!cls)
            throw new common_1.BadRequestException('Class not found');
        Object.assign(cls, dto);
        if (cls.startTime && cls.endTime && cls.startTime >= cls.endTime) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        if (dto.startTime)
            cls.startTime = toPgTime(dto.startTime);
        if (dto.endTime)
            cls.endTime = toPgTime(dto.endTime);
        if (dto.date)
            cls.setDateWithDayOfWeek(dto.date);
        return this.classesRepo.save(cls);
    }
    async adminSetStatus(id, isActive) {
        const ok = await this.classesRepo.update({ id }, { isActive });
        if (!ok.affected)
            throw new common_1.BadRequestException('Class not found');
        return { id, isActive };
    }
    async classReservationsFor(user, classId) {
        const cls = await this.classesRepo.findOne({ where: { id: classId } });
        if (!cls)
            throw new common_1.BadRequestException('Class not found');
        if (user.role !== 'admin' && cls.trainerId !== user.userId) {
            throw new common_1.ForbiddenException('Not allowed');
        }
        const res = await this.resRepo.find({
            where: { classId, status: (0, typeorm_2.In)(['booked', 'attended', 'no_show']) },
        });
        if (!res.length)
            return [];
        return res.map((r) => ({
            reservationId: r.id,
            userId: r.userId,
            status: r.status,
            createdAt: r.createdAt,
        }));
    }
    async adminToggle(id, isActive) {
        return this.adminSetStatus(id, isActive);
    }
    async adminAssignTrainer(id, trainerId) {
        const ok = await this.classesRepo.update({ id }, { trainerId });
        if (!ok.affected)
            throw new common_1.BadRequestException('Class not found');
        const updated = await this.classesRepo.findOne({ where: { id } });
        return updated;
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassesService);
