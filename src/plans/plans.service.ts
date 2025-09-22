import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./entities/plan.entity";
import { Repository } from "typeorm";
import { CreatePlanDto } from "./dto/create-plan-dto";
import { UpdatePlanDto } from "./dto/update-plan-dto";

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>
    ) {}
    
    create(dto: CreatePlanDto) {
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

    async findOne(id: string) {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);
        return plan;
    }

    async update(id: string, dto: UpdatePlanDto) {
        const plan = await this.findOne(id);
        if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);
        Object.assign(plan, dto);
        return this.planRepository.save(plan);
    }

    async remove(id: string) {
        const plan = await this.findOne(id);
        if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);
        return this.planRepository.remove(plan)
    }
}