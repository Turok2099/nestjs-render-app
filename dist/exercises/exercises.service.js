"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercisesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exercise_entity_1 = require("./entities/exercise.entity");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ExercisesService = class ExercisesService {
    constructor(repo, cloudinaryService) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
    }
    toNum(v, def) {
        if (v === undefined || v === null || v === "")
            return def;
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : def;
    }
    async create(createExerciseDto, imageFile) {
        console.log('🔍 [ExercisesService] Iniciando creación de ejercicio...');
        console.log('📋 [ExercisesService] DTO recibido:', JSON.stringify(createExerciseDto, null, 2));
        console.log('🖼️ [ExercisesService] Archivo de imagen:', imageFile ? `Presente (${imageFile.originalname}, ${imageFile.size} bytes)` : 'Ausente');
        let imageUrl = null;
        if (imageFile) {
            try {
                console.log('☁️ [ExercisesService] Subiendo imagen a Cloudinary...');
                imageUrl = await this.cloudinaryService.uploadImage(imageFile);
                console.log('✅ [ExercisesService] Imagen subida exitosamente:', imageUrl);
            }
            catch (error) {
                console.error('❌ [ExercisesService] Error subiendo imagen a Cloudinary:', error);
                throw new Error(`Error subiendo imagen: ${error.message}`);
            }
        }
        try {
            console.log('💾 [ExercisesService] Creando entidad de ejercicio...');
            const exercise = this.repo.create({
                ...createExerciseDto,
                imageUrl,
            });
            console.log('💾 [ExercisesService] Guardando ejercicio en base de datos...');
            const savedExercise = await this.repo.save(exercise);
            console.log('✅ [ExercisesService] Ejercicio guardado exitosamente:', savedExercise.id);
            return savedExercise;
        }
        catch (error) {
            console.error('❌ [ExercisesService] Error guardando ejercicio:', error);
            throw error;
        }
    }
    async list(q) {
        const page = this.toNum(q.page, 1);
        const limit = this.toNum(q.limit, 20);
        const where = {};
        if (q.q)
            where.ejercicio = (0, typeorm_2.ILike)(`%${q.q}%`);
        if (q.muscleGroup)
            where.grupo = q.muscleGroup;
        if (q.type)
            where.categoria = q.type;
        if (q.programTag)
            where.programTag = q.programTag;
        if (typeof q.isActive === "string")
            where.isActive = q.isActive === "true";
        const [rows, total] = await this.repo.findAndCount({
            where,
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        const data = rows.map((e) => ({
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
            image_url: e.imageUrl,
            tiempo: e.tiempo,
            is_active: e.isActive,
            created_at: e.createdAt,
            updated_at: e.updatedAt,
        }));
        return { ok: true, total, page, limit, data };
    }
    async findOne(id) {
        const exercise = await this.repo.findOne({ where: { id } });
        if (!exercise) {
            throw new common_1.NotFoundException("Ejercicio no encontrado");
        }
        return exercise;
    }
    async update(id, updateExerciseDto, imageFile) {
        const exercise = await this.findOne(id);
        if (imageFile) {
            if (exercise.imageUrl) {
                await this.cloudinaryService.deleteImage(exercise.imageUrl);
            }
            exercise.imageUrl = await this.cloudinaryService.uploadImage(imageFile);
        }
        Object.assign(exercise, updateExerciseDto);
        return await this.repo.save(exercise);
    }
    async toggle(id, isActive) {
        const ex = await this.repo.findOne({ where: { id } });
        if (!ex)
            throw new common_1.NotFoundException("Ejercicio no encontrado");
        ex.isActive = isActive;
        const saved = await this.repo.save(ex);
        return { ok: true, data: { id: saved.id, isActive: saved.isActive } };
    }
    async remove(id) {
        const exercise = await this.findOne(id);
        if (exercise.imageUrl) {
            await this.cloudinaryService.deleteImage(exercise.imageUrl);
        }
        await this.repo.remove(exercise);
    }
};
exports.ExercisesService = ExercisesService;
exports.ExercisesService = ExercisesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => cloudinary_service_1.CloudinaryService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cloudinary_service_1.CloudinaryService])
], ExercisesService);
