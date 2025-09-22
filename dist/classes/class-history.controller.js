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
exports.ClassHistoryController = void 0;
const common_1 = require("@nestjs/common");
const class_history_service_1 = require("./class-history.service");
const create_class_history_dto_1 = require("./dto/create-class-history.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ClassHistoryController = class ClassHistoryController {
    constructor(classHistoryService) {
        this.classHistoryService = classHistoryService;
    }
    async create(req, createClassHistoryDto) {
        return await this.classHistoryService.create(req.user.userId, createClassHistoryDto);
    }
    async getMyHistory(req) {
        return await this.classHistoryService.findByUser(req.user.userId);
    }
};
exports.ClassHistoryController = ClassHistoryController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar asistencia a clase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asistencia registrada exitosamente' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_class_history_dto_1.CreateClassHistoryDto]),
    __metadata("design:returntype", Promise)
], ClassHistoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de clases del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial obtenido exitosamente' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassHistoryController.prototype, "getMyHistory", null);
exports.ClassHistoryController = ClassHistoryController = __decorate([
    (0, swagger_1.ApiTags)('class-history'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('class-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [class_history_service_1.ClassHistoryService])
], ClassHistoryController);
