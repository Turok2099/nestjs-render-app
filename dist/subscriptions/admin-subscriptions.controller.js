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
exports.AdminSubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const subscriptions_service_1 = require("./subscriptions.service");
const admin_subscriptions_dto_1 = require("./dto/admin-subscriptions.dto");
const swagger_1 = require("@nestjs/swagger");
let AdminSubscriptionsController = class AdminSubscriptionsController {
    constructor(subsSvc) {
        this.subsSvc = subsSvc;
    }
    async list(q) {
        const { data, total, page, limit } = await this.subsSvc.adminList(q);
        return { ok: true, total, page, limit, data };
    }
    async patchStatus(id, dto) {
        const updated = await this.subsSvc.adminChangeStatus(id, dto);
        return { ok: true, data: updated };
    }
};
exports.AdminSubscriptionsController = AdminSubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar suscripciones (admin)', description: 'Lista todas las suscripciones con filtros, paginación y orden.' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Listado paginado de suscripciones',
        schema: {
            type: 'object',
            properties: {
                ok: { type: 'boolean', example: true },
                total: { type: 'number', example: 42 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                data: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'cancelled', 'expired'] }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'planId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false,
        enum: ['createdAt:DESC', 'createdAt:ASC', 'startAt:DESC', 'startAt:ASC', 'endAt:DESC', 'endAt:ASC'],
        example: 'createdAt:DESC',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_subscriptions_dto_1.AdminListSubscriptionsDto]),
    __metadata("design:returntype", Promise)
], AdminSubscriptionsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar estado suscripción (admin)', description: 'Cambia el estado a active | cancelled | expired.' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Suscripción actualizada',
        schema: {
            type: 'object',
            properties: {
                ok: { type: 'boolean', example: true },
                data: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_subscriptions_dto_1.AdminPatchSubscriptionStatusDto]),
    __metadata("design:returntype", Promise)
], AdminSubscriptionsController.prototype, "patchStatus", null);
exports.AdminSubscriptionsController = AdminSubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Subscriptions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], AdminSubscriptionsController);
