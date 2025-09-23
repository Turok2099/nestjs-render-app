"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("./config/typeorm");
const plans_module_1 = require("./plans/plans.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./user/users.module");
const emails_module_1 = require("./emails/emails.module");
const classes_module_1 = require("./classes/classes.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const reviews_module_1 = require("./reviews/reviews.module");
const stripe_module_1 = require("./stripe/stripe.module");
const payments_module_1 = require("./payments/payments.module");
const health_module_1 = require("./health/health.module");
const exercises_module_1 = require("./exercises/exercises.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env.development",
                load: [typeorm_2.typeOrmConfig],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => configService.get("typeorm"),
            }),
            schedule_1.ScheduleModule.forRoot(),
            plans_module_1.PlansModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            emails_module_1.EmailsModule,
            subscriptions_module_1.SubscriptionsModule,
            classes_module_1.ClassesModule,
            reviews_module_1.ReviewsModule,
            stripe_module_1.StripeModule,
            payments_module_1.PaymentsModule,
            health_module_1.HealthModule,
            exercises_module_1.ExercisesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
