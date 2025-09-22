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
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emails_service_1 = require("./emails.service");
const send_template_dto_1 = require("./dto/send-template.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let EmailsController = class EmailsController {
    constructor(emails) {
        this.emails = emails;
    }
    async ping() {
        await this.emails.verifyConnection();
        return { ok: true };
    }
    async sendByTemplate(dto) {
        return this.emails.sendByTemplate(dto.to, dto.key, dto.data ?? {}, dto.attachments);
    }
    async preview(key, json) {
        let data = {};
        if (json) {
            try {
                data = JSON.parse(json);
            }
            catch {
                throw new common_1.BadRequestException('El parámetro "json" no es un JSON válido');
            }
        }
        const { subject, html } = await this.emails.renderTemplate(key, data);
        return { subject, html };
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)('ping'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar conexión SMTP' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "ping", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('send/template'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar por plantilla (key + data)' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, swagger_1.ApiBody)({ type: send_template_dto_1.SendTemplateDto, required: true }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_template_dto_1.SendTemplateDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendByTemplate", null);
__decorate([
    (0, common_1.Get)('templates/:key/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview HTML renderizado de una plantilla (no envía)' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)('json')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "preview", null);
exports.EmailsController = EmailsController = __decorate([
    (0, swagger_1.ApiTags)('emails'),
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [emails_service_1.EmailsService])
], EmailsController);
