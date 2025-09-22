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
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(PaymentsController_1.name);
    }
    async testStripe() {
        try {
            const result = await this.paymentsService.testStripeConnection();
            return {
                success: true,
                message: 'Conexión con Stripe exitosa',
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Error probando Stripe:', error.message);
            return {
                success: false,
                message: error.message || 'Error al conectar con Stripe',
            };
        }
    }
    async createPaymentIntent(dto, req) {
        try {
            this.logger.log(`🔍 Usuario ${req.user?.email} (ID: ${req.user?.id}) creando PaymentIntent`);
            this.logger.log(`📊 Datos del pago: ${dto.amount} ${dto.currency}`);
            if (!req.user?.id) {
                this.logger.error('❌ Usuario no autenticado');
                return {
                    success: false,
                    message: 'Usuario no autenticado',
                };
            }
            const paymentData = {
                ...dto,
                userId: req.user.id,
            };
            this.logger.log(`✅ UserId agregado desde JWT: ${paymentData.userId}`);
            const result = await this.paymentsService.createPaymentIntent(paymentData);
            return {
                success: true,
                message: 'PaymentIntent creado exitosamente',
                data: result.data,
            };
        }
        catch (error) {
            this.logger.error('Error en createPaymentIntent:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async createCheckoutSession(body, req) {
        try {
            this.logger.log(`Usuario ${req.user?.email} creando sesión de checkout`);
            const result = await this.paymentsService.createCheckoutSession(body.planId, req.user?.id, body.successUrl, body.cancelUrl);
            return {
                success: true,
                message: 'Sesión de checkout creada exitosamente',
                data: result.data,
            };
        }
        catch (error) {
            this.logger.error('Error en createCheckoutSession:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async confirmPayment(paymentIntentId, req) {
        try {
            this.logger.log(`Usuario ${req.user?.email} confirmando pago: ${paymentIntentId}`);
            const result = await this.paymentsService.confirmPayment(paymentIntentId);
            return {
                success: true,
                message: 'Pago confirmado exitosamente',
                data: result.data,
            };
        }
        catch (error) {
            this.logger.error('Error en confirmPayment:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async createSubscriptionFromPayment(paymentId, req) {
        try {
            this.logger.log(`Usuario ${req.user?.email} creando suscripción desde pago: ${paymentId}`);
            const result = await this.paymentsService.createSubscriptionFromPayment(paymentId);
            return {
                success: true,
                message: 'Suscripción creada exitosamente',
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Error en createSubscriptionFromPayment:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async checkPaymentAndSubscriptionStatus(paymentIntentId, req) {
        try {
            this.logger.log(`Usuario ${req.user?.email} verificando estado del pago: ${paymentIntentId}`);
            const result = await this.paymentsService.checkPaymentAndCreateSubscription(paymentIntentId, req.user.id);
            return {
                success: true,
                message: 'Estado verificado exitosamente',
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Error verificando estado del pago:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async createAndConfirmPayment(dto, req) {
        try {
            this.logger.log(`🔍 Usuario ${req.user?.email} (ID: ${req.user?.id}) creando pago con confirmación automática`);
            this.logger.log(`📊 Datos del pago: ${dto.amount} ${dto.currency} - Plan: ${dto.planId}`);
            if (!req.user?.id) {
                this.logger.error('❌ Usuario no autenticado');
                return {
                    success: false,
                    message: 'Usuario no autenticado',
                };
            }
            const paymentData = {
                ...dto,
                userId: req.user.id,
            };
            this.logger.log(`✅ UserId agregado desde JWT: ${paymentData.userId}`);
            const result = await this.paymentsService.createAndConfirmPayment(paymentData);
            return {
                success: true,
                message: 'Pago procesado y suscripción creada exitosamente',
                data: result.data,
            };
        }
        catch (error) {
            this.logger.error('Error en createAndConfirmPayment:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
    async confirmPaymentPost(body, req) {
        try {
            this.logger.log(`Usuario ${req.user?.email} confirmando pago: ${body.paymentIntentId}`);
            const result = await this.paymentsService.confirmPayment(body.paymentIntentId);
            return {
                success: true,
                message: 'Pago confirmado exitosamente',
                data: result.data,
            };
        }
        catch (error) {
            this.logger.error('Error en confirmPayment POST:', error.message);
            return {
                success: false,
                message: error.message || 'Error interno del servidor',
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('test-stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Probar conexión con Stripe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "testStripe", null);
__decorate([
    (0, common_1.Post)('create-payment-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear PaymentIntent para Stripe Elements' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'PaymentIntent creado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('create-checkout-session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear sesión de checkout para suscripciones' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Sesión de checkout creada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Get)('confirm-payment/:paymentIntentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar pago exitoso' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pago confirmado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error al confirmar pago' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)('create-subscription-from-payment/:paymentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear suscripción manualmente desde un pago exitoso',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suscripción creada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Pago no encontrado o no exitoso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSubscriptionFromPayment", null);
__decorate([
    (0, common_1.Get)('status/:paymentIntentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar estado de un pago y crear suscripción si es necesario',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado del pago verificado' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "checkPaymentAndSubscriptionStatus", null);
__decorate([
    (0, common_1.Post)('create-and-confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear PaymentIntent y confirmar pago automáticamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Pago y suscripción creados exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o pago duplicado' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createAndConfirmPayment", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar pago exitoso (POST)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pago confirmado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error al confirmar pago' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPaymentPost", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
