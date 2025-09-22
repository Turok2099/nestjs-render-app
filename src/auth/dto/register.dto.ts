import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace', maxLength: 80 })
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'ada@mail.com', maxLength: 120 })
  @IsEmail()
  @MaxLength(120)
  email: string;

  @ApiProperty({ example: 'P@ssw0rd1!', minLength: 8, maxLength: 64 })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @ApiProperty({ required: false, example: 'Av. Siempre Viva 742' })
  @IsOptional()
  @MaxLength(120)
  address?: string;

  @ApiProperty({ required: false, example: '+52 55 1234 5678' })
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
