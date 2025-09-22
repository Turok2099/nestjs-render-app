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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const typeorm_1 = require("typeorm");
let AppController = class AppController {
    constructor(appService, dataSource) {
        this.appService = appService;
        this.dataSource = dataSource;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Servidor funcionando correctamente',
        };
    }
    async testDatabaseConnection() {
        try {
            if (!this.dataSource.isInitialized) {
                throw new Error('Base de datos no inicializada');
            }
            const result = await this.dataSource.query('SELECT NOW() as current_time, version() as db_version');
            const tablesResult = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
            return {
                success: true,
                message: 'Conexión a la base de datos exitosa',
                data: {
                    currentTime: result[0].current_time,
                    dbVersion: result[0].db_version,
                    tables: tablesResult.map(row => row.table_name),
                    environment: process.env.NODE_ENV,
                    hasDatabaseUrl: !!process.env.DATABASE_URL,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error al conectar con la base de datos',
                error: error.message,
                data: {
                    environment: process.env.NODE_ENV,
                    hasDatabaseUrl: !!process.env.DATABASE_URL,
                },
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('db-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testDatabaseConnection", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        typeorm_1.DataSource])
], AppController);
