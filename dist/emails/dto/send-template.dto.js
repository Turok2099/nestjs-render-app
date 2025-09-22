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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class EmailAttachmentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'comprobante.pdf' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmailAttachmentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailAttachmentDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contenido directo (Buffer/base64/...)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EmailAttachmentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'logo@cid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailAttachmentDto.prototype, "cid", void 0);
class SendTemplateDto {
}
exports.SendTemplateDto = SendTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'destinatario@gmail.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendTemplateDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'welcome' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendTemplateDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: { name: 'Jannely', appName: 'TrainUp', ctaUrl: 'https://...' },
        description: 'Variables para interpolar en la plantilla',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendTemplateDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [EmailAttachmentDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmailAttachmentDto),
    __metadata("design:type", Array)
], SendTemplateDto.prototype, "attachments", void 0);
