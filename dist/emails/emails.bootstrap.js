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
var EmailsBootstrap_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsBootstrap = void 0;
const common_1 = require("@nestjs/common");
const emails_service_1 = require("./emails.service");
let EmailsBootstrap = EmailsBootstrap_1 = class EmailsBootstrap {
    constructor(emails) {
        this.emails = emails;
        this.logger = new common_1.Logger(EmailsBootstrap_1.name);
    }
    async onApplicationBootstrap() {
        const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
        const missing = required.filter(k => !process.env[k]);
        if (missing.length) {
            this.logger.error(`Faltan variables SMTP: ${missing.join(', ')}`);
        }
        try {
            await this.emails.verifyConnection();
            this.logger.log('SMTP verificado correctamente');
        }
        catch (e) {
            this.logger.error('Error verificando SMTP', e);
        }
        this.logger.log('Plantillas de email listas (memoria).');
    }
};
exports.EmailsBootstrap = EmailsBootstrap;
exports.EmailsBootstrap = EmailsBootstrap = EmailsBootstrap_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [emails_service_1.EmailsService])
], EmailsBootstrap);
