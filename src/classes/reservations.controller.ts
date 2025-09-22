import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ActiveSubscriptionGuard } from '../subscriptions/guards/active-subscription.guard';
import { IsIn } from 'class-validator';

class UpdateReservationStatusDto {
  @ApiProperty({ enum: ['attended', 'no_show', 'cancelled'] })
  @IsIn(['attended', 'no_show', 'cancelled'])
  status: 'attended' | 'no_show' | 'cancelled';
}

@ApiTags('classes')
@Controller('classes')
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  // Reservar (usuario autenticado + suscripción activa)
  @Post(':id/reservations')
  @UseGuards(JwtAuthGuard, ActiveSubscriptionGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la clase' })
  @ApiOperation({ summary: 'Reservar una clase (requiere suscripción activa)' })
  async book(@GetUser() user: { userId: string }, @Param('id') classId: string) {
    return this.reservations.book(user.userId, classId);
  }

  // Cancelar mi reserva
  @Delete(':id/reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la clase' })
  @ApiOperation({ summary: 'Cancelar mi reserva' })
  async cancelMine(@GetUser() user: { userId: string }, @Param('id') classId: string) {
    return this.reservations.cancelMine(user.userId, classId);
  }

  // Cambiar estado (trainer dueño o admin)
  @Patch(':id/reservations/:reservationId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('trainer', 'admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'reservationId', format: 'uuid' })
  @ApiOperation({ summary: 'Marcar asistencia / no_show / cancelada (trainer o admin)' })
  async setStatus(
    @GetUser() user: { userId: string; role: string },
    @Param('id') classId: string,
    @Param('reservationId') reservationId: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservations.setStatusAsTrainerOrAdmin(user, classId, reservationId, dto.status);
  }
}
