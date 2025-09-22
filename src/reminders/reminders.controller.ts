import { Controller, Post } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Post('run-benefits')
  @ApiOperation({ summary: 'Ejecuta una vez el nudge de beneficios' })
  runBenefits() {
    return this.reminders.runBenefitsOnce();
  }
}
