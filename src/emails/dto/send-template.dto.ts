import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmailAttachmentDto {
  @ApiProperty({ example: 'comprobante.pdf' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'Contenido directo (Buffer/base64/...)' })
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ example: 'logo@cid' })
  @IsOptional()
  @IsString()
  cid?: string;
}

export class SendTemplateDto {
  @ApiProperty({ example: 'destinatario@gmail.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'welcome' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({
    example: { name: 'Jannely', appName: 'TrainUp', ctaUrl: 'https://...' },
    description: 'Variables para interpolar en la plantilla',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ type: [EmailAttachmentDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];
}
