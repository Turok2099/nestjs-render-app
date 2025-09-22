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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            this.logger.error('STRIPE_SECRET_KEY no está configurada');
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2025-08-27.basil',
        });
        this.logger.log('Stripe service inicializado correctamente');
    }
    async testConnection() {
        try {
            const balance = await this.stripe.balance.retrieve();
            this.logger.log('✅ Conectividad con Stripe verificada');
            this.logger.log(`Balance disponible: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'usd'}`);
            return true;
        }
        catch (error) {
            this.logger.error('❌ Error al conectar con Stripe:', error.message);
            return false;
        }
    }
    async createProduct(name, description) {
        try {
            const product = await this.stripe.products.create({
                name,
                description,
                type: 'service',
            });
            this.logger.log(`Producto creado: ${product.id}`);
            return product;
        }
        catch (error) {
            this.logger.error('Error al crear producto:', error.message);
            throw error;
        }
    }
    async createPrice(productId, amount, currency = 'usd') {
        try {
            const price = await this.stripe.prices.create({
                product: productId,
                unit_amount: amount * 100,
                currency,
                recurring: {
                    interval: 'month',
                },
            });
            this.logger.log(`Precio creado: ${price.id}`);
            return price;
        }
        catch (error) {
            this.logger.error('Error al crear precio:', error.message);
            throw error;
        }
    }
    async createCheckoutSession(priceId, successUrl, cancelUrl) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
            });
            this.logger.log(`Sesión de checkout creada: ${session.id}`);
            return session;
        }
        catch (error) {
            this.logger.error('Error al crear sesión de checkout:', error.message);
            throw error;
        }
    }
    getStripeClient() {
        return this.stripe;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
