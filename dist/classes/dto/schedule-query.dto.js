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
exports.ScheduleQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const toUndefIfEmpty = ({ value }) => value === '' || value === null || value === undefined ? undefined : value;
const toNumberOrUndef = ({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value);
class ScheduleQueryDto {
}
exports.ScheduleQueryDto = ScheduleQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: [
            'weight_loss', 'definition', 'muscle_gain', 'mobility', 'cardio',
            'Fuerza máxima', 'Hipertrofia', 'Resistencia muscular', 'perder peso', 'definicion', 'masa muscular'
        ]
    }),
    (0, class_transformer_1.Transform)(toUndefIfEmpty),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "goal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'yyyy-mm-dd' }),
    (0, class_transformer_1.Transform)(toUndefIfEmpty),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'morning|afternoon|evening' }),
    (0, class_transformer_1.Transform)(toUndefIfEmpty),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['morning', 'afternoon', 'evening']),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "timeOfDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID entrenador' }),
    (0, class_transformer_1.Transform)(toUndefIfEmpty),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "trainerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_transformer_1.Transform)(toNumberOrUndef),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ScheduleQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 10 }),
    (0, class_transformer_1.Transform)(toNumberOrUndef),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ScheduleQueryDto.prototype, "limit", void 0);
