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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const stripe_service_1 = require("../stripe/stripe.service");
const plans_service_1 = require("../plans/plans.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepository, stripeService, plansService, subscriptionsService) {
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
        this.plansService = plansService;
        this.subscriptionsService = subscriptionsService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async testStripeConnection() {
        try {
            const stripe = this.stripeService.getStripeClient();
            const balance = await stripe.balance.retrieve();
            return {
                connected: true,
                balance: balance.available[0]?.amount || 0,
                currency: balance.available[0]?.currency || 'usd',
            };
        }
        catch (error) {
            this.logger.error('Error probando conexión con Stripe:', error.message);
            throw error;
        }
    }
    async createPaymentIntent(dto) {
        try {
            this.logger.log(`Creando PaymentIntent para usuario ${dto.userId}`);
            this.logger.log(`Datos recibidos: ${JSON.stringify(dto)}`);
            if (dto.planId) {
                this.logger.log(`Verificando plan: ${dto.planId}`);
                const plan = await this.plansService.findOne(dto.planId);
                if (!plan) {
                    this.logger.error(`Plan no encontrado: ${dto.planId}`);
                    throw new common_1.NotFoundException('Plan no encontrado');
                }
                this.logger.log(`Plan encontrado: ${plan.id}`);
            }
            else {
                this.logger.log('No se especificó planId, continuando sin verificación de plan');
            }
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const existingPayment = await this.paymentRepository.findOne({
                where: {
                    userId: dto.userId,
                    status: 'succeeded',
                    createdAt: (0, typeorm_2.MoreThan)(startOfMonth),
                },
            });
            if (existingPayment) {
                throw new common_1.BadRequestException('Ya tienes un pago exitoso este mes. Solo se permite un pago por mes.');
            }
            this.logger.log('Iniciando creación de PaymentIntent en Stripe...');
            const stripe = this.stripeService.getStripeClient();
            const paymentIntentData = {
                amount: dto.amount * 100,
                currency: dto.currency,
                metadata: {
                    userId: dto.userId,
                    planId: dto.planId || null,
                },
                capture_method: 'automatic',
                confirmation_method: 'automatic',
            };
            this.logger.log(`Datos para Stripe: ${JSON.stringify(paymentIntentData)}`);
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
            this.logger.log(`PaymentIntent creado en Stripe: ${paymentIntent.id}`);
            const payment = this.paymentRepository.create({
                userId: dto.userId,
                stripePaymentIntentId: paymentIntent.id,
                amount: dto.amount,
                currency: dto.currency,
                status: 'pending',
                planId: dto.planId,
                paymentType: 'subscription',
            });
            await this.paymentRepository.save(payment);
            this.logger.log(`PaymentIntent creado: ${paymentIntent.id}`);
            return {
                success: true,
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    paymentId: payment.id,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creando PaymentIntent:', error.message);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al crear PaymentIntent');
        }
    }
    async createCheckoutSession(planId, userId, successUrl, cancelUrl) {
        try {
            this.logger.log(`Creando sesión de checkout para plan ${planId}`);
            const plan = await this.plansService.findOne(planId);
            if (!plan) {
                throw new common_1.NotFoundException('Plan no encontrado');
            }
            const price = await this.stripeService.createPrice(plan.id, plan.price, 'usd');
            const priceId = price.id;
            const session = await this.stripeService.createCheckoutSession(priceId, successUrl, cancelUrl);
            return {
                success: true,
                data: {
                    sessionId: session.id,
                    url: session.url,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creando sesión de checkout:', error.message);
            throw new common_1.BadRequestException('Error al crear sesión de checkout');
        }
    }
    async confirmPayment(paymentIntentId) {
        try {
            this.logger.log(`Confirmando pago: ${paymentIntentId}`);
            const payment = await this.paymentRepository.findOne({
                where: { stripePaymentIntentId: paymentIntentId },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Pago no encontrado');
            }
            const stripe = this.stripeService.getStripeClient();
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
                payment.status = 'succeeded';
                await this.paymentRepository.save(payment);
                this.logger.log(`Pago confirmado exitosamente: ${paymentIntentId}`);
                let subscriptionId = null;
                if (payment.planId) {
                    try {
                        this.logger.log(`Creando suscripción automáticamente para pago ${payment.id}`);
                        const subscription = await this.subscriptionsService.createFromPlan(payment.userId, payment.planId);
                        subscriptionId = subscription.id;
                        payment.subscriptionId = subscription.id;
                        await this.paymentRepository.save(payment);
                        this.logger.log(`Suscripción creada: ${subscription.id}`);
                    }
                    catch (subscriptionError) {
                        this.logger.error('Error creando suscripción:', subscriptionError.message);
                    }
                }
                return {
                    success: true,
                    data: {
                        paymentId: payment.id,
                        status: payment.status,
                        amount: payment.amount,
                        currency: payment.currency,
                        subscriptionId: subscriptionId,
                    },
                };
            }
            else {
                throw new common_1.BadRequestException('El pago no ha sido completado');
            }
        }
        catch (error) {
            this.logger.error('Error confirmando pago:', error.message);
            throw new common_1.BadRequestException('Error al confirmar pago');
        }
    }
    async createSubscriptionFromPayment(paymentId) {
        try {
            this.logger.log(`Creando suscripción desde pago: ${paymentId}`);
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Pago no encontrado');
            }
            if (payment.status !== 'succeeded') {
                throw new common_1.BadRequestException('El pago debe estar completado para crear una suscripción');
            }
            if (!payment.planId) {
                throw new common_1.BadRequestException('El pago debe estar asociado a un plan');
            }
            const subscription = await this.subscriptionsService.createFromPlan(payment.userId, payment.planId);
            payment.subscriptionId = subscription.id;
            await this.paymentRepository.save(payment);
            this.logger.log(`Suscripción creada: ${subscription.id}`);
            return {
                success: true,
                data: subscription,
            };
        }
        catch (error) {
            this.logger.error('Error creando suscripción desde pago:', error.message);
            throw new common_1.BadRequestException('Error al crear suscripción');
        }
    }
    async checkPaymentAndCreateSubscription(paymentIntentId, userId) {
        try {
            this.logger.log(`Verificando pago y suscripción para usuario ${userId}`);
            const payment = await this.paymentRepository.findOne({
                where: { stripePaymentIntentId: paymentIntentId, userId },
            });
            if (!payment) {
                throw new common_1.NotFoundException('Pago no encontrado para este usuario');
            }
            const stripe = this.stripeService.getStripeClient();
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const result = {
                paymentId: payment.id,
                paymentStatus: payment.status,
                stripeStatus: paymentIntent.status,
                amount: payment.amount,
                currency: payment.currency,
                subscriptionCreated: false,
                subscriptionId: null,
            };
            if (paymentIntent.status === 'succeeded' &&
                payment.status !== 'succeeded') {
                payment.status = 'succeeded';
                await this.paymentRepository.save(payment);
                result.paymentStatus = 'succeeded';
                this.logger.log(`Pago confirmado: ${paymentIntentId}`);
                if (payment.planId && !payment.subscriptionId) {
                    try {
                        const subscription = await this.subscriptionsService.createFromPlan(userId, payment.planId);
                        payment.subscriptionId = subscription.id;
                        await this.paymentRepository.save(payment);
                        result.subscriptionCreated = true;
                        result.subscriptionId = subscription.id;
                        this.logger.log(`Suscripción creada: ${subscription.id}`);
                    }
                    catch (subscriptionError) {
                        this.logger.error('Error creando suscripción:', subscriptionError.message);
                        result.subscriptionCreated = false;
                    }
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error verificando pago y suscripción:', error.message);
            throw new common_1.BadRequestException('Error al verificar estado del pago');
        }
    }
    async createAndConfirmPayment(dto) {
        try {
            this.logger.log(`Creando y confirmando pago para usuario ${dto.userId}`);
            const plan = await this.plansService.findOne(dto.planId);
            if (!plan) {
                throw new common_1.NotFoundException('Plan no encontrado');
            }
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const existingPayment = await this.paymentRepository.findOne({
                where: {
                    userId: dto.userId,
                    status: 'succeeded',
                    createdAt: (0, typeorm_2.MoreThan)(startOfMonth),
                },
            });
            if (existingPayment) {
                throw new common_1.BadRequestException('Ya tienes un pago exitoso este mes. Solo se permite un pago por mes.');
            }
            const stripe = this.stripeService.getStripeClient();
            const paymentIntent = await stripe.paymentIntents.create({
                amount: dto.amount * 100,
                currency: dto.currency,
                metadata: {
                    userId: dto.userId,
                    planId: dto.planId || null,
                },
                capture_method: 'automatic',
                confirmation_method: 'automatic',
            });
            const payment = this.paymentRepository.create({
                userId: dto.userId,
                stripePaymentIntentId: paymentIntent.id,
                amount: dto.amount,
                currency: dto.currency,
                status: 'succeeded',
                planId: dto.planId,
                paymentType: 'subscription',
            });
            await this.paymentRepository.save(payment);
            const subscription = await this.subscriptionsService.createFromPlan(dto.userId, dto.planId);
            payment.subscriptionId = subscription.id;
            await this.paymentRepository.save(payment);
            this.logger.log(`Pago y suscripción creados: ${paymentIntent.id} -> ${subscription.id}`);
            return {
                success: true,
                data: {
                    paymentId: payment.id,
                    paymentIntentId: paymentIntent.id,
                    subscriptionId: subscription.id,
                    amount: dto.amount,
                    currency: dto.currency,
                    planId: dto.planId || null,
                    subscription: {
                        id: subscription.id,
                        status: subscription.status,
                        startAt: subscription.startAt,
                        endAt: subscription.endAt,
                    },
                },
            };
        }
        catch (error) {
            this.logger.error('Error creando y confirmando pago:', error.message);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al procesar el pago');
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        stripe_service_1.StripeService,
        plans_service_1.PlansService,
        subscriptions_service_1.SubscriptionsService])
], PaymentsService);
