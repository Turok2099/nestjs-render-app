import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import { SendTemplateDto } from './dto/send-template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';


@ApiTags('emails')
@Controller('emails')
export class EmailsController {
  constructor(private readonly emails: EmailsService) {}

  @Get('ping') //ocultar en producción
  @ApiOperation({ summary: 'Verificar conexión SMTP' })
  async ping() {
    await this.emails.verifyConnection();
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send/template')
  @ApiOperation({ summary: 'Enviar por plantilla (key + data)' })
  @ApiConsumes('application/json')
  @ApiBody({ type: SendTemplateDto, required: true }) 
  async sendByTemplate(@Body() dto: SendTemplateDto) {
    return this.emails.sendByTemplate(dto.to, dto.key, dto.data ?? {}, dto.attachments);
  }



  @Get('templates/:key/preview')
  @ApiOperation({ summary: 'Preview HTML renderizado de una plantilla (no envía)' })
  async preview(@Param('key') key: string, @Query('json') json?: string) {
    let data = {};
    if (json) {
      try {
        data = JSON.parse(json);
      } catch {
        throw new BadRequestException('El parámetro "json" no es un JSON válido');
      }
    }
    const { subject, html } = await this.emails.renderTemplate(key, data);
    return { subject, html };
  }

}
