import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../common/guards/roles.guard'; 
import { Roles } from '../common/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { AdminListSubscriptionsDto, AdminPatchSubscriptionStatusDto } from './dto/admin-subscriptions.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Subscriptions')
@ApiBearerAuth()
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSubscriptionsController {
  constructor(private readonly subsSvc: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar suscripciones (admin)', description: 'Lista todas las suscripciones con filtros, paginación y orden.' })
  @ApiOkResponse({
    description: 'Listado paginado de suscripciones',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        total: { type: 'number', example: 42 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiQuery({ name: 'status', required: false, enum: ['active','cancelled','expired'] })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'planId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['createdAt:DESC','createdAt:ASC','startAt:DESC','startAt:ASC','endAt:DESC','endAt:ASC'],
    example: 'createdAt:DESC',
  })
  async list(@Query() q: AdminListSubscriptionsDto) {
    const { data, total, page, limit } = await this.subsSvc.adminList(q);
    return { ok: true, total, page, limit, data };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado suscripción (admin)', description: 'Cambia el estado a active | cancelled | expired.' })
  @ApiOkResponse({
    description: 'Suscripción actualizada',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: { type: 'object' },
      },
    },
  })
  async patchStatus(@Param('id') id: string, @Body() dto: AdminPatchSubscriptionStatusDto) {
    const updated = await this.subsSvc.adminChangeStatus(id, dto);
    return { ok: true, data: updated };
  }
}
