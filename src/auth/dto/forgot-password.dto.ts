import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ada@mail.com' })
  @IsEmail() @MaxLength(120) email: string;
}
