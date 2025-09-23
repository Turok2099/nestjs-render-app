import { IsBoolean } from 'class-validator';
export class ToggleExerciseDto { @IsBoolean() isActive!: boolean; }
