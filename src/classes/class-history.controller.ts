import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ClassHistoryService } from './class-history.service';
import { ClassHistoryResponseDto } from './dto/class-history-response.dto';
import { CreateClassHistoryDto } from './dto/create-class-history.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('class-history')
@ApiBearerAuth()
@Controller('class-history')
@UseGuards(JwtAuthGuard)
export class ClassHistoryController {
  constructor(private readonly classHistoryService: ClassHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar asistencia a clase' })
  @ApiResponse({ status: 201, description: 'Asistencia registrada exitosamente' })
  async create(@Request() req, @Body() createClassHistoryDto: CreateClassHistoryDto) {
    return await this.classHistoryService.create(req.user.userId, createClassHistoryDto);
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Obtener historial de clases del usuario' })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente' })
  async getMyHistory(@Request() req): Promise<ClassHistoryResponseDto[]> {
    return await this.classHistoryService.findByUser(req.user.userId);
  }
}