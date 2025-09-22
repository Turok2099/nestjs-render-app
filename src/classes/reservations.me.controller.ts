import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ReservationsService } from './reservations.service';
import { GetMyReservationsDto } from './dto/get-my-reservations.dto';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsMeController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Historial del usuario autenticado' })
  async getMine(
    @GetUser() user: { userId?: string; id?: string; sub?: string },
    @Query() q: GetMyReservationsDto,
  ) {
    const userId = String(user?.userId ?? user?.id ?? user?.sub);
    return this.reservations.findByUser(userId, q);
  }
}