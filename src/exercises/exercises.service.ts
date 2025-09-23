// src/exercises/exercises.service.ts
import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { ListExercisesDto } from './dto/list-exercise.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise) private readonly repo: Repository<Exercise>,
    @Inject(forwardRef(() => CloudinaryService))
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private toNum(v: unknown, def: number) {
    if (v === undefined || v === null || v === '') return def;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : def;
  }

  async create(createExerciseDto: CreateExerciseDto, imageFile?: Express.Multer.File): Promise<Exercise> {
    let imageUrl: string | null = null;

    // Subir imagen a Cloudinary si existe
    if (imageFile) {
      imageUrl = await this.cloudinaryService.uploadImage(imageFile);
    }

    const exercise = this.repo.create({
      ...createExerciseDto,
      imageUrl,
    });

    return await this.repo.save(exercise);
  }

  async list(q: ListExercisesDto) {
    const page = this.toNum((q as any).page, 1);
    const limit = this.toNum((q as any).limit, 20);

    const where: any = {};
    if (q.q) where.ejercicio = ILike(`%${q.q}%`);
    if (q.muscleGroup) where.grupo = q.muscleGroup;
    if (q.type) where.categoria = q.type;
    if (q.programTag) where.programTag = q.programTag;
    if (typeof q.isActive === 'string') where.isActive = q.isActive === 'true';

    const [rows, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mapear a las claves que espera el frontend
    const data = rows.map(e => ({
      id: e.id,
      grupo: e.grupo,
      ejercicio: e.ejercicio,
      categoria: e.categoria,
      imagen_grupo: e.imagenGrupo,
      imagen_ejercicio: e.imagenEjercicio,
      fuerza_series: e.fuerzaSeries,
      fuerza_repeticiones: e.fuerzaRepeticiones,
      hipertrofia_series: e.hipertrofiaSeries,
      hipertrofia_repeticiones: e.hipertrofiaRepeticiones,
      resistencia_series: e.resistenciaSeries,
      resistencia_repeticiones: e.resistenciaRepeticiones,
      is_active: e.isActive,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
    }));

    return { ok: true, total, page, limit, data };
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.repo.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException('Ejercicio no encontrado');
    }
    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto, imageFile?: Express.Multer.File): Promise<Exercise> {
    const exercise = await this.findOne(id);

    // Si hay una nueva imagen, subirla y eliminar la anterior si existe
    if (imageFile) {
      // Eliminar imagen anterior si existe
      if (exercise.imageUrl) {
        await this.cloudinaryService.deleteImage(exercise.imageUrl);
      }
      
      // Subir nueva imagen
      exercise.imageUrl = await this.cloudinaryService.uploadImage(imageFile);
    }

    // Actualizar otros campos
    Object.assign(exercise, updateExerciseDto);

    return await this.repo.save(exercise);
  }

  async toggle(id: string, isActive: boolean) {
    const ex = await this.repo.findOne({ where: { id } });
    if (!ex) throw new NotFoundException('Ejercicio no encontrado');
    ex.isActive = isActive;
    const saved = await this.repo.save(ex);
    return { ok: true, data: { id: saved.id, isActive: saved.isActive } };
  }

  async remove(id: string): Promise<void> {
    const exercise = await this.findOne(id);
    
    // Eliminar imagen de Cloudinary si existe
    if (exercise.imageUrl) {
      await this.cloudinaryService.deleteImage(exercise.imageUrl);
    }
    
    await this.repo.remove(exercise);
  }
}