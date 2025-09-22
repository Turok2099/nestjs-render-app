import { IsEnum, IsIn, IsOptional, IsUUID, IsString, IsNumberString } from 'class-validator';

// ⚠️ SIN class-transformer. Aceptamos strings y luego parseamos en el service.
export class AdminListSubscriptionsDto {
  @IsOptional()
  @IsEnum(['active','cancelled','expired'] as const)
  status?: 'active'|'cancelled'|'expired';

  @IsOptional() @IsUUID()
  userId?: string;

  @IsOptional() @IsUUID()
  planId?: string;

  // 👉 Swagger envía "1", "20" como strings
  @IsOptional() @IsNumberString()
  page?: string;   // "1"

  @IsOptional() @IsNumberString()
  limit?: string;  // "20"

  @IsOptional()
  @IsIn([
    'createdAt:DESC','createdAt:ASC',
    'startAt:DESC','startAt:ASC',
    'endAt:DESC','endAt:ASC'
  ])
  sort?:
    | 'createdAt:DESC' | 'createdAt:ASC'
    | 'startAt:DESC'   | 'startAt:ASC'
    | 'endAt:DESC'     | 'endAt:ASC' = 'createdAt:DESC';
}

export class AdminPatchSubscriptionStatusDto {
  @IsEnum(['active','cancelled','expired'] as const)
  status!: 'active'|'cancelled'|'expired';

  @IsOptional() @IsString()
  reason?: string;
}
