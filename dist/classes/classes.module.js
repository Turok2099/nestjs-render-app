"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_entity_1 = require("./entities/class.entity");
const reservation_entity_1 = require("./entities/reservation.entity");
const classes_service_1 = require("./classes.service");
const reservations_service_1 = require("./reservations.service");
const classes_controller_1 = require("./classes.controller");
const reservations_controller_1 = require("./reservations.controller");
const user_entity_1 = require("../user/entities/user.entity");
const classes_seed_service_1 = require("./seed/classes.seed.service");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const class_history_entity_1 = require("./entities/class-history.entity");
const reservations_me_controller_1 = require("./reservations.me.controller");
const reservations_user_controller_1 = require("./reservations.user.controller");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let ClassesModule = class ClassesModule {
};
exports.ClassesModule = ClassesModule;
exports.ClassesModule = ClassesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([class_entity_1.Class, reservation_entity_1.Reservation, user_entity_1.User, class_history_entity_1.ClassHistory]),
            subscriptions_module_1.SubscriptionsModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [
            classes_controller_1.ClassesController,
            reservations_controller_1.ReservationsController,
            reservations_me_controller_1.ReservationsMeController,
            reservations_user_controller_1.ReservationsUserController,
        ],
        providers: [classes_service_1.ClassesService, reservations_service_1.ReservationsService, classes_seed_service_1.ClassesSeedService],
        exports: [reservations_service_1.ReservationsService, classes_service_1.ClassesService],
    })
], ClassesModule);
