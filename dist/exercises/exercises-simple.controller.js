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
exports.ExercisesSimpleController = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let ExercisesSimpleController = class ExercisesSimpleController {
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }
    async findAll() {
        try {
            console.log('🔍 Fetching exercises from database...');
            const result = await this.pool.query(`
        SELECT 
          id, grupo, imagen_grupo, ejercicio, imagen_ejercicio, 
          categoria, is_active, fuerza_series, fuerza_repeticiones,
          hipertrofia_series, hipertrofia_repeticiones, resistencia_series,
          resistencia_repeticiones, created_at, updated_at
        FROM exercises 
        ORDER BY created_at DESC
      `);
            console.log(`✅ Found ${result.rows.length} exercises`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error fetching exercises:', error);
            return {
                message: 'Error al obtener ejercicios',
                error: error.message,
                data: [],
            };
        }
    }
    async create(createExerciseDto) {
        try {
            console.log('🔍 Creating exercise:', createExerciseDto);
            const result = await this.pool.query(`
        INSERT INTO exercises (
          grupo, imagen_grupo, ejercicio, imagen_ejercicio, categoria, is_active,
          fuerza_series, fuerza_repeticiones, hipertrofia_series, hipertrofia_repeticiones,
          resistencia_series, resistencia_repeticiones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
                createExerciseDto.grupo,
                createExerciseDto.imagen_grupo || null,
                createExerciseDto.ejercicio,
                createExerciseDto.imagen_ejercicio || null,
                createExerciseDto.categoria || 'muscular',
                createExerciseDto.is_active !== undefined
                    ? createExerciseDto.is_active
                    : true,
                createExerciseDto.fuerza_series || null,
                createExerciseDto.fuerza_repeticiones || null,
                createExerciseDto.hipertrofia_series || null,
                createExerciseDto.hipertrofia_repeticiones || null,
                createExerciseDto.resistencia_series || null,
                createExerciseDto.resistencia_repeticiones || null,
            ]);
            console.log(`✅ Created exercise with ID: ${result.rows[0].id}`);
            return result.rows[0];
        }
        catch (error) {
            console.error('❌ Error creating exercise:', error);
            throw new Error(`Error al crear ejercicio: ${error.message}`);
        }
    }
    async update(id, updateExerciseDto) {
        try {
            console.log('🔍 Updating exercise:', id, updateExerciseDto);
            const result = await this.pool.query(`
        UPDATE exercises SET
          grupo = COALESCE($2, grupo),
          imagen_grupo = COALESCE($3, imagen_grupo),
          ejercicio = COALESCE($4, ejercicio),
          imagen_ejercicio = COALESCE($5, imagen_ejercicio),
          categoria = COALESCE($6, categoria),
          is_active = COALESCE($7, is_active),
          fuerza_series = COALESCE($8, fuerza_series),
          fuerza_repeticiones = COALESCE($9, fuerza_repeticiones),
          hipertrofia_series = COALESCE($10, hipertrofia_series),
          hipertrofia_repeticiones = COALESCE($11, hipertrofia_repeticiones),
          resistencia_series = COALESCE($12, resistencia_series),
          resistencia_repeticiones = COALESCE($13, resistencia_repeticiones),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [
                id,
                updateExerciseDto.grupo,
                updateExerciseDto.imagen_grupo,
                updateExerciseDto.ejercicio,
                updateExerciseDto.imagen_ejercicio,
                updateExerciseDto.categoria,
                updateExerciseDto.is_active,
                updateExerciseDto.fuerza_series,
                updateExerciseDto.fuerza_repeticiones,
                updateExerciseDto.hipertrofia_series,
                updateExerciseDto.hipertrofia_repeticiones,
                updateExerciseDto.resistencia_series,
                updateExerciseDto.resistencia_repeticiones,
            ]);
            if (result.rows.length === 0) {
                throw new Error('Ejercicio no encontrado');
            }
            console.log(`✅ Updated exercise with ID: ${id}`);
            return result.rows[0];
        }
        catch (error) {
            console.error('❌ Error updating exercise:', error);
            throw new Error(`Error al actualizar ejercicio: ${error.message}`);
        }
    }
    async updateStatus(id, statusDto) {
        try {
            console.log('🔍 Updating exercise status:', id, statusDto);
            const result = await this.pool.query(`
        UPDATE exercises SET
          is_active = $2,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id, statusDto.is_active]);
            if (result.rows.length === 0) {
                throw new Error('Ejercicio no encontrado');
            }
            console.log(`✅ Updated exercise status for ID: ${id}`);
            return result.rows[0];
        }
        catch (error) {
            console.error('❌ Error updating exercise status:', error);
            throw new Error(`Error al actualizar estado del ejercicio: ${error.message}`);
        }
    }
    async remove(id) {
        try {
            console.log('🔍 Deleting exercise:', id);
            const result = await this.pool.query(`
        DELETE FROM exercises WHERE id = $1 RETURNING *
      `, [id]);
            if (result.rows.length === 0) {
                throw new Error('Ejercicio no encontrado');
            }
            console.log(`✅ Deleted exercise with ID: ${id}`);
            return { message: 'Ejercicio eliminado correctamente' };
        }
        catch (error) {
            console.error('❌ Error deleting exercise:', error);
            throw new Error(`Error al eliminar ejercicio: ${error.message}`);
        }
    }
};
exports.ExercisesSimpleController = ExercisesSimpleController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExercisesSimpleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExercisesSimpleController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExercisesSimpleController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExercisesSimpleController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExercisesSimpleController.prototype, "remove", null);
exports.ExercisesSimpleController = ExercisesSimpleController = __decorate([
    (0, common_1.Controller)('exercises'),
    __metadata("design:paramtypes", [])
], ExercisesSimpleController);
