import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

/**
 * 🔹 Configuración común de la app Nest
 */
async function createApp() {
  const app = await NestFactory.create(AppModule);

  // Configuración simplificada de CORS
  app.enableCors({
    origin: [
      "https://front-amber-tau.vercel.app", // Frontend en producción
      "http://localhost:3000", // Desarrollo local
      "http://localhost:3001", // Desarrollo local (puerto alternativo)
      "http://127.0.0.1:3000", // Alternativa localhost
      "http://127.0.0.1:3001", // Alternativa localhost (puerto alternativo)
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("NuevoTrain API")
    .setDescription("API del sistema de gestión de gimnasio")
    .setVersion("1.0")
    .addBearerAuth()
    .addCookieAuth("refresh_token")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  return app;
}

/**
 * 🚀 Bootstrap para desarrollo local
 */
async function bootstrap() {
  const app = await createApp();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(`📚 Documentation available at http://localhost:${port}/docs`);
}

/**
 * 🚀 Bootstrap para producción
 */
async function bootstrapProduction() {
  const app = await createApp();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(
    `📚 Documentation available at https://your-app.onrender.com/docs`,
  );
}

/**
 * Ejecutar según el entorno
 */
if (process.env.NODE_ENV === "development") {
  bootstrap();
} else {
  bootstrapProduction();
}
