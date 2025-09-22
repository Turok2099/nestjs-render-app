import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { EmailsBootstrap } from './emails.bootstrap';

@Module({
  controllers: [EmailsController],
  providers: [EmailsService, EmailsBootstrap],
  exports: [EmailsService],
})
export class EmailsModule {}
