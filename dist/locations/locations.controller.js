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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const locations_service_1 = require("./locations.service");
const create_location_dto_1 = require("./dto/create-location.dto");
let LocationsController = class LocationsController {
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    byCountry(country) {
        return this.service.findByCountry(country);
    }
    nearest(latRaw, lngRaw) {
        return this.service.nearest(Number(latRaw), Number(lngRaw));
    }
    directions(id, latRaw, lngRaw) {
        return this.service.directions(id, Number(latRaw), Number(lngRaw));
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-country'),
    (0, swagger_1.ApiQuery)({ name: 'country', required: true, type: String, example: 'México' }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "byCountry", null);
__decorate([
    (0, common_1.Get)('nearest'),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: true, type: Number }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "nearest", null);
__decorate([
    (0, common_1.Get)(':id/directions'),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: true, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lat')),
    __param(2, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "directions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_location_dto_1.CreateLocationDto]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "remove", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('locations'),
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
