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
exports.CreateExerciseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateExerciseDto {
}
exports.CreateExerciseDto = CreateExerciseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre del ejercicio" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "ejercicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Grupo muscular" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "grupo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Categoría del ejercicio", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Series para hipertrofia", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "hipertrofia_series", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Repeticiones para hipertrofia",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "hipertrofia_repeticiones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Series para fuerza", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "fuerza_series", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Repeticiones para fuerza", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "fuerza_repeticiones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Series para resistencia", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "resistencia_series", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Repeticiones para resistencia",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "resistencia_repeticiones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Estado activo/inactivo", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === "true"),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateExerciseDto.prototype, "isActive", void 0);
