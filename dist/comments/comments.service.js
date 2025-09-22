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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./entities/comment.entity");
const users_service_1 = require("../user/users.service");
let CommentService = class CommentService {
    constructor(commentRepository, userService) {
        this.commentRepository = commentRepository;
        this.userService = userService;
    }
    async create(userId, createCommentDto) {
        await this.userService.findById(userId);
        const comment = this.commentRepository.create({
            ...createCommentDto,
            userId,
            date: createCommentDto.date || new Date().toISOString().split('T')[0],
        });
        return await this.commentRepository.save(comment);
    }
    async findByUser(userId) {
        const comments = await this.commentRepository.find({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            rating: comment.rating,
            date: comment.date,
            user: {
                id: comment.user.id,
                name: comment.user.name,
            },
        }));
    }
    async findAll() {
        const comments = await this.commentRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            rating: comment.rating,
            date: comment.date,
            user: {
                id: comment.user.id,
                name: comment.user.name,
            },
        }));
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], CommentService);
