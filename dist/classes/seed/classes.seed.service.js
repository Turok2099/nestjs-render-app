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
var ClassesSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../entities/class.entity");
const user_entity_1 = require("../../user/entities/user.entity");
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
    if (['weight_loss', 'definition', 'muscle_gain', 'mobility', 'cardio'].includes(n)) {
        return n;
    }
    return GOAL_ALIASES[n];
}
let ClassesSeedService = ClassesSeedService_1 = class ClassesSeedService {
    constructor(classesRepo, usersRepo) {
        this.classesRepo = classesRepo;
        this.usersRepo = usersRepo;
        this.log = new common_1.Logger(ClassesSeedService_1.name);
    }
    async run() {
        const countActive = await this.classesRepo.count({ where: { isActive: true } });
        if (countActive >= 10) {
            this.log.log('Skip seed: ya existen 10 clases activas');
            return;
        }
        const trainers = await this.usersRepo.find({
            where: { role: (0, typeorm_2.In)(['trainer', 'admin']) },
            take: 20,
        });
        if (!trainers.length) {
            this.log.warn('No hay usuarios con rol trainer/admin; no se crearán clases.');
            return;
        }
        const sample = [
            { title: 'Cardio', date: this.offsetDate(-2), startTime: '08:00:00', endTime: '09:00:00', coach: ['Ana'], goal: 'cardio' },
            { title: 'Spinning', date: this.offsetDate(-1), startTime: '09:30:00', endTime: '10:30:00', coach: ['Luis'], goal: 'cardio' },
            { title: 'Zumba', date: this.offsetDate(0), startTime: '07:00:00', endTime: '08:00:00', coach: ['Mia'], goal: 'movilidad' },
            { title: 'Powerlifting', date: this.offsetDate(1), startTime: '10:00:00', endTime: '11:30:00', coach: ['Joe'], goal: 'fuerza' },
            { title: 'Pilates', date: this.offsetDate(2), startTime: '18:00:00', endTime: '19:00:00', coach: ['Katy'], goal: 'movilidad' },
            { title: 'Funcional', date: this.offsetDate(-3), startTime: '17:00:00', endTime: '18:00:00', coach: ['Leo'], goal: 'masa muscular' },
            { title: 'FullBody', date: this.offsetDate(-2), startTime: '12:00:00', endTime: '13:00:00', coach: ['Ana'], goal: 'muscle_gain' },
            { title: 'Stretching', date: this.offsetDate(-1), startTime: '20:00:00', endTime: '21:00:00', coach: ['Mia'], goal: 'movilidad' },
            { title: 'HIIT', date: this.offsetDate(3), startTime: '06:30:00', endTime: '07:15:00', coach: ['Luis'], goal: 'cardio' },
            { title: 'Boxeo', date: this.offsetDate(4), startTime: '19:00:00', endTime: '20:30:00', coach: ['Joe'], goal: 'cardio' },
        ];
        let created = 0;
        for (let i = 0; i < sample.length; i++) {
            const item = sample[i];
            const title = item.title ?? item.name ?? item.nombre;
            const date = item.date ?? item.fecha;
            const startTime = item.startTime ?? item.horaInicio;
            const endTime = item.endTime ?? item.horaFin;
            const coach = Array.isArray(item.coach)
                ? item.coach
                : (typeof item.coach === 'string' ? [item.coach] : []);
            const goalTag = toGoalTag(item.goal ?? item.objetivo) ?? null;
            const trainer = trainers[i % trainers.length];
            const exists = await this.classesRepo.findOne({
                where: { title, trainerId: trainer.id, date, startTime },
            });
            if (exists)
                continue;
            const entity = this.classesRepo.create({
                title,
                trainerId: trainer.id,
                date,
                startTime,
                endTime,
                capacity: 20,
                goalTag,
                coach,
                isActive: true,
            });
            entity.setDateWithDayOfWeek(date);
            await this.classesRepo.save(entity);
            created++;
        }
        this.log.log(`Seed clases: creadas=${created}, totalActual=${await this.classesRepo.count()}`);
    }
    offsetDate(daysFromToday) {
        const d = new Date();
        d.setDate(d.getDate() + daysFromToday);
        return d.toISOString().slice(0, 10);
    }
};
exports.ClassesSeedService = ClassesSeedService;
exports.ClassesSeedService = ClassesSeedService = ClassesSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ClassesSeedService);
