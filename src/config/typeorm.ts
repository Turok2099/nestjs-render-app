import { DataSource, DataSourceOptions } from "typeorm";
import { config as dotenvConfig } from "dotenv";
import { registerAs } from "@nestjs/config";

// Cargar variables de entorno
dotenvConfig();

// Configuración para PostgreSQL - usa DATABASE_URL (Neon) o SQLite para desarrollo
const config: DataSourceOptions = process.env.DATABASE_URL
  ? {
      // Configuración para producción (Neon)
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
      // Configuración para desarrollo local (SQLite)
      type: "sqlite",
      database: "database.sqlite",
      entities: ["dist/**/*.entity{.ts,.js}"],
      migrations: ["dist/migrations/*{.ts,.js}"],
      logging: true,
      synchronize: true,
      dropSchema: false,
    };

export const typeOrmConfig = registerAs("typeorm", () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
