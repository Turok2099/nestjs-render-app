import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const toUndefIfEmpty = ({ value }: { value: any }) =>
  value === '' || value === null || value === undefined ? undefined : value;

const toNumberOrUndef = ({ value }: { value: any }) =>
  value === '' || value === null || value === undefined ? undefined : Number(value);

export class ScheduleQueryDto {
  @ApiPropertyOptional({
    enum: [
      'weight_loss','definition','muscle_gain','mobility','cardio',
      'Fuerza máxima','Hipertrofia','Resistencia muscular','perder peso','definicion','masa muscular'
    ]
  })
  @Transform(toUndefIfEmpty)
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional({ description: 'yyyy-mm-dd' })
  @Transform(toUndefIfEmpty)
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'morning|afternoon|evening' })
  @Transform(toUndefIfEmpty)
  @IsOptional()
  @IsIn(['morning','afternoon','evening'])
  timeOfDay?: 'morning'|'afternoon'|'evening';

  @ApiPropertyOptional({ description: 'UUID entrenador' })
  @Transform(toUndefIfEmpty)
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(toNumberOrUndef)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Transform(toNumberOrUndef)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
