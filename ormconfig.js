const { DataSource } = require("typeorm");
const path = require("path");

module.exports = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [path.join(__dirname, "dist/**/*.entity.js")],
  migrations: [path.join(__dirname, "dist/migrations/*.js")],
  logging: process.env.NODE_ENV === "development",
  synchronize: false, // Nunca usar synchronize en producción
});
