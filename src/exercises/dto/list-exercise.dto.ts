import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ListExercisesDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() muscleGroup?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() programTag?: 'max'|'hyper';
  @IsOptional() @IsString() isActive?: 'true'|'false';

  @IsOptional() @IsNumberString()
  page?: string;

  @IsOptional() @IsNumberString()
  limit?: string;
}
