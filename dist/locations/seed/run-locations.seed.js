"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
const locations_seed_service_1 = require("./locations.seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const seeder = app.get(locations_seed_service_1.LocationsSeedService);
        await seeder.run();
    }
    finally {
        await app.close();
    }
}
bootstrap();
