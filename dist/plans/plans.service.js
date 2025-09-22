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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const plan_entity_1 = require("./entities/plan.entity");
const typeorm_2 = require("typeorm");
let PlansService = class PlansService {
    constructor(planRepository) {
        this.planRepository = planRepository;
    }
    create(dto) {
        const plan = this.planRepository.create({
            name: dto.name,
            price: dto.price,
            durationDays: dto.durationDays,
            description: dto.description ?? null,
        });
        return this.planRepository.save(plan);
    }
    async findAll() {
        const plans = await this.planRepository.find();
        if (plans.length === 0) {
            return { message: 'No plans were found :(' };
        }
        return plans;
    }
    async findOne(id) {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        return plan;
    }
    async update(id, dto) {
        const plan = await this.findOne(id);
        if (!plan)
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        Object.assign(plan, dto);
        return this.planRepository.save(plan);
    }
    async remove(id) {
        const plan = await this.findOne(id);
        if (!plan)
            throw new common_1.NotFoundException(`Plan with id ${id} not found`);
        return this.planRepository.remove(plan);
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plan_entity_1.Plan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansService);
