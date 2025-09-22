import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Reservation } from '../classes/entities/reservation.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ReviewsSeedService } from './seed/reviews.seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Reservation]),
    SubscriptionsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsSeedService],
  exports: [ReviewsService, ReviewsSeedService],
})
export class ReviewsModule {}
