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
exports.Exercise = void 0;
const typeorm_1 = require("typeorm");
let Exercise = class Exercise {
};
exports.Exercise = Exercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Exercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ejercicio", length: 120 }),
    __metadata("design:type", String)
], Exercise.prototype, "ejercicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "grupo", length: 50, nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "categoria", length: 30, nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "imagen_grupo",
        type: "varchar",
        nullable: true,
        length: 500,
    }),
    __metadata("design:type", String)
], Exercise.prototype, "imagenGrupo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "imagen_ejercicio",
        type: "varchar",
        nullable: true,
        length: 500,
    }),
    __metadata("design:type", String)
], Exercise.prototype, "imagenEjercicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fuerza_series", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "fuerzaSeries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fuerza_repeticiones", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "fuerzaRepeticiones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hipertrofia_series", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "hipertrofiaSeries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hipertrofia_repeticiones", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "hipertrofiaRepeticiones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resistencia_series", type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "resistenciaSeries", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "resistencia_repeticiones",
        type: "varchar",
        nullable: true,
        length: 50,
    }),
    __metadata("design:type", String)
], Exercise.prototype, "resistenciaRepeticiones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Exercise.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Exercise.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Exercise.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "repetitions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "program_tag", type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "programTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "image_url", type: "varchar", nullable: true, length: 500 }),
    __metadata("design:type", String)
], Exercise.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tiempo", type: "varchar", nullable: true, length: 20 }),
    __metadata("design:type", String)
], Exercise.prototype, "tiempo", void 0);
exports.Exercise = Exercise = __decorate([
    (0, typeorm_1.Entity)({ name: "exercises" }),
    (0, typeorm_1.Index)(["grupo", "ejercicio"])
], Exercise);
