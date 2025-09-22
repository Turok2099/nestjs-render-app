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
exports.ModerateReviewDto = exports.UpdateReviewStatusDto = exports.UpdateReviewDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_review_dto_1 = require("./create-review.dto");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateReviewDto extends (0, mapped_types_1.PartialType)(create_review_dto_1.CreateReviewDto) {
}
exports.UpdateReviewDto = UpdateReviewDto;
class UpdateReviewStatusDto {
}
exports.UpdateReviewStatusDto = UpdateReviewStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'true = activar, false = inactivar (borrado lógico)' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateReviewStatusDto.prototype, "isActive", void 0);
class ModerateReviewDto {
}
exports.ModerateReviewDto = ModerateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['approved', 'rejected'] }),
    (0, class_validator_1.IsIn)(['approved', 'rejected']),
    __metadata("design:type", String)
], ModerateReviewDto.prototype, "status", void 0);
