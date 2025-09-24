import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ClassHistory } from "./class-history.entity";

export type GoalTag =
  | "weight_loss"
  | "definition"
  | "muscle_gain"
  | "mobility"
  | "cardio";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

@Entity({ name: "classes" })
@Index(["date", "startTime"])
export class Class {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: "trainer_id" })
  trainer: User | null;

  @Column({ name: "trainer_id", nullable: true })
  trainerId: string | null;

  @Column({ length: 100 })
  title: string;

  @Column({ type: "date" })
  date: string; // yyyy-mm-dd

  @Column({ name: "start_time", type: "time" })
  startTime: string; // HH:mm

  @Column({ name: "end_time", type: "time" })
  endTime: string;

  @Column({
    name: "day_of_week",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  dayOfWeek: DayOfWeek | null;

  @Column({ type: "int", default: 20 })
  capacity: number;

  @Column({ name: "goal_tag", type: "varchar", length: 20, nullable: true })
  goalTag: GoalTag | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "simple-json", nullable: true }) // Añadido: Columna para el array de coaches
  coach: string[] | null;

  @Column({ name: "image_url", type: "varchar", nullable: true, length: 500 })
  imageUrl: string | null;

  @Column({ name: "location", type: "varchar", nullable: true, length: 200 })
  location: string | null;

  @Column({ name: "description", type: "varchar", nullable: true, length: 500 })
  description: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => ClassHistory, (classHistory) => classHistory.class)
  classHistories: ClassHistory[];

  calculateDayOfWeek(): DayOfWeek | null {
    if (!this.date) return null;

    const dateObj = new Date(this.date);
    const days: DayOfWeek[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[dateObj.getDay()];
  }

  setDateWithDayOfWeek(date: string): void {
    this.date = date;
    this.dayOfWeek = this.calculateDayOfWeek();
  }
}
