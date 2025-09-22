import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, MaxLength, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt() @Min(1) @Max(5)
  rating: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional() @MaxLength(500)
  comment?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional() @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional() @IsUUID()
  trainerId?: string;
}
