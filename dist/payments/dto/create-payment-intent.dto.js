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
exports.CreatePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Monto del pago',
        example: 20.0,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Moneda del pago',
        example: 'usd',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del plan (opcional)',
        example: 'uuid-del-plan',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción del pago',
        example: 'Membresía Premium - TrainUp Gym',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "description", void 0);
