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
exports.SubscriptionReminder = void 0;
const typeorm_1 = require("typeorm");
const subscription_entity_1 = require("../../subscriptions/entities/subscription.entity");
let SubscriptionReminder = class SubscriptionReminder {
};
exports.SubscriptionReminder = SubscriptionReminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionReminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], SubscriptionReminder.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription, { onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'subscriptionId' }),
    __metadata("design:type", subscription_entity_1.Subscription)
], SubscriptionReminder.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], SubscriptionReminder.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SubscriptionReminder.prototype, "createdAt", void 0);
exports.SubscriptionReminder = SubscriptionReminder = __decorate([
    (0, typeorm_1.Entity)('subscription_reminders')
], SubscriptionReminder);
