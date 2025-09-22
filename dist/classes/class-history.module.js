"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_history_controller_1 = require("./class-history.controller");
const class_history_service_1 = require("./class-history.service");
const class_history_entity_1 = require("./entities/class-history.entity");
const users_module_1 = require("../user/users.module");
const classes_module_1 = require("../classes/classes.module");
let ClassHistoryModule = class ClassHistoryModule {
};
exports.ClassHistoryModule = ClassHistoryModule;
exports.ClassHistoryModule = ClassHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([class_history_entity_1.ClassHistory]),
            users_module_1.UsersModule,
            classes_module_1.ClassesModule,
        ],
        controllers: [class_history_controller_1.ClassHistoryController],
        providers: [class_history_service_1.ClassHistoryService],
        exports: [class_history_service_1.ClassHistoryService],
    })
], ClassHistoryModule);
