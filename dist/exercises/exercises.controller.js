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
exports.ExercisesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exercises_service_1 = require("./exercises.service");
const list_exercise_dto_1 = require("./dto/list-exercise.dto");
let ExercisesController = class ExercisesController {
    constructor(exercisesService) {
        this.exercisesService = exercisesService;
    }
    async list(query) {
        try {
            const publicQuery = {
                ...query,
                isActive: "true",
            };
            const result = await this.exercisesService.list(publicQuery);
            const exercisesForRoutine = result.data.map((exercise) => ({
                id: exercise.id,
                grupo: exercise.grupo,
                ejercicio: exercise.ejercicio,
                categoria: exercise.categoria,
                imagenGrupo: exercise.imagen_grupo || "/Train UP.png",
                imagenEjercicio: exercise.imagen_ejercicio ||
                    exercise.image_url ||
                    "/Train UP.png",
                fuerza: {
                    series: exercise.fuerza_series || 0,
                    repeticiones: exercise.fuerza_repeticiones || 0,
                },
                hipertrofia: {
                    series: exercise.hipertrofia_series || 0,
                    repeticiones: exercise.hipertrofia_repeticiones || 0,
                },
                resistencia: {
                    series: exercise.resistencia_series || 0,
                    repeticiones: exercise.resistencia_repeticiones || exercise.tiempo || "30 min",
                },
            }));
            return {
                ok: true,
                total: result.total,
                page: result.page,
                limit: result.limit,
                data: exercisesForRoutine,
            };
        }
        catch (error) {
            console.error("Error en exercises controller:", error);
            throw new common_1.HttpException("Error al obtener ejercicios", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCategories() {
        try {
            const result = await this.exercisesService.list({
                isActive: "true",
                limit: "1000",
            });
            const categories = new Map();
            result.data.forEach((exercise) => {
                if (!categories.has(exercise.grupo)) {
                    categories.set(exercise.grupo, exercise.imagen_grupo || "/Train UP.png");
                }
            });
            return {
                ok: true,
                data: Array.from(categories.entries()).map(([grupo, imagen]) => ({
                    grupo,
                    imagen,
                })),
            };
        }
        catch (error) {
            console.error("Error obteniendo categorías:", error);
            throw new common_1.HttpException("Error al obtener categorías", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const exercise = await this.exercisesService.findOne(id);
            if (!exercise.isActive) {
                throw new common_1.HttpException("Ejercicio no disponible", common_1.HttpStatus.NOT_FOUND);
            }
            return {
                ok: true,
                data: {
                    id: exercise.id,
                    grupo: exercise.grupo,
                    ejercicio: exercise.ejercicio,
                    categoria: exercise.categoria,
                    imagenGrupo: exercise.imagenGrupo || "/Train UP.png",
                    imagenEjercicio: exercise.imagenEjercicio ||
                        exercise.imageUrl ||
                        "/Train UP.png",
                    fuerza: {
                        series: exercise.fuerzaSeries || 0,
                        repeticiones: exercise.fuerzaRepeticiones || 0,
                    },
                    hipertrofia: {
                        series: exercise.hipertrofiaSeries || 0,
                        repeticiones: exercise.hipertrofiaRepeticiones || 0,
                    },
                    resistencia: {
                        series: exercise.resistenciaSeries || 0,
                        repeticiones: exercise.resistenciaRepeticiones || exercise.tiempo || "30 min",
                    },
                },
            };
        }
        catch (error) {
            console.error("Error obteniendo ejercicio:", error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException("Error al obtener ejercicio", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ExercisesController = ExercisesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Listar ejercicios públicos (solo activos)" }),
    (0, swagger_1.ApiQuery)({
        name: "q",
        required: false,
        type: String,
        description: "Búsqueda por nombre",
    }),
    (0, swagger_1.ApiQuery)({
        name: "muscleGroup",
        required: false,
        type: String,
        description: "Filtrar por grupo muscular",
    }),
    (0, swagger_1.ApiQuery)({
        name: "type",
        required: false,
        type: String,
        description: "Filtrar por tipo/categoría",
    }),
    (0, swagger_1.ApiQuery)({
        name: "page",
        required: false,
        type: Number,
        description: "Número de página",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Elementos por página",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Lista de ejercicios obtenida exitosamente",
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_exercise_dto_1.ListExercisesDto]),
    __metadata("design:returntype", Promise)
], ExercisesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("categories"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener categorías/grupos musculares disponibles" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Categorías obtenidas exitosamente",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExercisesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener ejercicio por ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Ejercicio obtenido exitosamente" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Ejercicio no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExercisesController.prototype, "findOne", null);
exports.ExercisesController = ExercisesController = __decorate([
    (0, swagger_1.ApiTags)("exercises"),
    (0, common_1.Controller)("exercises"),
    __metadata("design:paramtypes", [exercises_service_1.ExercisesService])
], ExercisesController);
