// src/classes/classes.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { AdminClassesQueryDto } from './dto/admin-classes-query.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateClassDto } from './dto/create-class.dto';
import { Class } from './entities/class.entity';
import { AdminAssignTrainerDto } from './dto/admin-assign-trainer.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las clases disponibles' })
  @ApiResponse({ status: 200 })
  async findAll() {
    return this.classesService.findAll();
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Listado de clases con filtros y ocupación' })
  @ApiQuery({ name: 'goal', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'yyyy-mm-dd' })
  @ApiQuery({ name: 'timeOfDay', required: false, enum: ['morning','afternoon','evening'] })
  @ApiQuery({ name: 'trainerId', required: false, description: 'UUID entrenador' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async schedule(@Query() q: ScheduleQueryDto) {
    return this.classesService.schedule(q);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('trainer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agenda del entrenador autenticado' })
  async myAgenda(
    @GetUser() user: { userId: string },
    @Query() q: ScheduleQueryDto,
  ) {
    return this.classesService.schedule({ ...q, trainerId: user.userId });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listado de clases para Admin (puede incluir inactivas)' })
  async adminList(@Query() q: AdminClassesQueryDto) {
    return this.classesService.adminList(q);
  }

  @Get('by-day/:day')
  @ApiOperation({ summary: 'Obtener clases por día de la semana' })
  async findByDay(@Param('day') day: string) {
    return this.classesService.findByDay(day);
  }

  @Get(':id/reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('trainer', 'admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Listado de asistentes de una clase (trainer dueño o admin)' })
  async classReservations(
    @GetUser() user: { userId: string; role: string },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.classesService.classReservationsFor(user, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva clase (admin)' })
  @ApiResponse({ status: 201 })
  async create(@Body() createClassDto: CreateClassDto): Promise<Class> {
    return this.classesService.create(createClassDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Editar datos de una clase (admin)' })
  async adminUpdate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.adminUpdate(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Activar/Desactivar clase (borrado lógico)' })
  async adminSetStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassStatusDto,
    @Request() req,
  ) {
    console.log('🔍 === DEBUG TOGGLE CLASS ===');
    console.log('📥 Request ID:', id);
    console.log('📥 Request Body:', dto);
    console.log('👤 User from JWT:', req.user);
    console.log('🎭 User Role:', req.user?.role);
    console.log('✅ Is Admin:', req.user?.role === 'admin');
    
    const result = await this.classesService.adminSetStatus(id, dto.isActive);
    console.log('📤 Service Result:', result);
    
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clase por ID' })
  @ApiParam({ name: 'id', description: 'ID de la clase', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Clase encontrada' })
  @ApiResponse({ status: 404, description: 'Clase no encontrada' })
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Class> {
    return this.classesService.findById(id);
  }
    // +++ NUEVO: asignar tutor (admin) +++
  @Patch('admin/:id/assign-trainer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Asignar tutor a una clase (admin)' })
  async adminAssignTrainer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminAssignTrainerDto,
  ) {
    const updated = await this.classesService.adminAssignTrainer(id, dto.trainerId);
    return { ok: true, data: updated };
  }

  // +++ NUEVO: asignarse como entrenador (trainer) +++
  @Patch(':id/assign-me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('trainer')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Asignarse como entrenador de una clase (trainer)' })
  async assignMeAsTrainer(
    @GetUser() user: { userId: string },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const updated = await this.classesService.assignTrainerToClass(id, user.userId);
    return { ok: true, data: updated };
  }

  // +++ OPCIONAL: alias de toggle (admin) para front +++
  // (Hace lo mismo que tu PATCH /classes/:id/status, pero con la ruta que quizá pidieron)
  @Patch('admin/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Activar/Desactivar clase (alias admin)' })
  async adminToggle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassStatusDto, // reutiliza tu DTO existente { isActive: boolean }
  ) {
    const res = await this.classesService.adminSetStatus(id, dto.isActive);
    return { ok: true, data: res };
  }

}
