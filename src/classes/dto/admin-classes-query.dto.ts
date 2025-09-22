import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional } from 'class-validator';
import { ScheduleQueryDto } from './schedule-query.dto';

export class AdminClassesQueryDto extends ScheduleQueryDto {
  @ApiPropertyOptional({ description: 'Si se envía "true", incluye inactivas' })
  @IsOptional() @IsBooleanString()
  includeInactive?: string; // 'true' | 'false'
}
