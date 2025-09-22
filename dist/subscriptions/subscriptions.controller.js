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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./subscriptions.service");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let SubscriptionsController = class SubscriptionsController {
    constructor(subs) {
        this.subs = subs;
    }
    async myStatus(user) {
        return this.subs.statusFor(user.userId);
    }
    async createSelf(user, dto) {
        return this.subs.createFromPlan(user.userId, dto.planId);
    }
    async createAdmin(dto) {
        return this.subs.createAdmin(dto);
    }
    async cancel(id) {
        return this.subs.cancel(id);
    }
    async devTrial(user) {
        if (process.env.ENABLE_DEV_TRIAL !== '1' || process.env.NODE_ENV === 'production') {
            throw new common_1.ForbiddenException('Trial dev deshabilitado');
        }
        const days = Number(process.env.DEV_TRIAL_DAYS || 7);
        return this.subs.createAdmin({ userId: user.userId, durationDays: days });
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Estado de suscripción del usuario autenticado' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "myStatus", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear suscripción (usuario autenticado, usa plan.durationDays)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSelf", null);
__decorate([
    (0, common_1.Post)('admin/create'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear o extender suscripción (admin/webhook)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.AdminCreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid' }),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar suscripción (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('dev/trial'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear trial para el usuario autenticado (solo DEV con flag)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "devTrial", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscription'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
