import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Put, 
  Delete, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ExercisesService } from './exercises.service';
import { ListExercisesDto } from './dto/list-exercise.dto';
import { ToggleExerciseDto } from './dto/toggle-exercise.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { memoryStorage } from 'multer';

@ApiTags('Admin - Exercises')
@ApiBearerAuth()
@Controller('admin/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminExercisesController {
  constructor(private readonly svc: ExercisesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo ejercicio' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createExerciseDto: CreateExerciseDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(image\/jpg|image\/jpeg|image\/png|image\/webp)$/ })
        ],
        fileIsRequired: false,
      }),
    )
    imageFile?: Express.Multer.File,
  ) {
    const exercise = await this.svc.create(createExerciseDto, imageFile);
    return {
      ok: true,
      data: {
        id: exercise.id,
        nombre: exercise.name,
        grupoMuscular: exercise.muscleGroup,
        series: exercise.series,
        repeticiones: exercise.repetitions,
        tipo: exercise.type,
        programTag: exercise.programTag,
        imagen: exercise.imageUrl,
        isActive: exercise.isActive,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar ejercicios (admin)' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'muscleGroup', required: false, type: String, example: 'PECHO' })
  @ApiQuery({ name: 'type', required: false, type: String, example: 'muscular' })
  @ApiQuery({ name: 'programTag', required: false, enum: ['max','hyper'] })
  @ApiQuery({ name: 'isActive', required: false, type: String, example: 'true' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiOkResponse({ description: 'Listado de ejercicios con estructura de BD' })
  async list(@Query() q: ListExercisesDto) {
    const result = await this.svc.list(q);
    return result.data; // Devolver directamente el array de ejercicios
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ejercicio por ID' })
  async findOne(@Param('id') id: string) {
    const exercise = await this.svc.findOne(id);
    return {
      ok: true,
      data: {
        id: exercise.id,
        nombre: exercise.name,
        grupoMuscular: exercise.muscleGroup,
        series: exercise.series,
        repeticiones: exercise.repetitions,
        tipo: exercise.type,
        programTag: exercise.programTag,
        imagen: exercise.imageUrl,
        isActive: exercise.isActive,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar ejercicio' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(image\/jpg|image\/jpeg|image\/png|image\/webp)$/ })
        ],
        fileIsRequired: false,
      }),
    )
    imageFile?: Express.Multer.File,
  ) {
    const exercise = await this.svc.update(id, updateExerciseDto, imageFile);
    return {
      ok: true,
      data: {
        id: exercise.id,
        nombre: exercise.name,
        grupoMuscular: exercise.muscleGroup,
        series: exercise.series,
        repeticiones: exercise.repetitions,
        tipo: exercise.type,
        programTag: exercise.programTag,
        imagen: exercise.imageUrl,
        isActive: exercise.isActive,
      },
    };
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar/Desactivar ejercicio' })
  @ApiOkResponse({ description: 'Estado actualizado' })
  toggle(@Param('id') id: string, @Body() dto: ToggleExerciseDto) { 
    return this.svc.toggle(id, dto.isActive); 
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ejercicio' })
  async remove(@Param('id') id: string) {
    await this.svc.remove(id);
    return { ok: true, message: 'Ejercicio eliminado correctamente' };
  }
}