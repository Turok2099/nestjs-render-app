import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateClassDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'yyyy-mm-dd' })
  @IsOptional() @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'HH:mm' })
  @IsOptional() @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'HH:mm' })
  @IsOptional() @IsString()
  endTime?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: ['weight_loss','definition','muscle_gain','mobility','cardio'] })
  @IsOptional() @IsIn(['weight_loss','definition','muscle_gain','mobility','cardio'])
  goalTag?: 'weight_loss'|'definition'|'muscle_gain'|'mobility'|'cardio';
}
