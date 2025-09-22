"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const classes_seed_service_1 = require("./classes/seed/classes.seed.service");
const reviews_seed_service_1 = require("./reviews/seed/reviews.seed.service");
async function callAnySeed(instance, label) {
    if (!instance) {
        console.log(`${label}: servicio no encontrado (no-op)`);
        return;
    }
    if (typeof instance.run === 'function')
        return instance.run();
    if (typeof instance.seed === 'function')
        return instance.seed();
    if (typeof instance.execute === 'function')
        return instance.execute();
    if (typeof instance.populate === 'function')
        return instance.populate();
    console.log(`${label}: no tiene métodos run/seed/execute/populate (no-op)`);
}
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        if (process.env.SEED_CLASSES_FRONT === '1') {
            const classesSeed = app.get(classes_seed_service_1.ClassesSeedService, { strict: false });
            console.log('▶ Seeding clases (front mock)…');
            await callAnySeed(classesSeed, 'ClassesSeedService');
            console.log('✔ Done clases');
        }
        else {
            console.log('Seed de clases deshabilitado (SEED_CLASSES_FRONT != 1)');
        }
        if (process.env.SEED_REVIEWS === '1') {
            const reviewsSeed = app.get(reviews_seed_service_1.ReviewsSeedService, { strict: false });
            console.log('▶ Seeding reviews…');
            if (reviewsSeed && typeof reviewsSeed.run === 'function') {
                await reviewsSeed.run(30);
            }
            else {
                await callAnySeed(reviewsSeed, 'ReviewsSeedService');
            }
            console.log('✔ Done reviews');
        }
        else {
            console.log('Seed de reviews deshabilitado (SEED_REVIEWS != 1)');
        }
    }
    catch (e) {
        console.error('Seed error:', e);
        process.exitCode = 1;
    }
    finally {
        await app.close();
    }
}
bootstrap();
