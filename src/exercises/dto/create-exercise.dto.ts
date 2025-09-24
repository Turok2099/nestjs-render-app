import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from "class-validator";
import { ProgramTag } from "../entities/exercise.entity";
import { Transform, Type } from "class-transformer";

export class CreateExerciseDto {
  @ApiProperty({ description: "Nombre del ejercicio" })
  @IsString()
  ejercicio: string;

  @ApiProperty({ description: "Grupo muscular", required: false })
  @IsOptional()
  @IsString()
  grupo?: string;

  @ApiProperty({ description: "Categoría del ejercicio", required: false })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiProperty({ description: "Series para hipertrofia", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hipertrofia_series?: number;

  @ApiProperty({
    description: "Repeticiones para hipertrofia",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hipertrofia_repeticiones?: number;

  @ApiProperty({ description: "Series para fuerza", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fuerza_series?: number;

  @ApiProperty({ description: "Repeticiones para fuerza", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fuerza_repeticiones?: number;

  @ApiProperty({ description: "Series para resistencia", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  resistencia_series?: number;

  @ApiProperty({
    description: "Repeticiones para resistencia",
    required: false,
  })
  @IsOptional()
  @IsString()
  resistencia_repeticiones?: string;

  @ApiProperty({
    description: "Tiempo para ejercicios de resistencia",
    required: false,
  })
  @IsOptional()
  @IsString()
  tiempo?: string;

  @ApiProperty({ description: "Estado activo/inactivo", required: false })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean;
}
