import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('test-stripe')
  @ApiOperation({ summary: 'Probar conexión con Stripe' })
  async testStripe() {
    try {
      const result = await this.paymentsService.testStripeConnection();
      return {
        success: true,
        message: 'Conexión con Stripe exitosa',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error probando Stripe:', error.message);
      return {
        success: false,
        message: error.message || 'Error al conectar con Stripe',
      };
    }
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear PaymentIntent para Stripe Elements' })
  @ApiResponse({
    status: 201,
    description: 'PaymentIntent creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `🔍 Usuario ${req.user?.email} (ID: ${req.user?.id}) creando PaymentIntent`,
      );
      this.logger.log(`📊 Datos del pago: ${dto.amount} ${dto.currency}`);

      // Validar que el usuario esté autenticado
      if (!req.user?.id) {
        this.logger.error('❌ Usuario no autenticado');
        return {
          success: false,
          message: 'Usuario no autenticado',
        };
      }

      // Crear el DTO completo con userId del JWT
      const paymentData = {
        ...dto,
        userId: req.user.id,
      };

      this.logger.log(`✅ UserId agregado desde JWT: ${paymentData.userId}`);

      const result =
        await this.paymentsService.createPaymentIntent(paymentData);

      return {
        success: true,
        message: 'PaymentIntent creado exitosamente',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error en createPaymentIntent:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear sesión de checkout para suscripciones' })
  @ApiResponse({
    status: 201,
    description: 'Sesión de checkout creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createCheckoutSession(
    @Body()
    body: {
      planId: string;
      successUrl: string;
      cancelUrl: string;
    },
    @Request() req: any,
  ) {
    try {
      this.logger.log(`Usuario ${req.user?.email} creando sesión de checkout`);

      const result = await this.paymentsService.createCheckoutSession(
        body.planId,
        req.user?.id,
        body.successUrl,
        body.cancelUrl,
      );

      return {
        success: true,
        message: 'Sesión de checkout creada exitosamente',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error en createCheckoutSession:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Get('confirm-payment/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar pago exitoso' })
  @ApiResponse({ status: 200, description: 'Pago confirmado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al confirmar pago' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Usuario ${req.user?.email} confirmando pago: ${paymentIntentId}`,
      );

      const result = await this.paymentsService.confirmPayment(paymentIntentId);

      return {
        success: true,
        message: 'Pago confirmado exitosamente',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error en confirmPayment:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Post('create-subscription-from-payment/:paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear suscripción manualmente desde un pago exitoso',
  })
  @ApiResponse({ status: 200, description: 'Suscripción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Pago no encontrado o no exitoso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createSubscriptionFromPayment(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Usuario ${req.user?.email} creando suscripción desde pago: ${paymentId}`,
      );

      const result =
        await this.paymentsService.createSubscriptionFromPayment(paymentId);

      return {
        success: true,
        message: 'Suscripción creada exitosamente',
        data: result,
      };
    } catch (error) {
      this.logger.error(
        'Error en createSubscriptionFromPayment:',
        error.message,
      );
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Get('status/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar estado de un pago y crear suscripción si es necesario',
  })
  @ApiResponse({ status: 200, description: 'Estado del pago verificado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async checkPaymentAndSubscriptionStatus(
    @Param('paymentIntentId') paymentIntentId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Usuario ${req.user?.email} verificando estado del pago: ${paymentIntentId}`,
      );

      const result =
        await this.paymentsService.checkPaymentAndCreateSubscription(
          paymentIntentId,
          req.user.id,
        );

      return {
        success: true,
        message: 'Estado verificado exitosamente',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error verificando estado del pago:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Post('create-and-confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear PaymentIntent y confirmar pago automáticamente',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago y suscripción creados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o pago duplicado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createAndConfirmPayment(
    @Body() dto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `🔍 Usuario ${req.user?.email} (ID: ${req.user?.id}) creando pago con confirmación automática`,
      );
      this.logger.log(
        `📊 Datos del pago: ${dto.amount} ${dto.currency} - Plan: ${dto.planId}`,
      );

      // Validar que el usuario esté autenticado
      if (!req.user?.id) {
        this.logger.error('❌ Usuario no autenticado');
        return {
          success: false,
          message: 'Usuario no autenticado',
        };
      }

      // Crear el DTO completo con userId del JWT
      const paymentData = {
        ...dto,
        userId: req.user.id,
      };

      this.logger.log(`✅ UserId agregado desde JWT: ${paymentData.userId}`);

      const result =
        await this.paymentsService.createAndConfirmPayment(paymentData);

      return {
        success: true,
        message: 'Pago procesado y suscripción creada exitosamente',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error en createAndConfirmPayment:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar pago exitoso (POST)' })
  @ApiResponse({ status: 200, description: 'Pago confirmado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al confirmar pago' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async confirmPaymentPost(
    @Body() body: { paymentIntentId: string },
    @Request() req: any,
  ) {
    try {
      this.logger.log(
        `Usuario ${req.user?.email} confirmando pago: ${body.paymentIntentId}`,
      );

      const result = await this.paymentsService.confirmPayment(
        body.paymentIntentId,
      );

      return {
        success: true,
        message: 'Pago confirmado exitosamente',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error en confirmPayment POST:', error.message);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }
}
