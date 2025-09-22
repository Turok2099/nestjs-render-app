import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminAssignTrainerDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  trainerId!: string;
}
