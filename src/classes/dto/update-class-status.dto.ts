import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateClassStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}
