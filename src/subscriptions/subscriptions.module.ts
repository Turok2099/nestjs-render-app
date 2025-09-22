import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { ActiveSubscriptionGuard } from './guards/active-subscription.guard';
import { PlansModule } from '../plans/plans.module';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), 
  PlansModule],
  controllers: [SubscriptionsController, AdminSubscriptionsController],
  providers: [SubscriptionsService, ActiveSubscriptionGuard],
  exports: [SubscriptionsService, ActiveSubscriptionGuard],
})
export class SubscriptionsModule {}
