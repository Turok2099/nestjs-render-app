// src/seed.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassesSeedService } from './classes/seed/classes.seed.service';
import { ReviewsSeedService } from './reviews/seed/reviews.seed.service';

async function callAnySeed(instance: any, label: string) {
  if (!instance) {
    console.log(`${label}: servicio no encontrado (no-op)`);
    return;
  }
  if (typeof instance.run === 'function') return instance.run();
  if (typeof instance.seed === 'function') return instance.seed();
  if (typeof instance.execute === 'function') return instance.execute();
  if (typeof instance.populate === 'function') return instance.populate();
  console.log(`${label}: no tiene métodos run/seed/execute/populate (no-op)`);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    if (process.env.SEED_CLASSES_FRONT === '1') {
      const classesSeed = app.get(ClassesSeedService, { strict: false });
      console.log('▶ Seeding clases (front mock)…');
      await callAnySeed(classesSeed, 'ClassesSeedService');
      console.log('✔ Done clases');
    } else {
      console.log('Seed de clases deshabilitado (SEED_CLASSES_FRONT != 1)');
    }

    if (process.env.SEED_REVIEWS === '1') {
      const reviewsSeed = app.get(ReviewsSeedService, { strict: false });
      console.log('▶ Seeding reviews…');
      if (reviewsSeed && typeof reviewsSeed.run === 'function') {
        await reviewsSeed.run(30); 
      } else {
        await callAnySeed(reviewsSeed, 'ReviewsSeedService');
      }
      console.log('✔ Done reviews');
    } else {
      console.log('Seed de reviews deshabilitado (SEED_REVIEWS != 1)');
    }
  } catch (e) {
    console.error('Seed error:', e);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
