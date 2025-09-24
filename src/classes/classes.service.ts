import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsWhere, In, Repository } from "typeorm";
import { Class } from "./entities/class.entity";
import { Reservation } from "./entities/reservation.entity";
import { ScheduleQueryDto } from "./dto/schedule-query.dto";
import { AdminClassesQueryDto } from "./dto/admin-classes-query.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { CreateClassDto } from "./dto/create-class.dto";
import { User } from "../user/entities/user.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

const GOAL_ALIASES: Record<
  string,
  "weight_loss" | "definition" | "muscle_gain" | "mobility" | "cardio"
> = {
  "perder peso": "weight_loss",
  "bajar de peso": "weight_loss",
  definicion: "definition",
  definición: "definition",
  "masa muscular": "muscle_gain",
  fuerza: "muscle_gain",
  "fuerza maxima": "muscle_gain",
  "fuerza máxima": "muscle_gain",
  hipertrofia: "muscle_gain",
  "resistencia muscular": "cardio",
  cardio: "cardio",
  movilidad: "mobility",
};

function normalize(s?: string) {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
function toGoalTag(
  input?: string,
):
  | "weight_loss"
  | "definition"
  | "muscle_gain"
  | "mobility"
  | "cardio"
  | undefined {
  if (!input) return undefined;
  const n = normalize(input);
  if (
    ["weight_loss", "definition", "muscle_gain", "mobility", "cardio"].includes(
      n,
    )
  )
    return n as any;
  return GOAL_ALIASES[n];
}
// --- FIX: asegurar formato HH:mm:ss para columnas TIME ---
function toPgTime(s?: string) {
  if (!s) return undefined;
  return s.length === 5 ? `${s}:00` : s; // '09:00' -> '09:00:00'
}

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private readonly classesRepo: Repository<Class>,
    @InjectRepository(Reservation)
    private readonly resRepo: Repository<Reservation>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ---------- Crear clase (admin) ----------
  async create(
    dto: CreateClassDto,
    imageFile?: Express.Multer.File,
  ): Promise<Class> {
    console.log("🏫 [ClassesService] Iniciando creación de clase...");
    console.log(
      "📋 [ClassesService] DTO recibido:",
      JSON.stringify(dto, null, 2),
    );
    console.log(
      "🖼️ [ClassesService] Archivo de imagen:",
      imageFile
        ? `Presente (${imageFile.originalname}, ${imageFile.size} bytes)`
        : "Ausente",
    );

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException("startTime must be before endTime");
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        console.log("☁️ [ClassesService] Subiendo imagen a Cloudinary...");
        imageUrl = await this.cloudinaryService.uploadImage(imageFile);
        console.log(
          "✅ [ClassesService] Imagen subida exitosamente:",
          imageUrl,
        );
      } catch (error) {
        console.error(
          "❌ [ClassesService] Error subiendo imagen a Cloudinary:",
          error,
        );
        throw new Error(`Error subiendo imagen: ${error.message}`);
      }
    }

    try {
      console.log("💾 [ClassesService] Creando entidad de clase...");
      const entity = this.classesRepo.create({
        title: dto.title,
        trainerId: dto.trainerId ?? null,
        date: dto.date,
        startTime: toPgTime(dto.startTime)!, // normaliza
        endTime: toPgTime(dto.endTime)!, // normaliza
        capacity: dto.capacity ?? 20,
        goalTag: dto.goalTag ?? null,
        coach: dto.coach ?? null,
        isActive: dto.isActive ?? true,
        imageUrl, // Agregar URL de la imagen
        location: dto.location ?? null,
        description: dto.description ?? null,
      });

      entity.setDateWithDayOfWeek(dto.date);

      console.log("💾 [ClassesService] Guardando clase en base de datos...");
      const savedClass = await this.classesRepo.save(entity);
      console.log(
        "✅ [ClassesService] Clase guardada exitosamente:",
        savedClass.id,
      );

      return savedClass;
    } catch (error) {
      console.error("❌ [ClassesService] Error guardando clase:", error);
      throw error;
    }
  }

  // ---------- Listado simple (si lo usas en algún sitio) ----------
  async findAll() {
    const classes = await this.classesRepo.find({
      relations: ["trainer"], // Incluir la relación con el trainer
    });
    return classes.map((c) => ({
      id: c.id,
      // name lo dejamos para compat con front antiguo (igual a title)
      name: c.title,
      title: c.title,
      date: c.date,
      startTime: c.startTime,
      endTime: c.endTime,
      dayOfWeek: c.dayOfWeek,
      coach: c.coach ?? [],
      trainerName: c.trainer?.name || null, // Agregar trainerName desde la relación
      trainerId: c.trainerId, // Agregar trainerId también
      capacity: c.capacity,
      createdAt: c.createdAt,
    }));
  }

  async findByDay(dayOfWeek: string): Promise<Class[]> {
    return this.classesRepo.find({
      where: { dayOfWeek: dayOfWeek as any, isActive: true },
      order: { startTime: "ASC" },
    });
  }

  async findById(id: string): Promise<Class> {
    const classEntity = await this.classesRepo.findOne({ where: { id } });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  // ---------- Agenda pública (con filtros) ----------
  async schedule(q: ScheduleQueryDto) {
    const page = Number(q.page || 1);
    const take = Math.min(Number(q.limit || 10), 50);
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Class> = { isActive: true };

    const tag = toGoalTag(q.goal);
    if (tag) (where as any).goalTag = tag;
    if (q.trainerId) (where as any).trainerId = q.trainerId; // ojo: aquí va el UUID del usuario entrenador
    if (q.date) (where as any).date = q.date;

    // --- rangos por timeOfDay (normalizados a HH:mm:ss) ---
    let startRange: string | undefined;
    let endRange: string | undefined;
    if (q.timeOfDay === "morning") {
      startRange = toPgTime("05:00");
      endRange = toPgTime("12:00");
    }
    if (q.timeOfDay === "afternoon") {
      startRange = toPgTime("12:00");
      endRange = toPgTime("18:00");
    }
    if (q.timeOfDay === "evening") {
      startRange = toPgTime("18:00");
      endRange = toPgTime("23:00");
    }

    const timeFilter =
      startRange && endRange
        ? { startTime: Between(startRange, endRange) }
        : {};

    const [items, total] = await this.classesRepo.findAndCount({
      where: { ...where, ...timeFilter },
      order: { date: "ASC", startTime: "ASC" },
      skip,
      take,
    });

    // Ocupación por clase
    const ids = items.map((c) => c.id);
    const counts = ids.length
      ? await this.resRepo
          .createQueryBuilder("r")
          .select("r.class_id", "classId")
          .addSelect(
            "SUM(CASE WHEN r.status = 'booked' THEN 1 ELSE 0 END)",
            "booked",
          )
          .where("r.class_id IN (:...ids)", { ids })
          .groupBy("r.class_id")
          .getRawMany<{ classId: string; booked: string }>()
      : [];

    const byId = new Map(counts.map((c) => [c.classId, Number(c.booked)]));
    const mapped = items.map((c) => {
      const occupied = byId.get(c.id) || 0;
      return {
        id: c.id,
        title: c.title,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        capacity: c.capacity,
        occupied,
        available: Math.max(c.capacity - occupied, 0),
        goalTag: c.goalTag,
        trainerId: c.trainerId,
      };
    });

    return { page, limit: take, total, items: mapped };
  }

  async getActiveClassOrThrow(classId: string) {
    const cls = await this.classesRepo.findOne({
      where: { id: classId, isActive: true },
    });
    if (!cls) throw new BadRequestException("Class not found or inactive");
    return cls;
  }

  // ---------- Admin ----------
  async adminList(q: AdminClassesQueryDto) {
    // Si includeInactive=true, obtener TODAS las clases (activas + inactivas)
    if (q.includeInactive === "true") {
      const where: FindOptionsWhere<Class> = {};
      const tag = toGoalTag(q.goal);
      if (tag) (where as any).goalTag = tag;
      if (q.trainerId) (where as any).trainerId = q.trainerId;
      if (q.date) (where as any).date = q.date;

      const [allClasses, count] = await this.classesRepo.findAndCount({
        where: where, // Sin filtro de isActive - obtener todas
        order: { date: "ASC", startTime: "ASC" },
      });

      const ids = allClasses.map((c) => c.id);
      if (ids.length) {
        const counts = await this.resRepo
          .createQueryBuilder("r")
          .select("r.class_id", "classId")
          .addSelect(
            "SUM(CASE WHEN r.status = 'booked' THEN 1 ELSE 0 END)",
            "booked",
          )
          .where("r.class_id IN (:...ids)", { ids })
          .groupBy("r.class_id")
          .getRawMany<{ classId: string; booked: string }>();
        const byId = new Map(counts.map((c) => [c.classId, Number(c.booked)]));

        // Devolver todas las clases (activas + inactivas) con sus reservas
        return {
          items: allClasses.map((c) => ({
            id: c.id,
            title: c.title,
            date: c.date,
            startTime: c.startTime,
            endTime: c.endTime,
            capacity: c.capacity,
            occupied: byId.get(c.id) || 0,
            available: Math.max(c.capacity - (byId.get(c.id) || 0), 0),
            goalTag: c.goalTag,
            trainerId: c.trainerId,
            isActive: c.isActive,
          })),
          total: count,
        };
      } else {
        // Si no hay clases, devolver array vacío
        return { items: [], total: 0 };
      }
    }

    // Si includeInactive=false, usar el comportamiento original
    return this.schedule({ ...q, goal: q.goal });
  }

  async adminUpdate(id: string, dto: UpdateClassDto) {
    const cls = await this.classesRepo.findOne({ where: { id } });
    if (!cls) throw new BadRequestException("Class not found");

    Object.assign(cls, dto);
    if (cls.startTime && cls.endTime && cls.startTime >= cls.endTime) {
      throw new BadRequestException("startTime must be before endTime");
    }
    if (dto.startTime) cls.startTime = toPgTime(dto.startTime)!;
    if (dto.endTime) cls.endTime = toPgTime(dto.endTime)!;
    if (dto.date) cls.setDateWithDayOfWeek(dto.date);

    return this.classesRepo.save(cls);
  }

  async adminSetStatus(id: string, isActive: boolean) {
    const ok = await this.classesRepo.update({ id }, { isActive });
    if (!ok.affected) throw new BadRequestException("Class not found");
    return { id, isActive };
  }

  async classReservationsFor(
    user: { userId: string; role: string },
    classId: string,
  ) {
    const cls = await this.classesRepo.findOne({ where: { id: classId } });
    if (!cls) throw new BadRequestException("Class not found");

    if (user.role !== "admin" && cls.trainerId !== user.userId) {
      throw new ForbiddenException("Not allowed");
    }

    const res = await this.resRepo.find({
      where: { classId, status: In(["booked", "attended", "no_show"]) },
    });
    if (!res.length) return [];

    return res.map((r) => ({
      reservationId: r.id,
      userId: r.userId,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }
  async adminToggle(id: string, isActive: boolean) {
    // reuse tu lógica actual
    return this.adminSetStatus(id, isActive);
  }

  async adminAssignTrainer(id: string, trainerId: string) {
    // Si solo guardas el UUID, no necesitas buscar User:
    const ok = await this.classesRepo.update({ id }, { trainerId });
    if (!ok.affected) throw new BadRequestException("Class not found");
    // devuelve el registro actualizado si quieres
    const updated = await this.classesRepo.findOne({ where: { id } });
    return updated!;
  }

  // +++ NUEVO: asignar entrenador a una clase (para trainers) +++
  async assignTrainerToClass(classId: string, trainerId: string) {
    // Verificar que la clase existe
    const classEntity = await this.classesRepo.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException("Class not found");
    }

    // Verificar que la clase está activa
    if (!classEntity.isActive) {
      throw new BadRequestException("Cannot assign trainer to inactive class");
    }

    // Verificar que el usuario es realmente un trainer
    const trainer = await this.usersRepo.findOne({
      where: { id: trainerId, role: "trainer" },
    });
    if (!trainer) {
      throw new ForbiddenException("User is not a trainer");
    }

    // Actualizar la clase con el nuevo entrenador
    const updateResult = await this.classesRepo.update(
      { id: classId },
      { trainerId },
    );
    if (!updateResult.affected) {
      throw new BadRequestException("Failed to assign trainer to class");
    }

    // Devolver la clase actualizada
    const updatedClass = await this.classesRepo.findOne({
      where: { id: classId },
      relations: ["trainer"],
    });

    return updatedClass!;
  }

  // +++ NUEVO: desasignar entrenador de una clase (para trainers) +++
  async unassignTrainerFromClass(classId: string, trainerId: string) {
    // Verificar que la clase existe
    const classEntity = await this.classesRepo.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException("Class not found");
    }

    // Verificar que la clase está activa
    if (!classEntity.isActive) {
      throw new BadRequestException(
        "Cannot unassign trainer from inactive class",
      );
    }

    // Verificar que el entrenador actual es el que está asignado
    if (classEntity.trainerId !== trainerId) {
      throw new ForbiddenException(
        "You can only unassign yourself from classes you are assigned to",
      );
    }

    // Verificar que el usuario es realmente un trainer
    const trainer = await this.usersRepo.findOne({
      where: { id: trainerId, role: "trainer" },
    });
    if (!trainer) {
      throw new ForbiddenException("User is not a trainer");
    }

    // Desasignar el entrenador (usar UUID vacío temporalmente hasta que la migración se aplique)
    const updateResult = await this.classesRepo.update(
      { id: classId },
      { trainerId: "00000000-0000-0000-0000-000000000000" },
    );
    if (!updateResult.affected) {
      throw new BadRequestException("Failed to unassign trainer from class");
    }

    // Devolver la clase actualizada
    const updatedClass = await this.classesRepo.findOne({
      where: { id: classId },
      relations: ["trainer"],
    });

    return updatedClass!;
  }
}
