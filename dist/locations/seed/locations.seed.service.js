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
var LocationsSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_entity_1 = require("../entities/location.entity");
let LocationsSeedService = LocationsSeedService_1 = class LocationsSeedService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(LocationsSeedService_1.name);
    }
    async run() {
        const data = [
            {
                name: 'TrainUp Palermo',
                country: 'Argentina',
                city: 'Buenos Aires',
                address: 'Av. Santa Fe 3253, Palermo',
                lat: (-34.588500).toFixed(6),
                lng: (-58.410700).toFixed(6),
            },
            {
                name: 'TrainUp Microcentro',
                country: 'Argentina',
                city: 'Buenos Aires',
                address: 'Av. Pres. Roque Sáenz Peña 615, Microcentro',
                lat: (-34.603700).toFixed(6),
                lng: (-58.381600).toFixed(6),
            },
            {
                name: 'TrainUp Córdoba Centro',
                country: 'Argentina',
                city: 'Córdoba',
                address: 'Av. Colón 345, Centro',
                lat: (-31.420100).toFixed(6),
                lng: (-64.188800).toFixed(6),
            },
            {
                name: 'TrainUp Chapinero',
                country: 'Colombia',
                city: 'Bogotá',
                address: 'Cra. 13 #55-10, Chapinero',
                lat: (4.648600).toFixed(6),
                lng: (-74.062900).toFixed(6),
            },
            {
                name: 'TrainUp La Candelaria',
                country: 'Colombia',
                city: 'Bogotá',
                address: 'Calle 10 #6-20, La Candelaria',
                lat: (4.596400).toFixed(6),
                lng: (-74.073000).toFixed(6),
            },
            {
                name: 'TrainUp El Poblado',
                country: 'Colombia',
                city: 'Medellín',
                address: 'Cra. 43A #6S-15, El Poblado',
                lat: (6.208800).toFixed(6),
                lng: (-75.567000).toFixed(6),
            },
            {
                name: 'TrainUp Reforma 26',
                country: 'México',
                city: 'CDMX',
                address: 'Av. Paseo de la Reforma 26, Cuauhtémoc',
                lat: (19.429000).toFixed(6),
                lng: (-99.163000).toFixed(6),
            },
            {
                name: 'TrainUp Polanco',
                country: 'México',
                city: 'CDMX',
                address: 'Av. Presidente Masaryk 123, Polanco',
                lat: (19.432600).toFixed(6),
                lng: (-99.200500).toFixed(6),
            },
            {
                name: 'TrainUp Guadalajara Centro',
                country: 'México',
                city: 'Guadalajara',
                address: 'Av. Juárez 150, Centro',
                lat: (20.676700).toFixed(6),
                lng: (-103.347600).toFixed(6),
            },
        ];
        for (const item of data) {
            const exists = await this.repo.findOne({
                where: {
                    name: item.name,
                    city: item.city,
                    country: item.country,
                },
            });
            if (!exists) {
                await this.repo.save(this.repo.create({ ...item, isActive: true }));
                this.logger.log(`+ Seeded: ${item.name} (${item.city}, ${item.country})`);
            }
            else {
                this.logger.log(`= Skipped (exists): ${item.name}`);
            }
        }
    }
};
exports.LocationsSeedService = LocationsSeedService;
exports.LocationsSeedService = LocationsSeedService = LocationsSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LocationsSeedService);
