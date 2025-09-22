import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { StripeService } from '../stripe/stripe.service';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

export interface CreatePaymentIntentData extends CreatePaymentIntentDto {
  userId: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly plansService: PlansService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async testStripeConnection() {
    try {
      const stripe = this.stripeService.getStripeClient();
      const balance = await stripe.balance.retrieve();
      return {
        connected: true,
        balance: balance.available[0]?.amount || 0,
        currency: balance.available[0]?.currency || 'usd',
      };
    } catch (error) {
      this.logger.error('Error probando conexión con Stripe:', error.message);
      throw error;
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentData) {
    try {
      this.logger.log(`Creando PaymentIntent para usuario ${dto.userId}`);
      this.logger.log(`Datos recibidos: ${JSON.stringify(dto)}`);

      // 1. Verificar que el plan existe
      if (dto.planId) {
        this.logger.log(`Verificando plan: ${dto.planId}`);
        const plan = await this.plansService.findOne(dto.planId!);
        if (!plan) {
          this.logger.error(`Plan no encontrado: ${dto.planId}`);
          throw new NotFoundException('Plan no encontrado');
        }
        this.logger.log(`Plan encontrado: ${plan.id}`);
      } else {
        this.logger.log(
          'No se especificó planId, continuando sin verificación de plan',
        );
      }

      // 2. Verificar que el usuario no tenga un pago exitoso este mes
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const existingPayment = await this.paymentRepository.findOne({
        where: {
          userId: dto.userId,
          status: 'succeeded',
          createdAt: MoreThan(startOfMonth),
        },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'Ya tienes un pago exitoso este mes. Solo se permite un pago por mes.',
        );
      }

      // 3. Crear PaymentIntent usando el cliente de Stripe directamente
      this.logger.log('Iniciando creación de PaymentIntent en Stripe...');
      const stripe = this.stripeService.getStripeClient();

      const paymentIntentData = {
        amount: dto.amount * 100, // Stripe usa centavos
        currency: dto.currency,
        metadata: {
          userId: dto.userId,
          planId: dto.planId || null,
        },
        // Configurar para autorización inmediata
        capture_method: 'automatic' as const,
        confirmation_method: 'automatic' as const,
      };

      this.logger.log(
        `Datos para Stripe: ${JSON.stringify(paymentIntentData)}`,
      );

      const paymentIntent =
        await stripe.paymentIntents.create(paymentIntentData);
      this.logger.log(`PaymentIntent creado en Stripe: ${paymentIntent.id}`);

      // 4. Guardar en base de datos
      const payment = this.paymentRepository.create({
        userId: dto.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency,
        status: 'pending' as PaymentStatus,
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
    } catch (error) {
      this.logger.error('Error creando PaymentIntent:', error.message);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al crear PaymentIntent');
    }
  }

  async createCheckoutSession(
    planId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      this.logger.log(`Creando sesión de checkout para plan ${planId}`);

      const plan = await this.plansService.findOne(planId);
      if (!plan) {
        throw new NotFoundException('Plan no encontrado');
      }

      // Crear precio para el plan
      const price = await this.stripeService.createPrice(
        plan.id, // usar plan.id como productId temporal
        plan.price,
        'usd',
      );
      const priceId = price.id;

      const session = await this.stripeService.createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl,
      );

      return {
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      };
    } catch (error) {
      this.logger.error('Error creando sesión de checkout:', error.message);
      throw new BadRequestException('Error al crear sesión de checkout');
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      this.logger.log(`Confirmando pago: ${paymentIntentId}`);

      // Buscar el pago en la base de datos
      const payment = await this.paymentRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        throw new NotFoundException('Pago no encontrado');
      }

      // Verificar el estado en Stripe
      const stripe = this.stripeService.getStripeClient();
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Actualizar el estado en la base de datos
        payment.status = 'succeeded' as PaymentStatus;
        await this.paymentRepository.save(payment);

        this.logger.log(`Pago confirmado exitosamente: ${paymentIntentId}`);

        // Crear suscripción automáticamente si el pago tiene planId
        let subscriptionId: string | null = null;
        if (payment.planId) {
          try {
            this.logger.log(
              `Creando suscripción automáticamente para pago ${payment.id}`,
            );
            const subscription = await this.subscriptionsService.createFromPlan(
              payment.userId,
              payment.planId,
            );
            subscriptionId = subscription.id;

            // Actualizar el pago con el subscription_id
            payment.subscriptionId = subscription.id;
            await this.paymentRepository.save(payment);

            this.logger.log(`Suscripción creada: ${subscription.id}`);
          } catch (subscriptionError) {
            this.logger.error(
              'Error creando suscripción:',
              subscriptionError.message,
            );
            // No fallar el proceso si la suscripción no se puede crear
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
      } else {
        throw new BadRequestException('El pago no ha sido completado');
      }
    } catch (error) {
      this.logger.error('Error confirmando pago:', error.message);
      throw new BadRequestException('Error al confirmar pago');
    }
  }

  async createSubscriptionFromPayment(paymentId: string) {
    try {
      this.logger.log(`Creando suscripción desde pago: ${paymentId}`);

      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Pago no encontrado');
      }

      if (payment.status !== 'succeeded') {
        throw new BadRequestException(
          'El pago debe estar completado para crear una suscripción',
        );
      }

      if (!payment.planId) {
        throw new BadRequestException('El pago debe estar asociado a un plan');
      }

      // Crear la suscripción usando el método existente
      const subscription = await this.subscriptionsService.createFromPlan(
        payment.userId,
        payment.planId,
      );

      // Actualizar el pago con el ID de la suscripción
      payment.subscriptionId = subscription.id;
      await this.paymentRepository.save(payment);

      this.logger.log(`Suscripción creada: ${subscription.id}`);

      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      this.logger.error('Error creando suscripción desde pago:', error.message);
      throw new BadRequestException('Error al crear suscripción');
    }
  }

  async checkPaymentAndCreateSubscription(
    paymentIntentId: string,
    userId: string,
  ) {
    try {
      this.logger.log(`Verificando pago y suscripción para usuario ${userId}`);

      // Buscar el pago en la base de datos
      const payment = await this.paymentRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId, userId },
      });

      if (!payment) {
        throw new NotFoundException('Pago no encontrado para este usuario');
      }

      // Verificar el estado en Stripe
      const stripe = this.stripeService.getStripeClient();
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      const result = {
        paymentId: payment.id,
        paymentStatus: payment.status,
        stripeStatus: paymentIntent.status,
        amount: payment.amount,
        currency: payment.currency,
        subscriptionCreated: false,
        subscriptionId: null as string | null,
      };

      if (
        paymentIntent.status === 'succeeded' &&
        payment.status !== 'succeeded'
      ) {
        // Actualizar el estado del pago
        payment.status = 'succeeded' as PaymentStatus;
        await this.paymentRepository.save(payment);
        result.paymentStatus = 'succeeded';

        this.logger.log(`Pago confirmado: ${paymentIntentId}`);

        // Crear suscripción si no existe
        if (payment.planId && !payment.subscriptionId) {
          try {
            const subscription = await this.subscriptionsService.createFromPlan(
              userId,
              payment.planId,
            );

            // Actualizar el pago con el ID de la suscripción
            payment.subscriptionId = subscription.id;
            await this.paymentRepository.save(payment);

            result.subscriptionCreated = true;
            result.subscriptionId = subscription.id;

            this.logger.log(`Suscripción creada: ${subscription.id}`);
          } catch (subscriptionError) {
            this.logger.error(
              'Error creando suscripción:',
              subscriptionError.message,
            );
            result.subscriptionCreated = false;
          }
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Error verificando pago y suscripción:', error.message);
      throw new BadRequestException('Error al verificar estado del pago');
    }
  }

  /**
   * Crear PaymentIntent y confirmar automáticamente el pago
   * Este método simula un pago exitoso inmediatamente
   */
  async createAndConfirmPayment(dto: CreatePaymentIntentData) {
    try {
      this.logger.log(`Creando y confirmando pago para usuario ${dto.userId}`);

      // 1. Verificar que el plan existe
      const plan = await this.plansService.findOne(dto.planId!);
      if (!plan) {
        throw new NotFoundException('Plan no encontrado');
      }

      // 2. Verificar que el usuario no tenga un pago exitoso este mes
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const existingPayment = await this.paymentRepository.findOne({
        where: {
          userId: dto.userId,
          status: 'succeeded',
          createdAt: MoreThan(startOfMonth),
        },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'Ya tienes un pago exitoso este mes. Solo se permite un pago por mes.',
        );
      }

      // 3. Crear PaymentIntent
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

      // 4. Guardar pago en base de datos
      const payment = this.paymentRepository.create({
        userId: dto.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency,
        status: 'succeeded' as PaymentStatus, // Marcamos como exitoso inmediatamente
        planId: dto.planId,
        paymentType: 'subscription',
      });

      await this.paymentRepository.save(payment);

      // 5. Crear suscripción automáticamente
      const subscription = await this.subscriptionsService.createFromPlan(
        dto.userId,
        dto.planId!,
      );

      // 6. Actualizar el pago con el ID de la suscripción
      payment.subscriptionId = subscription.id;
      await this.paymentRepository.save(payment);

      this.logger.log(
        `Pago y suscripción creados: ${paymentIntent.id} -> ${subscription.id}`,
      );

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
    } catch (error) {
      this.logger.error('Error creando y confirmando pago:', error.message);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al procesar el pago');
    }
  }
}
