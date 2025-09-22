import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Injectable()
export class EmailsBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailsBootstrap.name);

  constructor(private readonly emails: EmailsService) {}

  async onApplicationBootstrap() {
    const required = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','MAIL_FROM'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
      this.logger.error(`Faltan variables SMTP: ${missing.join(', ')}`);
    }

    try {
      await this.emails.verifyConnection();
      this.logger.log('SMTP verificado correctamente');
    } catch (e) {
      this.logger.error('Error verificando SMTP', e as any);
    }

    this.logger.log('Plantillas de email listas (memoria).');
  }
}
