"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCreateSubscriptionDto = exports.CreateSubscriptionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSubscriptionDto {
}
exports.CreateSubscriptionDto = CreateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid', description: 'ID del plan a comprar' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "planId", void 0);
const swagger_2 = require("@nestjs/swagger");
const class_validator_2 = require("class-validator");
class AdminCreateSubscriptionDto {
}
exports.AdminCreateSubscriptionDto = AdminCreateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid', description: 'Usuario destino' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminCreateSubscriptionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ format: 'uuid', description: 'Plan asociado (opcional)' }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminCreateSubscriptionDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ description: 'Duración en días (si no se envía y hay plan, se usa la del plan; si no, 30)' }),
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsInt)(),
    (0, class_validator_2.Min)(1),
    __metadata("design:type", Number)
], AdminCreateSubscriptionDto.prototype, "durationDays", void 0);
