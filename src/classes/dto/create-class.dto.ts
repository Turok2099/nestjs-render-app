import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { GoalTag } from '../entities/class.entity';

export class CreateClassDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  trainerId: string;

  @ApiProperty({ maxLength: 100 })
  @IsString() @MaxLength(100)
  title: string;

  @ApiProperty({ example: '2025-09-10', description: 'YYYY-MM-DD' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00', description: 'HH:mm (24h)' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'HH:mm (24h)' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;

  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: ['weight_loss','definition','muscle_gain','mobility','cardio'] })
  @IsOptional() @IsIn(['weight_loss','definition','muscle_gain','mobility','cardio'])
  goalTag?: GoalTag;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  coach?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional() @Transform(({ value }) => value === "true") @IsBoolean()
  isActive?: boolean;
}
