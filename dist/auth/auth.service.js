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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const jwt_1 = require("@nestjs/jwt");
const google_auth_library_1 = require("google-auth-library");
const user_entity_1 = require("../user/entities/user.entity");
const emails_service_1 = require("../emails/emails.service");
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "24h";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let AuthService = AuthService_1 = class AuthService {
    constructor(usersRepo, jwt, emails) {
        this.usersRepo = usersRepo;
        this.jwt = jwt;
        this.emails = emails;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async hash(data) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(data, salt);
    }
    async signTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: ACCESS_TTL,
        });
        const refreshToken = await this.jwt.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: REFRESH_TTL,
        });
        return { accessToken, refreshToken };
    }
    publicUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            address: user.address,
            phone: user.phone,
            createdAt: user.createdAt,
        };
    }
    async register(dto) {
        const exists = await this.usersRepo.findOne({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.BadRequestException("Email already in use");
        const user = this.usersRepo.create({
            name: dto.name,
            email: dto.email,
            address: dto.address ?? null,
            phone: dto.phone ?? null,
            passwordHash: await this.hash(dto.password),
            role: "member",
        });
        await this.usersRepo.save(user);
        const { accessToken, refreshToken } = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(refreshToken);
        await this.usersRepo.save(user);
        try {
            await this.emails.sendWelcome(user.email, user.name ?? user.email);
        }
        catch (err) {
            this.logger.warn(`No se pudo enviar welcome a ${user.email}: ${err?.message ?? err}`);
        }
        return { user: this.publicUser(user), accessToken, refreshToken };
    }
    async login(dto) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .addSelect(["u.passwordHash", "u.refreshTokenHash"])
            .where("u.email = :email", { email: dto.email })
            .getOne();
        if (!user)
            throw new common_1.UnauthorizedException("Invalid credentials");
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException("Invalid credentials");
        if (user.isBlocked)
            throw new common_1.ForbiddenException("User is blocked");
        const { accessToken, refreshToken } = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(refreshToken);
        await this.usersRepo.save(user);
        return { user: this.publicUser(user), accessToken, refreshToken };
    }
    async refresh(userId, refreshToken) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .addSelect(["u.refreshTokenHash"])
            .where("u.id = :id", { id: userId })
            .getOne();
        if (!user || !user.refreshTokenHash)
            throw new common_1.UnauthorizedException();
        const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!match)
            throw new common_1.UnauthorizedException();
        const tokens = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(tokens.refreshToken);
        await this.usersRepo.save(user);
        return tokens;
    }
    async revokeRefresh(userId) {
        await this.usersRepo.update({ id: userId }, { refreshTokenHash: null });
        return { revoked: true };
    }
    async me(userId) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.publicUser(user);
    }
    async forgotPassword(dto) {
        const user = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (!user)
            return { accepted: true };
        const raw = (0, crypto_1.randomBytes)(32).toString("hex");
        const hash = (0, crypto_1.createHash)("sha256").update(raw).digest("hex");
        user.resetTokenHash = hash;
        user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
        await this.usersRepo.save(user);
        const base = process.env.FRONT_RESET_URL ||
            "http://localhost:3000/reset-password?token=";
        await this.emails.sendPasswordResetEmail(user.email, `${base}${raw}`);
        return { accepted: true };
    }
    async resetPassword(dto) {
        const hash = (0, crypto_1.createHash)("sha256").update(dto.token).digest("hex");
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .addSelect(["u.resetTokenHash"])
            .where("u.resetTokenHash = :hash", { hash })
            .getOne();
        if (!user ||
            !user.resetTokenExpiresAt ||
            user.resetTokenExpiresAt < new Date()) {
            throw new common_1.BadRequestException("Invalid or expired token");
        }
        user.passwordHash = await this.hash(dto.newPassword);
        user.resetTokenHash = null;
        user.resetTokenExpiresAt = null;
        await this.usersRepo.save(user);
        return { updated: true };
    }
    async googleLogin(idToken) {
        console.log("Iniciando login con Google");
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new common_1.BadRequestException("Missing GOOGLE_CLIENT_ID");
        }
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload?.email) {
            throw new common_1.BadRequestException("Invalid Google token");
        }
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name ?? email.split("@")[0];
        console.log(`Procesando usuario: ${email} (${name})`);
        let user = await this.usersRepo.findOne({ where: { googleId } });
        if (!user) {
            user = await this.usersRepo.findOne({ where: { email } });
            if (user && !user.googleId) {
                user.googleId = googleId;
                await this.usersRepo.save(user);
            }
        }
        if (!user) {
            const randomPass = (0, crypto_1.randomBytes)(16).toString("hex");
            user = this.usersRepo.create({
                name,
                email,
                googleId,
                passwordHash: await this.hash(randomPass),
                role: "member",
                address: null,
                phone: null,
            });
            await this.usersRepo.save(user);
            console.log("Usuario creado exitosamente✅");
        }
        if (user.isBlocked)
            throw new common_1.ForbiddenException("User is blocked");
        const { accessToken, refreshToken } = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(refreshToken);
        await this.usersRepo.save(user);
        try {
            await this.emails.sendWelcome(user.email, user.name ?? user.email);
            this.logger?.log?.(`Welcome (Google Login) enviado a ${user.email}`);
        }
        catch (err) {
            this.logger?.warn?.(`No se pudo enviar welcome (Google Login) a ${user.email}: ${err?.message ?? err}`);
        }
        return { user: this.publicUser(user), accessToken, refreshToken };
    }
    async completeGoogleRegistration(dto) {
        const { email, address, phone } = dto;
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException("Usuario no encontrado");
        }
        user.address = address;
        user.phone = phone;
        await this.usersRepo.save(user);
        try {
            await this.emails.sendWelcome(user.email, user.name ?? user.email);
            this.logger?.log?.(`Welcome (Google COMPLETE nuevo) enviado a ${user.email}`);
        }
        catch (err) {
            this.logger?.warn?.(`No se pudo enviar welcome (Google COMPLETE nuevo) a ${user.email}: ${err?.message ?? err}`);
        }
        const { accessToken, refreshToken } = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(refreshToken);
        await this.usersRepo.save(user);
        const hasAddress = user.address && user.address.trim() !== "";
        const hasPhone = user.phone && user.phone.trim() !== "";
        const needsCompletion = !hasAddress || !hasPhone;
        console.log("✅ Datos completados:", {
            hasAddress,
            hasPhone,
            needsCompletion,
        });
        return {
            user: this.publicUser(user),
            accessToken,
            refreshToken,
            needsCompletion,
        };
    }
    async syncGoogleUser(dto) {
        const { email, name } = dto;
        console.log("🔄 Sincronizando usuario existente:", email);
        let user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            console.log("🆕 Usuario no encontrado, creando nuevo usuario");
            const randomPass = (0, crypto_1.randomBytes)(16).toString("hex");
            user = this.usersRepo.create({
                name,
                email,
                passwordHash: await this.hash(randomPass),
                role: "member",
                address: null,
                phone: null,
            });
            await this.usersRepo.save(user);
        }
        if (user.isBlocked) {
            throw new common_1.ForbiddenException("User is blocked");
        }
        const { accessToken, refreshToken } = await this.signTokens(user);
        user.refreshTokenHash = await this.hash(refreshToken);
        await this.usersRepo.save(user);
        return { user: this.publicUser(user), accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        emails_service_1.EmailsService])
], AuthService);
