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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reservations_service_1 = require("./reservations.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const active_subscription_guard_1 = require("../subscriptions/guards/active-subscription.guard");
const class_validator_1 = require("class-validator");
class UpdateReservationStatusDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['attended', 'no_show', 'cancelled'] }),
    (0, class_validator_1.IsIn)(['attended', 'no_show', 'cancelled']),
    __metadata("design:type", String)
], UpdateReservationStatusDto.prototype, "status", void 0);
let ReservationsController = class ReservationsController {
    constructor(reservations) {
        this.reservations = reservations;
    }
    async book(user, classId) {
        return this.reservations.book(user.userId, classId);
    }
    async cancelMine(user, classId) {
        return this.reservations.cancelMine(user.userId, classId);
    }
    async setStatus(user, classId, reservationId, dto) {
        return this.reservations.setStatusAsTrainerOrAdmin(user, classId, reservationId, dto.status);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(':id/reservations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_subscription_guard_1.ActiveSubscriptionGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid', description: 'ID de la clase' }),
    (0, swagger_1.ApiOperation)({ summary: 'Reservar una clase (requiere suscripción activa)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "book", null);
__decorate([
    (0, common_1.Delete)(':id/reservations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid', description: 'ID de la clase' }),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar mi reserva' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "cancelMine", null);
__decorate([
    (0, common_1.Patch)(':id/reservations/:reservationId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('trainer', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reservationId', format: 'uuid' }),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar asistencia / no_show / cancelada (trainer o admin)' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('reservationId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, UpdateReservationStatusDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "setStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, swagger_1.ApiTags)('classes'),
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
