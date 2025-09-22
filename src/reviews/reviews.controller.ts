import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto, UpdateReviewStatusDto, ModerateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // Público: listado (aprobadas + activas)
  @Get()
  @ApiOperation({ summary: 'Listado público de reseñas aprobadas' })
  @ApiQuery({ name: 'order', required: false, enum: ['recent','top'] })
  @ApiQuery({ name: 'rating', required: false, example: 5 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async list(@Query() q: ReviewsQueryDto) {
    return this.reviews.listPublic(q);
  }

  // Usuario: mis reseñas
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis reseñas (usuario autenticado)' })
  async my(@GetUser() user: { userId: string }, @Query() q: ReviewsQueryDto) {
    return this.reviews.myReviews(user.userId, q);
  }

  // Usuario: crear / actualizar / borrar (lógico)
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear reseña (requiere reserva previa y suscripción activa)' })
  async create(@GetUser() user: { userId: string }, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Actualizar mi reseña' })
  async update(@GetUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviews.update(user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Eliminar mi reseña (borrado lógico)' })
  async remove(@GetUser() user: { userId: string }, @Param('id') id: string) {
    return this.reviews.softDelete(user.userId, id);
  }

  // Admin: moderación y vista
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listado admin de reseñas (con filtros)' })
  @ApiQuery({ name: 'includeInactive', required: false, example: 'true' })
  @ApiQuery({ name: 'status', required: false, enum: ['approved','pending','rejected'] })
  async adminList(@Query() q: any) {
    return this.reviews.adminList(q);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Activar/Desactivar reseña (borrado lógico) — admin' })
  async adminSetStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviews.adminSetStatus(id, dto.isActive);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Aprobar o rechazar reseña — admin' })
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviews.adminModerate(id, dto.status);
  }

  @Get('stats/global')
  @ApiOperation({ summary: 'Estadísticas globales: promedio y distribución 1..5' })
  async stats() {
    return this.reviews.stats();
  }
}
