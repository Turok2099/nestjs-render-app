import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { SubscriptionReminder } from './entities/subscription-reminder.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

import { EmailsModule } from '../emails/emails.module';
import { UsersModule } from '../user/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionReminder,
      Subscription, // ⬅️ importante para @InjectRepository(Subscription)
    ]),
    EmailsModule,
    UsersModule,
    SubscriptionsModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
