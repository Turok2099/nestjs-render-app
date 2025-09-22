import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsUserController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Historial de reservas del usuario autenticado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, description: 'booked|attended|cancelled|no_show' })
  async myHistory(
    @GetUser() user: { userId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'booked' | 'attended' | 'cancelled' | 'no_show',
  ) {
    const res = await this.reservations.userHistory(user.userId, Number(page) || 1, Number(limit) || 10);

    if (status) {
      return {
        ...res,
        items: res.items.filter((i) => i.status === status),
        total: res.items.filter((i) => i.status === status).length,
      };
    }
    return res;
  }
}