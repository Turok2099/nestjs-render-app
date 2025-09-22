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
exports.CommentController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CommentController = class CommentController {
    constructor(commentService) {
        this.commentService = commentService;
    }
    async create(req, createCommentDto) {
        return await this.commentService.create(req.user.userId, createCommentDto);
    }
    async getMyComments(req) {
        return await this.commentService.findByUser(req.user.userId);
    }
    async findAll() {
        return await this.commentService.findAll();
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo comentario' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comentario creado exitosamente' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener comentarios del usuario autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comentarios obtenidos exitosamente' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getMyComments", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los comentarios' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de comentarios obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findAll", null);
exports.CommentController = CommentController = __decorate([
    (0, swagger_1.ApiTags)('comments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [comments_service_1.CommentService])
], CommentController);
