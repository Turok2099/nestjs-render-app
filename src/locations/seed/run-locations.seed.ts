import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { LocationsSeedService } from './locations.seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const seeder = app.get(LocationsSeedService);
    await seeder.run();
  } finally {
    await app.close();
  }
}
bootstrap();
