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
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const classes_service_1 = require("./classes.service");
const schedule_query_dto_1 = require("./dto/schedule-query.dto");
const admin_classes_query_dto_1 = require("./dto/admin-classes-query.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const update_class_status_dto_1 = require("./dto/update-class-status.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const create_class_dto_1 = require("./dto/create-class.dto");
const admin_assign_trainer_dto_1 = require("./dto/admin-assign-trainer.dto");
let ClassesController = class ClassesController {
    constructor(classesService) {
        this.classesService = classesService;
    }
    async findAll() {
        return this.classesService.findAll();
    }
    async schedule(q) {
        return this.classesService.schedule(q);
    }
    async myAgenda(user, q) {
        return this.classesService.schedule({ ...q, trainerId: user.userId });
    }
    async adminList(q) {
        return this.classesService.adminList(q);
    }
    async findByDay(day) {
        return this.classesService.findByDay(day);
    }
    async classReservations(user, id) {
        return this.classesService.classReservationsFor(user, id);
    }
    async create(createClassDto, imageFile) {
        return this.classesService.create(createClassDto, imageFile);
    }
    async adminUpdate(id, dto) {
        return this.classesService.adminUpdate(id, dto);
    }
    async adminSetStatus(id, dto, req) {
        console.log("🔍 === DEBUG TOGGLE CLASS ===");
        console.log("📥 Request ID:", id);
        console.log("📥 Request Body:", dto);
        console.log("👤 User from JWT:", req.user);
        console.log("🎭 User Role:", req.user?.role);
        console.log("✅ Is Admin:", req.user?.role === "admin");
        const result = await this.classesService.adminSetStatus(id, dto.isActive);
        console.log("📤 Service Result:", result);
        return result;
    }
    async findById(id) {
        return this.classesService.findById(id);
    }
    async adminAssignTrainer(id, dto) {
        const updated = await this.classesService.adminAssignTrainer(id, dto.trainerId);
        return { ok: true, data: updated };
    }
    async assignMeAsTrainer(user, id) {
        const updated = await this.classesService.assignTrainerToClass(id, user.userId);
        return { ok: true, data: updated };
    }
    async unassignMeAsTrainer(user, id) {
        const updated = await this.classesService.unassignTrainerFromClass(id, user.userId);
        return { ok: true, data: updated };
    }
    async adminToggle(id, dto) {
        const res = await this.classesService.adminSetStatus(id, dto.isActive);
        return { ok: true, data: res };
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Obtener todas las clases disponibles" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("schedule"),
    (0, swagger_1.ApiOperation)({ summary: "Listado de clases con filtros y ocupación" }),
    (0, swagger_1.ApiQuery)({ name: "goal", required: false }),
    (0, swagger_1.ApiQuery)({ name: "date", required: false, description: "yyyy-mm-dd" }),
    (0, swagger_1.ApiQuery)({
        name: "timeOfDay",
        required: false,
        enum: ["morning", "afternoon", "evening"],
    }),
    (0, swagger_1.ApiQuery)({
        name: "trainerId",
        required: false,
        description: "UUID entrenador",
    }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, example: 10 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_query_dto_1.ScheduleQueryDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "schedule", null);
__decorate([
    (0, common_1.Get)("mine"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("trainer"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Agenda del entrenador autenticado" }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, schedule_query_dto_1.ScheduleQueryDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "myAgenda", null);
__decorate([
    (0, common_1.Get)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Listado de clases para Admin (puede incluir inactivas)",
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_classes_query_dto_1.AdminClassesQueryDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "adminList", null);
__decorate([
    (0, common_1.Get)("by-day/:day"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener clases por día de la semana" }),
    __param(0, (0, common_1.Param)("day")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findByDay", null);
__decorate([
    (0, common_1.Get)(":id/reservations"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("trainer", "admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({
        summary: "Listado de asistentes de una clase (trainer dueño o admin)",
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "classReservations", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Crear nueva clase (admin)" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({ summary: "Editar datos de una clase (admin)" }),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "adminUpdate", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({ summary: "Activar/Desactivar clase (borrado lógico)" }),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_status_dto_1.UpdateClassStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "adminSetStatus", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener una clase por ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la clase", format: "uuid" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Clase encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Clase no encontrada" }),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)("admin/:id/assign-trainer"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({ summary: "Asignar tutor a una clase (admin)" }),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_assign_trainer_dto_1.AdminAssignTrainerDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "adminAssignTrainer", null);
__decorate([
    (0, common_1.Patch)(":id/assign-me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("trainer"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({ summary: "Asignarse como entrenador de una clase (trainer)" }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "assignMeAsTrainer", null);
__decorate([
    (0, common_1.Patch)(":id/unassign-me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("trainer"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({
        summary: "Desasignarse como entrenador de una clase (trainer)",
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "unassignMeAsTrainer", null);
__decorate([
    (0, common_1.Patch)("admin/:id/toggle"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: "id", format: "uuid" }),
    (0, swagger_1.ApiOperation)({ summary: "Activar/Desactivar clase (alias admin)" }),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_status_dto_1.UpdateClassStatusDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "adminToggle", null);
exports.ClassesController = ClassesController = __decorate([
    (0, swagger_1.ApiTags)("classes"),
    (0, common_1.Controller)("classes"),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
