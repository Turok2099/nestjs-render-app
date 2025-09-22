import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      this.logger.error('STRIPE_SECRET_KEY no está configurada');
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });

    this.logger.log('Stripe service inicializado correctamente');
  }

  /**
   * Verifica la conectividad con Stripe
   */
  async testConnection(): Promise<boolean> {
    try {
      // Intentar obtener el balance de la cuenta
      const balance = await this.stripe.balance.retrieve();
      this.logger.log('✅ Conectividad con Stripe verificada');
      this.logger.log(
        `Balance disponible: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency || 'usd'}`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Error al conectar con Stripe:', error.message);
      return false;
    }
  }

  /**
   * Crea un producto en Stripe
   */
  async createProduct(
    name: string,
    description?: string,
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        type: 'service',
      });

      this.logger.log(`Producto creado: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error('Error al crear producto:', error.message);
      throw error;
    }
  }

  /**
   * Crea un precio para un producto
   */
  async createPrice(
    productId: string,
    amount: number,
    currency: string = 'usd',
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount * 100, // Stripe usa centavos
        currency,
        recurring: {
          interval: 'month',
        },
      });

      this.logger.log(`Precio creado: ${price.id}`);
      return price;
    } catch (error) {
      this.logger.error('Error al crear precio:', error.message);
      throw error;
    }
  }

  /**
   * Crea una sesión de checkout
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
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
    } catch (error) {
      this.logger.error('Error al crear sesión de checkout:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene el cliente de Stripe
   */
  getStripeClient(): Stripe {
    return this.stripe;
  }
}
