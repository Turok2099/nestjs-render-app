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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const user_entity_1 = require("../user/entities/user.entity");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const plans_service_1 = require("../plans/plans.service");
let StripeService = class StripeService {
    constructor(paymentRepository, userRepository, subscriptionsService, plansService) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.subscriptionsService = subscriptionsService;
        this.plansService = plansService;
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
        }
        this.stripe = new stripe_1.default(stripeSecretKey, {
            apiVersion: '2025-08-27.basil',
        });
    }
    async createSubscriptionPayment(data) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'TrainUp Premium Subscription',
                                description: 'Acceso completo a todos los cursos y contenido premium',
                            },
                            unit_amount: 2000,
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${process.env.FRONT_ORIGIN}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONT_ORIGIN}/subscription-cancel`,
                customer_email: data.userEmail,
                metadata: {
                    userId: data.userId.toString(),
                    planId: data.planId,
                    userName: data.userName,
                },
                expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60,
            });
            return session;
        }
        catch (error) {
            console.error('Error creando sesión de pago:', error);
            throw error;
        }
    }
    async getPaymentInfo(sessionId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return session;
        }
        catch (error) {
            console.error('Error obteniendo información de pago:', error);
            throw error;
        }
    }
    async createPaymentIntent(data) {
        try {
            console.log('🔍 Creando PaymentIntent en Stripe...');
            console.log('💰 Monto:', data.amount, 'centavos');
            console.log('💱 Moneda:', data.currency);
            console.log('👤 Usuario ID:', data.userId || 'No especificado');
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: data.amount,
                currency: data.currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    created_at: new Date().toISOString(),
                    source: 'trainup_subscription',
                    user_id: data.userId || 'anonymous',
                },
            });
            console.log('✅ PaymentIntent creado:', paymentIntent.id);
            if (data.userId) {
                await this.savePaymentToDatabase({
                    stripePaymentIntentId: paymentIntent.id,
                    userId: data.userId,
                    amount: data.amount / 100,
                    currency: data.currency,
                    status: 'pending',
                    description: 'TrainUp Premium Subscription',
                });
            }
            return paymentIntent;
        }
        catch (error) {
            console.error('❌ Error creando PaymentIntent:', error);
            throw error;
        }
    }
    async processWebhookNotification(webhookData, signature) {
        try {
            console.log('🔔 Procesando webhook de Stripe...');
            console.log('📊 Tipo de evento:', webhookData.type);
            switch (webhookData.type) {
                case 'checkout.session.completed':
                    return this.handleCheckoutSessionCompleted(webhookData.data.object);
                case 'payment_intent.succeeded':
                    return this.handlePaymentIntentSucceeded(webhookData.data.object);
                case 'payment_intent.payment_failed':
                    return this.handlePaymentIntentFailed(webhookData.data.object);
                default:
                    return {
                        processed: false,
                        reason: `Evento no manejado: ${webhookData.type}`,
                    };
            }
        }
        catch (error) {
            console.error('❌ Error procesando webhook:', error);
            return {
                processed: false,
                reason: 'Error procesando webhook',
                error: error.message,
            };
        }
    }
    handleCheckoutSessionCompleted(session) {
        console.log('✅ Sesión de checkout completada:', session.id);
        return {
            processed: true,
            reason: 'Checkout session completed',
            paymentData: {
                sessionId: session.id,
                customerEmail: session.customer_email,
                amountTotal: session.amount_total,
                currency: session.currency,
                paymentStatus: session.payment_status,
                metadata: session.metadata,
            },
        };
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        console.log('✅ PaymentIntent exitoso:', paymentIntent.id);
        await this.updatePaymentStatus(paymentIntent.id, 'succeeded', {
            paymentMethod: paymentIntent.payment_method,
            customerEmail: paymentIntent.receipt_email,
        });
        let subscription = null;
        if (paymentIntent.metadata?.user_id &&
            paymentIntent.metadata.user_id !== 'anonymous') {
            try {
                console.log('🔄 Creando suscripción para usuario:', paymentIntent.metadata.user_id);
                let planId = null;
                try {
                    const plans = await this.plansService.findAll();
                    if (Array.isArray(plans) && plans.length > 0) {
                        planId = plans[0].id;
                        console.log('📋 Usando plan existente:', plans[0].name, 'ID:', planId);
                    }
                    else {
                        const newPlan = await this.plansService.create({
                            name: 'TrainUp Premium',
                            price: 20.0,
                            durationDays: 30,
                            description: 'Plan premium con acceso completo a todas las funciones',
                        });
                        planId = newPlan.id;
                        console.log('🆕 Plan premium creado:', newPlan.name, 'ID:', planId);
                    }
                }
                catch (planError) {
                    console.error('❌ Error manejando plan:', planError);
                }
                subscription = await this.subscriptionsService.createAdmin({
                    userId: paymentIntent.metadata.user_id,
                    durationDays: 30,
                    planId: planId || undefined,
                });
                console.log('✅ Suscripción creada exitosamente:', subscription.id);
            }
            catch (error) {
                console.error('❌ Error creando suscripción:', error);
            }
        }
        return {
            processed: true,
            reason: 'Payment intent succeeded',
            paymentData: {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata,
                subscription: subscription
                    ? {
                        id: subscription.id,
                        status: subscription.status,
                        endAt: subscription.endAt,
                    }
                    : undefined,
            },
        };
    }
    async handlePaymentIntentFailed(paymentIntent) {
        console.log('❌ PaymentIntent fallido:', paymentIntent.id);
        await this.updatePaymentStatus(paymentIntent.id, 'failed', {
            failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        });
        return {
            processed: true,
            reason: 'Payment intent failed',
            paymentData: {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                lastPaymentError: paymentIntent.last_payment_error,
                metadata: paymentIntent.metadata,
            },
        };
    }
    async savePaymentToDatabase(data) {
        try {
            const payment = this.paymentRepository.create({
                stripePaymentIntentId: data.stripePaymentIntentId,
                userId: data.userId,
                amount: data.amount,
                currency: data.currency,
                status: data.status,
            });
            const savedPayment = await this.paymentRepository.save(payment);
            console.log('💾 Pago guardado en BD:', savedPayment.id);
            return savedPayment;
        }
        catch (error) {
            console.error('❌ Error guardando pago en BD:', error);
            throw error;
        }
    }
    async updatePaymentStatus(stripePaymentIntentId, status, additionalData) {
        try {
            const updateData = { status };
            if (additionalData?.paymentMethod) {
                updateData.paymentMethod = additionalData.paymentMethod;
            }
            if (additionalData?.customerEmail) {
                updateData.customerEmail = additionalData.customerEmail;
            }
            if (additionalData?.failureReason) {
                updateData.failureReason = additionalData.failureReason;
            }
            await this.paymentRepository.update({ stripePaymentIntentId }, updateData);
            console.log('🔄 Estado de pago actualizado:', stripePaymentIntentId, '->', status);
        }
        catch (error) {
            console.error('❌ Error actualizando estado de pago:', error);
        }
    }
    async getUserPayments(userId) {
        return this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllPayments() {
        return this.paymentRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        subscriptions_service_1.SubscriptionsService,
        plans_service_1.PlansService])
], StripeService);
