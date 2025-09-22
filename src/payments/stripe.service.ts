import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PlansService } from '../plans/plans.service';

export interface CreateSubscriptionPaymentDto {
  userId: string;
  planId: string;
  userEmail: string;
  userName: string;
}

export interface WebhookResult {
  processed: boolean;
  reason: string;
  paymentData?: any;
  error?: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private subscriptionsService: SubscriptionsService,
    private plansService: PlansService,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY no está configurada en las variables de entorno',
      );
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createSubscriptionPayment(data: CreateSubscriptionPaymentDto) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'TrainUp Premium Subscription',
                description:
                  'Acceso completo a todos los cursos y contenido premium',
              },
              unit_amount: 2000, // $20.00 USD en centavos
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
        expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60, // 23 horas
      });

      return session;
    } catch (error) {
      console.error('Error creando sesión de pago:', error);
      throw error;
    }
  }

  async getPaymentInfo(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error obteniendo información de pago:', error);
      throw error;
    }
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    userId?: string;
  }): Promise<any> {
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

      // Guardar el pago en la base de datos
      if (data.userId) {
        await this.savePaymentToDatabase({
          stripePaymentIntentId: paymentIntent.id,
          userId: data.userId,
          amount: data.amount / 100, // Convertir de centavos a dólares
          currency: data.currency,
          status: 'pending',
          description: 'TrainUp Premium Subscription',
        });
      }

      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creando PaymentIntent:', error);
      throw error;
    }
  }

  async processWebhookNotification(
    webhookData: any,
    signature: string,
  ): Promise<WebhookResult> {
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
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return {
        processed: false,
        reason: 'Error procesando webhook',
        error: error.message,
      };
    }
  }

  private handleCheckoutSessionCompleted(session: any): WebhookResult {
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

  private async handlePaymentIntentSucceeded(
    paymentIntent: any,
  ): Promise<WebhookResult> {
    console.log('✅ PaymentIntent exitoso:', paymentIntent.id);

    // Actualizar el pago en la base de datos
    await this.updatePaymentStatus(paymentIntent.id, 'succeeded', {
      paymentMethod: paymentIntent.payment_method,
      customerEmail: paymentIntent.receipt_email,
    });

    // Crear suscripción automáticamente si hay userId en metadata
    let subscription: any = null;
    if (
      paymentIntent.metadata?.user_id &&
      paymentIntent.metadata.user_id !== 'anonymous'
    ) {
      try {
        console.log(
          '🔄 Creando suscripción para usuario:',
          paymentIntent.metadata.user_id,
        );

        // Buscar un plan premium existente o crear uno por defecto
        let planId: string | null = null;
        try {
          const plans = await this.plansService.findAll();
          if (Array.isArray(plans) && plans.length > 0) {
            // Usar el primer plan disponible
            planId = plans[0].id;
            console.log(
              '📋 Usando plan existente:',
              plans[0].name,
              'ID:',
              planId,
            );
          } else {
            // Crear un plan premium por defecto
            const newPlan = await this.plansService.create({
              name: 'TrainUp Premium',
              price: 20.0,
              durationDays: 30,
              description:
                'Plan premium con acceso completo a todas las funciones',
            });
            planId = newPlan.id;
            console.log('🆕 Plan premium creado:', newPlan.name, 'ID:', planId);
          }
        } catch (planError) {
          console.error('❌ Error manejando plan:', planError);
          // Continuar sin planId (suscripción de 30 días por defecto)
        }

        // Crear suscripción de 30 días
        subscription = await this.subscriptionsService.createAdmin({
          userId: paymentIntent.metadata.user_id,
          durationDays: 30, // 30 días de suscripción premium
          planId: planId || undefined, // ID del plan (puede ser undefined)
        });

        console.log('✅ Suscripción creada exitosamente:', subscription.id);
      } catch (error) {
        console.error('❌ Error creando suscripción:', error);
        // No lanzamos el error para no interrumpir el flujo de pago
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

  private async handlePaymentIntentFailed(
    paymentIntent: any,
  ): Promise<WebhookResult> {
    console.log('❌ PaymentIntent fallido:', paymentIntent.id);

    // Actualizar el pago en la base de datos
    await this.updatePaymentStatus(paymentIntent.id, 'failed', {
      failureReason:
        paymentIntent.last_payment_error?.message || 'Payment failed',
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

  // Métodos para manejar la base de datos
  private async savePaymentToDatabase(data: {
    stripePaymentIntentId: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
  }): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create({
        stripePaymentIntentId: data.stripePaymentIntentId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        status: data.status as any,
      });

      const savedPayment = await this.paymentRepository.save(payment);
      console.log('💾 Pago guardado en BD:', savedPayment.id);
      return savedPayment;
    } catch (error) {
      console.error('❌ Error guardando pago en BD:', error);
      throw error;
    }
  }

  private async updatePaymentStatus(
    stripePaymentIntentId: string,
    status: 'succeeded' | 'failed' | 'processing',
    additionalData?: {
      paymentMethod?: string;
      customerEmail?: string;
      failureReason?: string;
    },
  ): Promise<void> {
    try {
      const updateData: any = { status };

      if (additionalData?.paymentMethod) {
        updateData.paymentMethod = additionalData.paymentMethod;
      }
      if (additionalData?.customerEmail) {
        updateData.customerEmail = additionalData.customerEmail;
      }
      if (additionalData?.failureReason) {
        updateData.failureReason = additionalData.failureReason;
      }

      await this.paymentRepository.update(
        { stripePaymentIntentId },
        updateData,
      );

      console.log(
        '🔄 Estado de pago actualizado:',
        stripePaymentIntentId,
        '->',
        status,
      );
    } catch (error) {
      console.error('❌ Error actualizando estado de pago:', error);
    }
  }

  // Método público para obtener pagos de un usuario
  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Método público para obtener todos los pagos (admin)
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }
}
