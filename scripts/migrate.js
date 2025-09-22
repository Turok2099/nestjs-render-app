const { DataSource } = require("typeorm");
const path = require("path");

// Configuración de la base de datos para migraciones
const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [path.join(__dirname, "../dist/**/*.entity.js")],
  migrations: [path.join(__dirname, "../dist/migrations/*.js")],
  logging: true,
});

async function runMigrations() {
  try {
    console.log("🔄 Iniciando migraciones...");

    await dataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    await dataSource.runMigrations();
    console.log("✅ Migraciones ejecutadas exitosamente");

    await dataSource.destroy();
    console.log("✅ Conexión cerrada");
  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
    process.exit(1);
  }
}

runMigrations();
