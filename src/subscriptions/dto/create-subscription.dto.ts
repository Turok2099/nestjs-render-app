import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * DTO para que el USUARIO cree su suscripción a partir de un plan.
 * Solo necesita el planId; el userId sale del token.
 */
export class CreateSubscriptionDto {
  @ApiProperty({ format: 'uuid', description: 'ID del plan a comprar' })
  @IsUUID()
  planId: string;
}

/**
 * DTO para que el ADMIN cree/extend suscripciones arbitrarias (webhooks, soporte).
 * userId obligatorio; durationDays opcional; planId opcional.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AdminCreateSubscriptionDto {
  @ApiProperty({ format: 'uuid', description: 'Usuario destino' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Plan asociado (opcional)' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ description: 'Duración en días (si no se envía y hay plan, se usa la del plan; si no, 30)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;
}
