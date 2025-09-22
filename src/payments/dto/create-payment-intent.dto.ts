import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Monto del pago',
    example: 20.0,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Moneda del pago',
    example: 'usd',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'ID del plan (opcional)',
    example: 'uuid-del-plan',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiProperty({
    description: 'Descripción del pago',
    example: 'Membresía Premium - TrainUp Gym',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}



