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
exports.Class = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const class_history_entity_1 = require("./class-history.entity");
let Class = class Class {
    calculateDayOfWeek() {
        if (!this.date)
            return null;
        const dateObj = new Date(this.date);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[dateObj.getDay()];
    }
    setDateWithDayOfWeek(date) {
        this.date = date;
        this.dayOfWeek = this.calculateDayOfWeek();
    }
};
exports.Class = Class;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Class.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'trainer_id' }),
    __metadata("design:type", user_entity_1.User)
], Class.prototype, "trainer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trainer_id' }),
    __metadata("design:type", String)
], Class.prototype, "trainerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Class.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Class.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], Class.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], Class.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'day_of_week',
        type: 'varchar',
        length: 10,
        nullable: true
    }),
    __metadata("design:type", String)
], Class.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 20 }),
    __metadata("design:type", Number)
], Class.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goal_tag', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Class.prototype, "goalTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Class.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Class.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Class.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Class.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_history_entity_1.ClassHistory, classHistory => classHistory.class),
    __metadata("design:type", Array)
], Class.prototype, "classHistories", void 0);
exports.Class = Class = __decorate([
    (0, typeorm_1.Entity)({ name: 'classes' }),
    (0, typeorm_1.Index)(['date', 'startTime'])
], Class);
