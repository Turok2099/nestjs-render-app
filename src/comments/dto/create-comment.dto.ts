import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}