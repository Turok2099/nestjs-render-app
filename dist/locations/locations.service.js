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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_entity_1 = require("./entities/location.entity");
let LocationsService = class LocationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll() {
        const rows = await this.repo.find({
            where: { isActive: true },
        });
        return rows.map((l) => this.withLinks(l));
    }
    async findByCountry(country) {
        const rows = await this.repo.find({
            where: { isActive: true, country },
        });
        return rows.map((l) => this.withLinks(l));
    }
    async findOne(id) {
        return this.repo.findOne({ where: { id } });
    }
    async create(dto) {
        const entity = this.repo.create({
            name: dto.name,
            country: dto.country,
            city: dto.city,
            address: dto.address,
            lat: String(dto.lat),
            lng: String(dto.lng),
            isActive: dto.isActive ?? true,
        });
        return this.repo.save(entity);
    }
    async update(id, dto) {
        const curr = await this.findOne(id);
        if (!curr)
            throw new common_1.BadRequestException('Location not found');
        const patch = {};
        if (dto.name !== undefined)
            patch.name = dto.name;
        if (dto.country !== undefined)
            patch.country = dto.country;
        if (dto.city !== undefined)
            patch.city = dto.city;
        if (dto.address !== undefined)
            patch.address = dto.address;
        if (dto.isActive !== undefined)
            patch.isActive = dto.isActive;
        if (dto.lat !== undefined)
            patch.lat = String(dto.lat);
        if (dto.lng !== undefined)
            patch.lng = String(dto.lng);
        const merged = this.repo.merge(curr, patch);
        return this.repo.save(merged);
    }
    async remove(id) {
        await this.repo.delete(id);
        return { ok: true };
    }
    async nearest(lat, lng) {
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            throw new common_1.BadRequestException('lat/lng inválidos');
        }
        const locations = await this.repo.find({ where: { isActive: true } });
        if (!locations.length)
            return null;
        let best = null;
        let bestKm = Infinity;
        for (const loc of locations) {
            const d = this.haversineKm(lat, lng, parseFloat(loc.lat), parseFloat(loc.lng));
            if (d < bestKm) {
                best = loc;
                bestKm = d;
            }
        }
        if (!best)
            return null;
        return {
            ...this.withLinks(best),
            distanceKm: Number(bestKm.toFixed(2)),
        };
    }
    async directions(id, originLat, originLng) {
        if (Number.isNaN(originLat) || Number.isNaN(originLng)) {
            throw new common_1.BadRequestException('lat/lng inválidos');
        }
        const dest = await this.findOne(id);
        if (!dest)
            throw new common_1.BadRequestException('Location not found');
        const destLat = parseFloat(dest.lat);
        const destLng = parseFloat(dest.lng);
        const directionsUrl = `https://www.google.com/maps/dir/?api=1` +
            `&origin=${originLat},${originLng}` +
            `&destination=${destLat},${destLng}` +
            `&travelmode=driving`;
        return {
            ...this.withLinks(dest),
            distanceKm: Number(this.haversineKm(originLat, originLng, destLat, destLng).toFixed(2)),
            directionsUrl,
        };
    }
    withLinks(l) {
        return {
            ...l,
            embedUrl: `https://maps.google.com/maps?q=${l.lat},${l.lng}&z=15&output=embed`,
            mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.name} ${l.address} ${l.city} ${l.country}`)}&query_place_id=`,
        };
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LocationsService);
