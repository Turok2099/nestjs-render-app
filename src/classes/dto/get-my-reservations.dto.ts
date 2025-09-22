import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type ReservationStatus = 'booked' | 'attended' | 'cancelled' | 'no_show';

export class GetMyReservationsDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ['booked','attended','cancelled','no_show'] })
  @IsOptional() @IsIn(['booked','attended','cancelled','no_show'])
  status?: ReservationStatus;
}