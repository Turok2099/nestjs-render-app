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
      "https://front-amber-tau.vercel.app", // Frontend estable en producción
      "http://localhost:3000", // Desarrollo local
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders:
      "Content-Type, Accept, Authorization, Cookie, X-Requested-With",
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // Middleware para manejar preflight requests (OPTIONS)
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Origin",
        "https://front-amber-tau.vercel.app",
      );
      res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Accept, Authorization, Cookie, X-Requested-With",
      );
      res.header("Access-Control-Allow-Credentials", "true");
      return res.status(200).end();
    }
    next();
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
