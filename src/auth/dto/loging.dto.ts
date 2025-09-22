import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ada@mail.com' })
  @IsEmail() @MaxLength(120) email: string;

  @ApiProperty({ example: 'P@ssw0rd1!' })
  @IsNotEmpty() @MaxLength(64) password: string;
}
