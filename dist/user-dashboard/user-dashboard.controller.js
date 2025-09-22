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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../user/users.service");
const comments_service_1 = require("../comments/comments.service");
const classes_service_1 = require("../classes/classes.service");
const class_history_service_1 = require("../classes/class-history.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let DashboardController = class DashboardController {
    constructor(userService, commentService, classService, classHistoryService) {
        this.userService = userService;
        this.commentService = commentService;
        this.classService = classService;
        this.classHistoryService = classHistoryService;
    }
    async getDashboardData(req) {
        const userId = req.user.userId;
        const [profile, comments, availableClasses, classHistory] = await Promise.all([
            this.userService.getProfile(userId),
            this.commentService.findByUser(userId),
            this.classService.findAll(),
            this.classHistoryService.findByUser(userId),
        ]);
        return {
            profile,
            comments,
            availableClasses,
            classHistory,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener datos completos del dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Datos del dashboard obtenidos exitosamente' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardData", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        comments_service_1.CommentService,
        classes_service_1.ClassesService,
        class_history_service_1.ClassHistoryService])
], DashboardController);
