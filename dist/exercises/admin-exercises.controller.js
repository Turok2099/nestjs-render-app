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
exports.AdminExercisesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const exercises_service_1 = require("./exercises.service");
const list_exercise_dto_1 = require("./dto/list-exercise.dto");
const toggle_exercise_dto_1 = require("./dto/toggle-exercise.dto");
const create_exercise_dto_1 = require("./dto/create-exercise.dto");
const update_exercise_dto_1 = require("./dto/update-exercise.dto");
const multer_1 = require("multer");
let AdminExercisesController = class AdminExercisesController {
    constructor(svc) {
        this.svc = svc;
    }
    async create(createExerciseDto, imageFile) {
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
    list(q) { return this.svc.list(q); }
    async findOne(id) {
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
    async update(id, updateExerciseDto, imageFile) {
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
    toggle(id, dto) {
        return this.svc.toggle(id, dto.isActive);
    }
    async remove(id) {
        await this.svc.remove(id);
        return { ok: true, message: 'Ejercicio eliminado correctamente' };
    }
};
exports.AdminExercisesController = AdminExercisesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo ejercicio' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(image\/jpg|image\/jpeg|image\/png|image\/webp)$/ })
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exercise_dto_1.CreateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], AdminExercisesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar ejercicios (admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'muscleGroup', required: false, type: String, example: 'Pecho' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String, example: 'Máquina' }),
    (0, swagger_1.ApiQuery)({ name: 'programTag', required: false, enum: ['max', 'hyper'] }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: String, example: 'true' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiOkResponse)({ description: 'Listado mapeado con las claves del mock' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_exercise_dto_1.ListExercisesDto]),
    __metadata("design:returntype", void 0)
], AdminExercisesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener ejercicio por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminExercisesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar ejercicio' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(image\/jpg|image\/jpeg|image\/png|image\/webp)$/ })
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_exercise_dto_1.UpdateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], AdminExercisesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Activar/Desactivar ejercicio' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Estado actualizado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, toggle_exercise_dto_1.ToggleExerciseDto]),
    __metadata("design:returntype", void 0)
], AdminExercisesController.prototype, "toggle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar ejercicio' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminExercisesController.prototype, "remove", null);
exports.AdminExercisesController = AdminExercisesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Exercises'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/exercises'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [exercises_service_1.ExercisesService])
], AdminExercisesController);
