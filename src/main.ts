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

  // Configuración robusta de CORS
  const allowedOrigins = [
    "https://front-amber-tau.vercel.app", // Frontend en producción
    "http://localhost:3000", // Desarrollo local
    "http://127.0.0.1:3000", // Alternativa localhost
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`🚫 Origin no permitido: ${origin}`);
        callback(new Error('No permitido por CORS'), false);
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: [
      "Content-Type", 
      "Accept", 
      "Authorization", 
      "Cookie", 
      "X-Requested-With",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // Middleware para manejar preflight requests (OPTIONS)
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      // Obtener el origin de la petición
      const origin = req.headers.origin;
      
      // Verificar si el origin está permitido
      if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      } else {
        // Fallback al frontend de producción
        res.header("Access-Control-Allow-Origin", "https://front-amber-tau.vercel.app");
      }
      
      res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Accept, Authorization, Cookie, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400"); // Cache preflight por 24 horas
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
