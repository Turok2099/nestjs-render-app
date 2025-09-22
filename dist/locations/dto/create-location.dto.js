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
exports.UpdateLocationDto = exports.CreateLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLocationDto {
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TrainUp Reforma 26' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'México' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CDMX' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Av. Paseo de la Reforma 26, Cuauhtémoc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19.429 }),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -99.163 }),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLocationDto.prototype, "isActive", void 0);
class UpdateLocationDto extends (0, swagger_1.PartialType)(CreateLocationDto) {
}
exports.UpdateLocationDto = UpdateLocationDto;
