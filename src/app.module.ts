import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { typeOrmConfig } from "./config/typeorm";
import { PlansModule } from "./plans/plans.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./user/users.module";
import { EmailsModule } from "./emails/emails.module";
import { ClassesModule } from "./classes/classes.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { StripeModule } from "./stripe/stripe.module";
import { PaymentsModule } from "./payments/payments.module";
import { HealthModule } from "./health/health.module";
import { ExercisesModule } from "./exercises/exercises.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? ".env.development" : undefined,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get("typeorm")!,
    }),
    ScheduleModule.forRoot(),
    PlansModule,
    UsersModule,
    AuthModule,
    EmailsModule,
    SubscriptionsModule,
    ClassesModule,
    ReviewsModule,
    StripeModule,
    PaymentsModule,
    HealthModule,
    ExercisesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
