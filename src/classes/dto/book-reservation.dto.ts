import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BookReservationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  classId: string;
}
