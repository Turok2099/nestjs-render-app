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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Payment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Payment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_payment_intent_id', unique: true }),
    __metadata("design:type", String)
], Payment.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3 }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: 'pending',
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_type',
        type: 'varchar',
        length: 20,
        default: 'subscription',
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subscription_id', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_metadata', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "stripeMetadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)({ name: 'payments' }),
    (0, typeorm_1.Index)(['userId', 'status', 'createdAt']),
    (0, typeorm_1.Index)(['stripePaymentIntentId'], { unique: true })
], Payment);
