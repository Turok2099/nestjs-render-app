"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSource = exports.typeOrmConfig = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const config_1 = require("@nestjs/config");
(0, dotenv_1.config)();
const config = process.env.DATABASE_URL
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        entities: ["dist/**/*.entity{.ts,.js}"],
        migrations: ["dist/migrations/*{.ts,.js}"],
        logging: process.env.NODE_ENV === "development",
        synchronize: process.env.NODE_ENV === "development",
        dropSchema: false,
        extra: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000,
        },
    }
    : {
        type: "sqlite",
        database: "database.sqlite",
        entities: ["dist/**/*.entity{.ts,.js}"],
        migrations: ["dist/migrations/*{.ts,.js}"],
        logging: true,
        synchronize: true,
        dropSchema: false,
    };
exports.typeOrmConfig = (0, config_1.registerAs)("typeorm", () => config);
exports.connectionSource = new typeorm_1.DataSource(config);
