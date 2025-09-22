import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const toUndef = ({ value }: any) => value === '' || value === null ? undefined : value;
const toNum = ({ value }: any) => (value === '' || value === null || value === undefined) ? undefined : Number(value);

export class ReviewsQueryDto {
  @ApiPropertyOptional({ enum: ['recent', 'top'], default: 'recent' })
  @Transform(toUndef) @IsOptional() @IsIn(['recent', 'top'])
  order?: 'recent' | 'top';

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @Transform(toNum) @IsOptional() @IsInt() @Min(1)
  rating?: number;

  @ApiPropertyOptional({ default: 1 })
  @Transform(toNum) @IsOptional() @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Transform(toNum) @IsOptional() @IsInt() @Min(1)
  limit?: number;
}
