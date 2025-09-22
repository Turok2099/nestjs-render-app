import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { Reservation } from '../classes/entities/reservation.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    private readonly subs: SubscriptionsService,
  ) {}

  // Debe tener al menos una reserva (booked o attended)
  private async assertUserCanReview(userId: string) {
    const count = await this.reservations.count({
      where: [
        { userId, status: 'booked' as any },
        { userId, status: 'attended' as any },
      ],
    });
    if (count === 0) {
      throw new ForbiddenException(
        'Debes haber reservado al menos una clase para reseñar',
      );
    }
  }

  async create(userId: string, dto: CreateReviewDto) {
    await this.assertUserCanReview(userId);

    // Exigir suscripción activa al momento de reseñar
    const hasActive = await this.subs.hasActive(userId);
    if (!hasActive) {
      throw new ForbiddenException(
        'Necesitas una suscripción activa para reseñar',
      );
    }

    const entity = this.reviews.create({
      userId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      classId: dto.classId ?? null,
      trainerId: dto.trainerId ?? null,
      status: 'approved', // Cambia a 'pending' si quieres moderación manual
      isActive: true,
    });
    return this.reviews.save(entity);
  }

  async listPublic(q: ReviewsQueryDto) {
    const page = q.page ?? 1;
    const take = Math.min(q.limit ?? 10, 50);
    const skip = (page - 1) * take;

    const where: any = { isActive: true, status: 'approved' as const };
    if (q.rating) where.rating = q.rating;

    const [items, total] = await this.reviews.findAndCount({
      where,
      relations: { user: true },                  // ✅ NEW
    select: {                                   // ✅ NEW
      id: true,
      userId: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { id: true, name: true },           // ✅ sólo lo necesario
    },
      order:
        q.order === 'top'
          ? { rating: 'DESC', createdAt: 'DESC' }
          : { createdAt: 'DESC' },
      take,
      skip,
    });

    return { page, limit: take, total, items };
  }

  async myReviews(userId: string, q: ReviewsQueryDto) {
    const page = q.page ?? 1;
    const take = Math.min(q.limit ?? 10, 50);
    const skip = (page - 1) * take;

    const [items, total] = await this.reviews.findAndCount({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    return { page, limit: take, total, items };
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    const r = await this.reviews.findOne({ where: { id } });
    if (!r || !r.isActive) throw new NotFoundException('Review no encontrada');
    if (r.userId !== userId)
      throw new ForbiddenException('No puedes editar esta review');

    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5)
        throw new BadRequestException('Rating inválido');
      r.rating = dto.rating;
    }
    if (dto.comment !== undefined) r.comment = dto.comment ?? null;
    if (dto.classId !== undefined) r.classId = dto.classId ?? null;
    if (dto.trainerId !== undefined) r.trainerId = dto.trainerId ?? null;

    return this.reviews.save(r);
  }

  async softDelete(userId: string, id: string) {
    const r = await this.reviews.findOne({ where: { id } });
    if (!r || !r.isActive) throw new NotFoundException('Review no encontrada');
    if (r.userId !== userId)
      throw new ForbiddenException('No puedes eliminar esta review');

    r.isActive = false;
    return this.reviews.save(r);
  }

  // ---------- Admin ----------
  async adminList(
    q: ReviewsQueryDto & {
      includeInactive?: string;
      status?: 'approved' | 'pending' | 'rejected';
    },
  ) {
    const page = q.page ?? 1;
    const take = Math.min(q.limit ?? 10, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (!q.includeInactive || q.includeInactive !== 'true') where.isActive = true;
    if (q.status) where.status = q.status;
    if (q.rating) where.rating = q.rating;

    const [items, total] = await this.reviews.findAndCount({
      where,
      order:
        q.order === 'top'
          ? { rating: 'DESC', createdAt: 'DESC' }
          : { createdAt: 'DESC' },
      take,
      skip,
    });
    return { page, limit: take, total, items };
  }

  async adminSetStatus(id: string, isActive: boolean) {
    const r = await this.reviews.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Review no encontrada');
    r.isActive = isActive;
    return this.reviews.save(r);
  }

  async adminModerate(id: string, status: 'approved' | 'rejected') {
    const r = await this.reviews.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Review no encontrada');
    r.status = status;
    return this.reviews.save(r);
  }

  // ---------- Stats públicas ----------
  async stats() {
    // Promedio y total (getRawOne puede devolver undefined; se protege con ??)
    const base =
      (await this.reviews
        .createQueryBuilder('r')
        .select('COALESCE(AVG(r.rating), 0)', 'avg')
        .addSelect('COUNT(*)', 'total')
        .where('r.is_active = true')
        .andWhere("r.status = 'approved'")
        .getRawOne<{ avg: string | null; total: string | null }>()) ??
      { avg: null, total: null };

    const total = Number(base.total ?? 0);
    const average = total ? Number(Number(base.avg ?? 0).toFixed(2)) : 0;

    // Distribución 1..5
    const rows = await this.reviews
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.is_active = true')
      .andWhere("r.status = 'approved'")
      .groupBy('r.rating')
      .getRawMany<{ rating: string; count: string }>();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      distribution[Number(row.rating)] = Number(row.count);
    }

    return { total, average, distribution };
  }
}
