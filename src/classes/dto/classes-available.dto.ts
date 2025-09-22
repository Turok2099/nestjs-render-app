import { DayOfWeek } from "../entities/class.entity";

export class ClassAvailableDto {
  id: string;
  name: string;
  createdAt: Date;
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek | null;
  coach: string[];
  capacity: number;
}