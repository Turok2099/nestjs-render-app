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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const bcrypt = require("bcryptjs");
let HealthController = class HealthController {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'NuevoTrain Backend',
            version: '1.0.0',
        };
    }
    async checkDatabase() {
        try {
            await this.dataSource.query('SELECT 1');
            const tables = await this.getTablesInfo();
            return {
                status: 'ok',
                database: 'connected',
                provider: 'Neon PostgreSQL',
                timestamp: new Date().toISOString(),
                tables: tables,
            };
        }
        catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getTablesInfo() {
        try {
            const tables = [
                'users',
                'locations',
                'classes',
                'class_histories',
                'reservations',
                'reviews',
                'comments',
                'plans',
                'subscriptions',
                'payments',
                'exercises',
                'subscription_reminders',
            ];
            const tableInfo = [];
            for (const tableName of tables) {
                try {
                    const tableExists = await this.dataSource.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            );
          `, [tableName]);
                    if (tableExists[0].exists) {
                        const countResult = await this.dataSource.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                        const columns = await this.dataSource.query(`
              SELECT column_name, data_type, is_nullable, column_default
              FROM information_schema.columns 
              WHERE table_name = $1 
              ORDER BY ordinal_position
            `, [tableName]);
                        tableInfo.push({
                            name: tableName,
                            exists: true,
                            recordCount: parseInt(countResult[0].count),
                            columns: columns.map((col) => ({
                                name: col.column_name,
                                type: col.data_type,
                                nullable: col.is_nullable === 'YES',
                                default: col.column_default,
                            })),
                        });
                    }
                    else {
                        tableInfo.push({
                            name: tableName,
                            exists: false,
                            recordCount: 0,
                            columns: [],
                        });
                    }
                }
                catch (tableError) {
                    tableInfo.push({
                        name: tableName,
                        exists: false,
                        error: tableError.message,
                        recordCount: 0,
                        columns: [],
                    });
                }
            }
            return tableInfo;
        }
        catch (error) {
            throw new Error(`Error al obtener información de tablas: ${error.message}`);
        }
    }
    async testInsert() {
        try {
            const testLocation = await this.dataSource.query(`
          INSERT INTO locations (name, country, city, address, lat, lng, "isActive", created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
                'Gimnasio de Prueba ' + Date.now(),
                'Argentina',
                'Buenos Aires',
                'Av. Test 123',
                '-34.6037',
                '-58.3816',
                true,
                new Date(),
                new Date(),
            ]);
            return {
                status: 'ok',
                message: 'Inserción de prueba exitosa',
                data: testLocation[0],
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error en inserción de prueba',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getUsers() {
        try {
            const users = await this.dataSource.query('SELECT id, name, email, role, "isBlocked", created_at FROM users ORDER BY created_at DESC');
            return {
                status: 'ok',
                message: 'Usuarios obtenidos exitosamente',
                count: users.length,
                users: users,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al obtener usuarios',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getUserPasswordHash(email) {
        try {
            const user = await this.dataSource.query('SELECT id, name, email, role, "isBlocked", password_hash, created_at FROM users WHERE email = $1', [email]);
            if (user.length === 0) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                status: 'ok',
                message: 'Usuario encontrado',
                user: {
                    id: user[0].id,
                    name: user[0].name,
                    email: user[0].email,
                    role: user[0].role,
                    isBlocked: user[0].isBlocked,
                    password_hash: user[0].password_hash,
                    created_at: user[0].created_at,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al obtener usuario',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async testPassword(email, password) {
        try {
            const user = await this.dataSource.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
            if (user.length === 0) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            const passwordHash = user[0].password_hash;
            const isValid = await bcrypt.compare(password, passwordHash);
            return {
                status: 'ok',
                message: 'Comparación de contraseña completada',
                user: {
                    id: user[0].id,
                    name: user[0].name,
                    email: user[0].email,
                },
                password_test: {
                    provided_password: password,
                    stored_hash: passwordHash,
                    is_valid: isValid,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al probar contraseña',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async fixPassword(email, newPassword) {
        try {
            const user = await this.dataSource.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
            if (user.length === 0) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            const salt = await bcrypt.genSalt(10);
            const newPasswordHash = await bcrypt.hash(newPassword, salt);
            await this.dataSource.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', [newPasswordHash, email]);
            return {
                status: 'ok',
                message: 'Contraseña actualizada exitosamente',
                user: {
                    id: user[0].id,
                    name: user[0].name,
                    email: user[0].email,
                },
                password_update: {
                    new_password: newPassword,
                    new_hash: newPasswordHash,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al actualizar contraseña',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createAdmin(createAdminDto) {
        try {
            const { name, email, password } = createAdminDto;
            const existingUser = await this.dataSource.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.length > 0) {
                return {
                    status: 'error',
                    message: 'El usuario ya existe',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const newUser = await this.dataSource.query(`
        INSERT INTO users (id, name, email, password_hash, role, "isBlocked", created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, email, role, "isBlocked", created_at
        `, [name, email, passwordHash, 'admin', false]);
            return {
                status: 'ok',
                message: 'Usuario administrador creado exitosamente',
                user: {
                    id: newUser[0].id,
                    name: newUser[0].name,
                    email: newUser[0].email,
                    role: newUser[0].role,
                    isBlocked: newUser[0].isBlocked,
                    created_at: newUser[0].created_at,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al crear usuario administrador',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getUserPaymentInfo(email) {
        try {
            const user = await this.dataSource.query('SELECT id, name, email, role, created_at FROM users WHERE email = $1', [email]);
            if (user.length === 0) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            const userId = user[0].id;
            const payments = await this.dataSource.query('SELECT id, amount, status, payment_type, currency, stripe_payment_intent_id, created_at FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
            const subscriptions = await this.dataSource.query('SELECT id, plan_id, status, start_at, end_at, created_at FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
            const plans = await this.dataSource.query('SELECT id, name, price, "durationDays" FROM plans');
            return {
                status: 'ok',
                message: 'Información de pago y suscripción obtenida',
                user: user[0],
                payments: payments,
                subscriptions: subscriptions,
                plans: plans,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al obtener información de pago y suscripción',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getSubscriptionInfoTest(email) {
        try {
            const user = await this.dataSource.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
            if (user.length === 0) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado',
                    email: email,
                    timestamp: new Date().toISOString(),
                };
            }
            const userId = user[0].id;
            const activeSubscription = await this.dataSource.query(`
        SELECT 
          s.id,
          s.status,
          s.start_at,
          s.end_at,
          s.created_at,
          p.name as plan_name,
          p.price,
          p.currency,
          p."durationDays"
        FROM subscriptions s
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
        `, [userId]);
            if (activeSubscription.length === 0) {
                return {
                    status: 'error',
                    message: 'No se encontró una suscripción activa',
                    timestamp: new Date().toISOString(),
                };
            }
            const subscription = activeSubscription[0];
            return {
                status: 'ok',
                message: 'Información de vigencia del plan obtenida',
                subscription: {
                    id: subscription.id,
                    plan_name: subscription.plan_name,
                    price: subscription.price,
                    currency: subscription.currency,
                    duration_days: subscription.durationDays,
                    status: subscription.status,
                    start_at: subscription.start_at,
                    end_at: subscription.end_at,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al obtener información de vigencia del plan',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getSubscriptionInfo(req) {
        try {
            const userId = req.user.id;
            const activeSubscription = await this.dataSource.query(`
        SELECT 
          s.id,
          s.status,
          s.start_at,
          s.end_at,
          s.created_at,
          p.name as plan_name,
          p.price,
          p.currency,
          p."durationDays"
        FROM subscriptions s
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
        `, [userId]);
            if (activeSubscription.length === 0) {
                return {
                    status: 'error',
                    message: 'No se encontró una suscripción activa',
                    timestamp: new Date().toISOString(),
                };
            }
            const subscription = activeSubscription[0];
            const now = new Date();
            const endDate = new Date(subscription.end_at);
            const startDate = new Date(subscription.start_at);
            const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
                status: 'ok',
                message: 'Información de vigencia del plan obtenida',
                subscription: {
                    id: subscription.id,
                    plan_name: subscription.plan_name,
                    price: subscription.price,
                    currency: subscription.currency,
                    duration_days: subscription.durationDays,
                    status: subscription.status,
                    start_at: subscription.start_at,
                    end_at: subscription.end_at,
                    days_remaining: daysRemaining,
                    days_elapsed: daysElapsed,
                    is_active: daysRemaining > 0,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Error al obtener información de vigencia del plan',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check básico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Servicio funcionando' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('database'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar conexión a base de datos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conexión exitosa' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error de conexión' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkDatabase", null);
__decorate([
    (0, common_1.Get)('tables'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las tablas y sus registros' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información de tablas obtenida' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getTablesInfo", null);
__decorate([
    (0, common_1.Get)('test-insert'),
    (0, swagger_1.ApiOperation)({ summary: 'Probar inserción en base de datos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inserción de prueba exitosa' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "testInsert", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los usuarios registrados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuarios obtenida' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('user/:email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar hash de contraseña de un usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información del usuario obtenida' }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getUserPasswordHash", null);
__decorate([
    (0, common_1.Get)('test-password/:email/:password'),
    (0, swagger_1.ApiOperation)({ summary: 'Probar comparación de contraseña' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado de la comparación' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Param)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "testPassword", null);
__decorate([
    (0, common_1.Get)('fix-password/:email/:newPassword'),
    (0, swagger_1.ApiOperation)({ summary: 'Corregir hash de contraseña de un usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contraseña actualizada' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Param)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "fixPassword", null);
__decorate([
    (0, common_1.Post)('create-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear usuario administrador' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario admin creado exitosamente',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('user-payment/:email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar pago y suscripción de un usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Información de pago y suscripción',
    }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getUserPaymentInfo", null);
__decorate([
    (0, common_1.Get)('subscription-info-test/:email'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener información de vigencia del plan (sin autenticación para pruebas)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Información de vigencia del plan obtenida',
    }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getSubscriptionInfoTest", null);
__decorate([
    (0, common_1.Get)('subscription-info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener información de vigencia del plan del usuario autenticado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Información de vigencia del plan obtenida',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getSubscriptionInfo", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], HealthController);
