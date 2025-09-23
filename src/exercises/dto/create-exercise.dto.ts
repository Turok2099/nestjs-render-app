import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ProgramTag } from '../entities/exercise.entity';
import { Transform, Type } from 'class-transformer';

export class CreateExerciseDto {
  @ApiProperty({ description: 'Nombre del ejercicio' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grupo muscular' })
  @IsString()
  muscleGroup: string;

  @ApiProperty({ description: 'Número de series', required: false })
  @IsOptional()
  @Type(() => Number) //! SOLO TESTING
  @IsNumber()
  series?: number;

  @ApiProperty({ description: 'Número de repeticiones', required: false })
  @IsOptional()
  @Type(() => Number) //! SOLO TESTING
  @IsNumber()
  repetitions?: number;

  @ApiProperty({ description: 'Tipo de ejercicio', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Tag del programa', enum: ['max', 'hyper'], required: false })
  @IsOptional()
  @IsEnum(['max', 'hyper'])
  programTag?: ProgramTag;

  @ApiProperty({ description: 'Estado activo/inactivo', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true') //! SOLO TESTING
  @IsBoolean()
  isActive?: boolean;
}