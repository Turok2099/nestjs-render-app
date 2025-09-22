import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassHistory } from './entities/class-history.entity';
import { Class } from './entities/class.entity';

export type ClassHistoryResponseDto = {
  id: string;
  class: string;   // título de la clase
  date: string;    // yyyy-mm-dd (tomado de Class.date)
};

@Injectable()
export class ClassHistoryService {
  constructor(
    @InjectRepository(ClassHistory)
    private readonly classHistoryRepository: Repository<ClassHistory>,
  @InjectRepository(Class)
    private readonly classesRepo: Repository<Class>,
  ) {}

  async add(
    userId: string,
    classId: string,
    status: 'attended' | 'missed' | 'cancelled' = 'attended',
  ) {
    const entity = this.classHistoryRepository.create({
      userId,
      classId,
      status,
    });
    return this.classHistoryRepository.save(entity);
  }

  async listForUser(userId: string): Promise<ClassHistoryResponseDto[]> {
    const rows = await this.classHistoryRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.class', 'c')
      .where('h.user_id = :userId', { userId })
      .orderBy('c.date', 'DESC')
      .addOrderBy('c.start_time', 'DESC')
      .getMany();

    return rows.map((h) => ({
      id: h.id,
      class: h.class?.title ?? '',
      date: h.class?.date ?? '',
    }));
  }

  async create(
    userId: string,
    dto: { classId: string; status?: 'attended' | 'missed' | 'cancelled' } | any,
  ) {
    return this.add(userId, dto.classId, dto.status ?? 'attended');
  }

  async findByUser(userId: string) {
    return this.listForUser(userId);
  }
}
