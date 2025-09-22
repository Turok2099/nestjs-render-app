import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Reservation } from '../../classes/entities/reservation.entity';
import { reviewSamples } from './reviews.front-mock';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Injectable()
export class ReviewsSeedService {
  constructor(
    @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Reservation) private readonly reservationsRepo: Repository<Reservation>,
  ) {}

  async run(maxTotal = 30) {
    //Usuarios con reservas válidas
    const reservations = await this.reservationsRepo.find({
      where: [{ status: 'booked' as any }, { status: 'attended' as any }],
      take: 500,
      order: { createdAt: 'DESC' },
    });
    if (reservations.length === 0) {
      console.log('ReviewsSeed: no hay reservas, nada para sembrar');
      return { created: 0, skipped: 0 };
    }

    const byUser = new Map<string, Reservation[]>();
    for (const r of reservations) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, []);
      byUser.get(r.userId)!.push(r);
    }

    const userIds = Array.from(byUser.keys());
    // 2) ¿Quién ya tiene reseñas activas?
    const existing = await this.reviewsRepo.find({
      where: { userId: In(userIds), isActive: true },
      select: ['id', 'userId'],
    });
    const already = new Set(existing.map(e => e.userId));

    let created = 0;
    let skipped = 0;

    for (const userId of userIds) {
      if (created >= maxTotal) break;

      if (already.has(userId)) {
        skipped++;
        continue;
      }

      const sample = pick(reviewSamples);
      const anyRes = pick(byUser.get(userId)!); 

      const entity = this.reviewsRepo.create({
        userId,
        rating: sample.rating,
        comment: sample.comment,
        classId: anyRes.classId,
        trainerId: null,
        status: 'approved', // para que salga en público
        isActive: true,
      });

      await this.reviewsRepo.save(entity);
      created++;
    }

    console.log(`ReviewsSeed: created=${created}, skipped=${skipped}`);
    return { created, skipped };
  }
}
