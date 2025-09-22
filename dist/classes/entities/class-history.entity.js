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
exports.ClassHistory = void 0;
const typeorm_1 = require("typeorm");
const class_entity_1 = require("./class.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let ClassHistory = class ClassHistory {
};
exports.ClassHistory = ClassHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClassHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class, (c) => c.classHistories, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], ClassHistory.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'class_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ClassHistory.prototype, "classId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ClassHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], ClassHistory.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'attended' }),
    __metadata("design:type", String)
], ClassHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ClassHistory.prototype, "createdAt", void 0);
exports.ClassHistory = ClassHistory = __decorate([
    (0, typeorm_1.Entity)({ name: 'class_histories' })
], ClassHistory);
