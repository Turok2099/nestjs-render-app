import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'tokenDeUnSoloUso' })
  @IsNotEmpty() token: string;

  @ApiProperty({ example: 'N3wP@ss!', minLength: 8, maxLength: 64 })
  @IsNotEmpty() @MinLength(8) @MaxLength(64) newPassword: string;
}
