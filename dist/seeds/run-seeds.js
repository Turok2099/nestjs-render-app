"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("../config/typeorm");
async function run() {
    const connection = await typeorm_1.connectionSource.initialize();
    connection.setOptions({
        entities: [],
        migrations: [],
    });
    console.log('✅ Seeds completed.');
}
run().catch((err) => {
    console.error('❌ Error seeding', err);
    process.exit(1);
});
