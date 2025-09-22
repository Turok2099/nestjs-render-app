import { IsBoolean, IsUUID } from 'class-validator';

export class AdminToggleClassDto {
  @IsBoolean()
  isActive!: boolean;
}

export class AdminAssignTrainerDto {
  @IsUUID()
  trainerId!: string;
}
