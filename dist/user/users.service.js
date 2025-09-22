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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
        this.publicUser = (u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isBlocked: u.isBlocked,
            address: u.address,
            phone: u.phone,
            createdAt: u.createdAt,
        });
    }
    async findMe(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.publicUser(user);
    }
    async findAll(page = 1, limit = 10) {
        const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
        const [items, total] = await this.usersRepository.findAndCount({
            skip,
            take,
            order: { createdAt: 'DESC' },
        });
        return {
            page: Number(page) || 1,
            limit: take,
            total,
            items: items.map(this.publicUser),
        };
    }
    async updateRole(id, role) {
        await this.ensureExists(id);
        await this.usersRepository.update({ id }, { role });
        const user = await this.usersRepository.findOne({ where: { id } });
        return this.publicUser(user);
    }
    async updateStatus(id, isBlocked) {
        await this.ensureExists(id);
        await this.usersRepository.update({ id }, { isBlocked });
        const user = await this.usersRepository.findOne({ where: { id } });
        return this.publicUser(user);
    }
    async ensureExists(id) {
        const exists = await this.usersRepository.exist({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('User not found');
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
        };
    }
    async updateProfile(userId, updateUserDto) {
        await this.usersRepository.update(userId, updateUserDto);
        return await this.getProfile(userId);
    }
    async updateUser(id, updateUserDto) {
        await this.ensureExists(id);
        await this.usersRepository.update({ id }, updateUserDto);
        const user = await this.usersRepository.findOne({ where: { id } });
        return this.publicUser(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
