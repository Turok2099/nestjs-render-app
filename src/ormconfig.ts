// ormconfig.ts - Configuración para TypeORM CLI
import { DataSource } from "typeorm";

const config = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // SSL obligatorio para Neon
  ssl: { rejectUnauthorized: false },
  entities: ["src/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/*{.ts,.js}"],
  synchronize: false, // NO usar synchronize en producción
  logging: true,
  // Configuración de pool de conexiones
  extra: {
    max: 20, // Máximo de conexiones en el pool
    min: 5,  // Mínimo de conexiones en el pool
    acquire: 30000, // Tiempo máximo para adquirir conexión
    idle: 10000,    // Tiempo máximo de inactividad
  },
});

export default config;
