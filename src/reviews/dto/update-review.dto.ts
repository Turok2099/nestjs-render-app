import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class UpdateReviewStatusDto {
  @ApiProperty({ example: true, description: 'true = activar, false = inactivar (borrado lógico)' })
  @IsBoolean()
  isActive: boolean;
}

export class ModerateReviewDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
