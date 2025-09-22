import { Body, Controller, Get, Param, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, AdminCreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado de suscripción del usuario autenticado' })
  async myStatus(@GetUser() user: { userId: string }) {
    return this.subs.statusFor(user.userId);
  }

  /**
   * Usuario crea su suscripción a partir de un plan. Body: { planId }
   * userId sale del token. Duración se toma del plan.
   */
  @Post('create')
  @ApiOperation({ summary: 'Crear suscripción (usuario autenticado, usa plan.durationDays)' })
  async createSelf(@GetUser() user: { userId: string }, @Body() dto: CreateSubscriptionDto) {
    return this.subs.createFromPlan(user.userId, dto.planId);
  }

  /**
   * Admin: crear/extender para cualquier usuario (webhook, soporte).
   * Puede enviar durationDays o planId (o ambos). Si envía planId y no envía durationDays,
   * se usa la duración del plan.
   */
  @Post('admin/create')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear o extender suscripción (admin/webhook)' })
  async createAdmin(@Body() dto: AdminCreateSubscriptionDto) {
    return this.subs.createAdmin(dto);
  }

  @Post(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Cancelar suscripción (admin)' })
  async cancel(@Param('id') id: string) {
    return this.subs.cancel(id);
  }

  // Trial solo en desarrollo (habilitado por ENV)
  @Post('dev/trial')
  @ApiOperation({ summary: 'Crear trial para el usuario autenticado (solo DEV con flag)' })
  async devTrial(@GetUser() user: { userId: string }) {
    if (process.env.ENABLE_DEV_TRIAL !== '1' || process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Trial dev deshabilitado');
    }
    const days = Number(process.env.DEV_TRIAL_DAYS || 7);
    return this.subs.createAdmin({ userId: user.userId, durationDays: days });
  }
}
