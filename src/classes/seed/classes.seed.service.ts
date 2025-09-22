import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Class } from '../entities/class.entity';
import { User } from '../../user/entities/user.entity';

type GoalTag = 'weight_loss' | 'definition' | 'muscle_gain' | 'mobility' | 'cardio';

const GOAL_ALIASES: Record<string, GoalTag> = {
  'perder peso': 'weight_loss',
  'bajar de peso': 'weight_loss',
  'definicion': 'definition',
  'definición': 'definition',
  'masa muscular': 'muscle_gain',
  'fuerza': 'muscle_gain',
  'fuerza maxima': 'muscle_gain',
  'fuerza máxima': 'muscle_gain',
  'hipertrofia': 'muscle_gain',
  'resistencia muscular': 'cardio',
  'cardio': 'cardio',
  'movilidad': 'mobility',
};

function normalize(s?: string) {
  if (!s) return '';
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function toGoalTag(input?: string): GoalTag | undefined {
  if (!input) return undefined;
  const n = normalize(input);
  if (['weight_loss','definition','muscle_gain','mobility','cardio'].includes(n)) {
    return n as GoalTag;
  }
  return GOAL_ALIASES[n];
}

@Injectable()
export class ClassesSeedService {
  private readonly log = new Logger(ClassesSeedService.name);

  constructor(
    @InjectRepository(Class) private readonly classesRepo: Repository<Class>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async run() {
    const countActive = await this.classesRepo.count({ where: { isActive: true } });
    if (countActive >= 10) {
      this.log.log('Skip seed: ya existen 10 clases activas');
      return;
    }

    const trainers = await this.usersRepo.find({
      where: { role: In(['trainer', 'admin']) as any },
      take: 20,
    });
    if (!trainers.length) {
      this.log.warn('No hay usuarios con rol trainer/admin; no se crearán clases.');
      return;
    }

    const sample = [
      { title: 'Cardio', date: this.offsetDate( -2), startTime: '08:00:00', endTime: '09:00:00', coach: ['Ana'],   goal: 'cardio' },
      { title: 'Spinning', date: this.offsetDate( -1), startTime: '09:30:00', endTime: '10:30:00', coach: ['Luis'], goal: 'cardio' },
      { title: 'Zumba', date: this.offsetDate(  0), startTime: '07:00:00', endTime: '08:00:00', coach: ['Mia'],    goal: 'movilidad' },
      { title: 'Powerlifting', date: this.offsetDate( 1), startTime: '10:00:00', endTime: '11:30:00', coach: ['Joe'], goal: 'fuerza' },
      { title: 'Pilates', date: this.offsetDate( 2), startTime: '18:00:00', endTime: '19:00:00', coach: ['Katy'],  goal: 'movilidad' },
      { title: 'Funcional', date: this.offsetDate(-3), startTime: '17:00:00', endTime: '18:00:00', coach: ['Leo'], goal: 'masa muscular' },
      { title: 'FullBody', date: this.offsetDate( -2), startTime: '12:00:00', endTime: '13:00:00', coach: ['Ana'], goal: 'muscle_gain' },
      { title: 'Stretching', date: this.offsetDate(-1), startTime: '20:00:00', endTime: '21:00:00', coach: ['Mia'], goal: 'movilidad' },
      { title: 'HIIT', date: this.offsetDate(  3), startTime: '06:30:00', endTime: '07:15:00', coach: ['Luis'],   goal: 'cardio' },
      { title: 'Boxeo', date: this.offsetDate(  4), startTime: '19:00:00', endTime: '20:30:00', coach: ['Joe'],   goal: 'cardio' },
    ];

    let created = 0;
    for (let i = 0; i < sample.length; i++) {
      const item = sample[i];

      const title = (item as any).title ?? (item as any).name ?? (item as any).nombre;
      const date = (item as any).date ?? (item as any).fecha;
      const startTime = (item as any).startTime ?? (item as any).horaInicio;
      const endTime = (item as any).endTime ?? (item as any).horaFin;
      const coach = Array.isArray((item as any).coach)
        ? (item as any).coach
        : (typeof (item as any).coach === 'string' ? [(item as any).coach] : []);

      const goalTag = toGoalTag((item as any).goal ?? (item as any).objetivo) ?? null;

      const trainer = trainers[i % trainers.length];

      const exists = await this.classesRepo.findOne({
        where: { title, trainerId: trainer.id, date, startTime },
      });
      if (exists) continue;

      const entity = this.classesRepo.create({
        title,
        trainerId: trainer.id,
        date,
        startTime,
        endTime,
        capacity: 20,
        goalTag,
        coach,
        isActive: true,
      });

      entity.setDateWithDayOfWeek(date);

      await this.classesRepo.save(entity);
      created++;
    }

    this.log.log(`Seed clases: creadas=${created}, totalActual=${await this.classesRepo.count()}`);
  }

  private offsetDate(daysFromToday: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
}
