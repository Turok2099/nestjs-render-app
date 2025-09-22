import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @ApiProperty({ enum: ['member', 'trainer', 'admin'] })
  @IsIn(['member', 'trainer', 'admin'])
  role: UserRole;
}
