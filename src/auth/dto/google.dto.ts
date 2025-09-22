import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GoogleTokenDto {
  @ApiProperty({ description: 'Google ID Token', example: 'eyJhbGciOiJSUzI1NiIs…' })
  @IsNotEmpty() idToken: string;
}
