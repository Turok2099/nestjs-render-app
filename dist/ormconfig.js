"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: ["src/**/*.entity{.ts,.js}"],
    migrations: ["src/migrations/*{.ts,.js}"],
    synchronize: false,
    logging: true,
    extra: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
    },
});
exports.default = config;
