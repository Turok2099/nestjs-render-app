import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ExercisesService } from "./exercises.service";
import { ListExercisesDto } from "./dto/list-exercise.dto";

@ApiTags("exercises")
@Controller("exercises")
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: "Listar ejercicios públicos (solo activos)" })
  @ApiQuery({ name: "q", required: false, type: String, description: "Búsqueda por nombre" })
  @ApiQuery({ name: "muscleGroup", required: false, type: String, description: "Filtrar por grupo muscular" })
  @ApiQuery({ name: "type", required: false, type: String, description: "Filtrar por tipo/categoría" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Número de página" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Elementos por página" })
  @ApiResponse({ status: 200, description: "Lista de ejercicios obtenida exitosamente" })
  async list(@Query() query: ListExercisesDto) {
    try {
      // Forzar que solo se muestren ejercicios activos para usuarios públicos
      const publicQuery = {
        ...query,
        isActive: "true", // Solo ejercicios activos
      };

      const result = await this.exercisesService.list(publicQuery);
      
      // Mapear a formato compatible con el frontend de rutinas
      const exercisesForRoutine = result.data.map((exercise) => ({
        id: exercise.id,
        grupo: exercise.grupo,
        ejercicio: exercise.ejercicio,
        categoria: exercise.categoria,
        imagenGrupo: exercise.imagen_grupo || "/rutina/filtro2/default-group.png",
        imagenEjercicio: exercise.imagen_ejercicio || exercise.image_url || "/rutina/filtro2/default-exercise.png",
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
    } catch (error) {
      console.error("Error en exercises controller:", error);
      throw new HttpException(
        "Error al obtener ejercicios",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("categories")
  @ApiOperation({ summary: "Obtener categorías/grupos musculares disponibles" })
  @ApiResponse({ status: 200, description: "Categorías obtenidas exitosamente" })
  async getCategories() {
    try {
      // Obtener todos los ejercicios activos
      const result = await this.exercisesService.list({ isActive: "true", limit: "1000" });
      
      // Extraer categorías únicas
      const categories = new Map<string, string>();
      result.data.forEach((exercise) => {
        if (!categories.has(exercise.grupo)) {
          categories.set(exercise.grupo, exercise.imagen_grupo || "/rutina/filtro2/default-group.png");
        }
      });

      return {
        ok: true,
        data: Array.from(categories.entries()).map(([grupo, imagen]) => ({
          grupo,
          imagen,
        })),
      };
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      throw new HttpException(
        "Error al obtener categorías",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener ejercicio por ID" })
  @ApiResponse({ status: 200, description: "Ejercicio obtenido exitosamente" })
  @ApiResponse({ status: 404, description: "Ejercicio no encontrado" })
  async findOne(@Param("id") id: string) {
    try {
      const exercise = await this.exercisesService.findOne(id);
      
      if (!exercise.isActive) {
        throw new HttpException(
          "Ejercicio no disponible",
          HttpStatus.NOT_FOUND,
        );
      }

      // Mapear a formato compatible con el frontend de rutinas
      return {
        ok: true,
        data: {
          id: exercise.id,
          grupo: exercise.grupo,
          ejercicio: exercise.ejercicio,
          categoria: exercise.categoria,
          imagenGrupo: exercise.imagenGrupo || "/rutina/filtro2/default-group.png",
          imagenEjercicio: exercise.imagenEjercicio || exercise.imageUrl || "/rutina/filtro2/default-exercise.png",
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
    } catch (error) {
      console.error("Error obteniendo ejercicio:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Error al obtener ejercicio",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
