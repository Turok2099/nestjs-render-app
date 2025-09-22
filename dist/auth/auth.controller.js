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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const loging_dto_1 = require("./dto/loging.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const google_dto_1 = require("./dto/google.dto");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const google_complete_dto_1 = require("./dto/google-complete.dto");
let AuthController = class AuthController {
    constructor(auth, jwt) {
        this.auth = auth;
        this.jwt = jwt;
    }
    setRefreshCookie(res, token) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    async register(dto, res) {
        const { user, accessToken, refreshToken } = await this.auth.register(dto);
        this.setRefreshCookie(res, refreshToken);
        return { user, accessToken };
    }
    async login(dto, res) {
        const { user, accessToken, refreshToken } = await this.auth.login(dto);
        this.setRefreshCookie(res, refreshToken);
        return { user, accessToken };
    }
    async google({ idToken }, res) {
        const { user, accessToken, refreshToken } = await this.auth.googleLogin(idToken);
        this.setRefreshCookie(res, refreshToken);
        return { user, accessToken };
    }
    async googleComplete(dto, res) {
        const { user, accessToken, refreshToken, needsCompletion } = await this.auth.completeGoogleRegistration(dto);
        this.setRefreshCookie(res, refreshToken);
        return { user, accessToken, needsCompletion };
    }
    async forgot(dto) {
        return this.auth.forgotPassword(dto);
    }
    async reset(dto) {
        return this.auth.resetPassword(dto);
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken)
            return { error: 'No refresh token' };
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const tokens = await this.auth.refresh(payload.sub, refreshToken);
            this.setRefreshCookie(res, tokens.refreshToken);
            return { accessToken: tokens.accessToken };
        }
        catch {
            return { error: 'Invalid token' };
        }
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            try {
                const payload = this.jwt.verify(refreshToken, {
                    secret: process.env.JWT_REFRESH_SECRET,
                });
                await this.auth.revokeRefresh(payload.sub);
            }
            catch {
            }
        }
        res.clearCookie('refresh_token', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        return;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Registro por email y contraseña' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Login por email y contraseña' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loging_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, swagger_1.ApiOperation)({ summary: 'Login con Google (ID token)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_dto_1.GoogleTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "google", null);
__decorate([
    (0, common_1.Post)('google/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Completar registro de Google con datos adicionales', }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_complete_dto_1.GoogleCompleteDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleComplete", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(202),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar email con link de reseteo' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgot", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar contraseña con token de un solo uso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reset", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiCookieAuth)('refresh_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener nuevo access token usando la cookie de refresh', }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiCookieAuth)('refresh_token'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión: limpia cookie y revoca refresh' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthController);
