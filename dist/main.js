"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const swagger_1 = require("@nestjs/swagger");
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            "https://front-amber-tau.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("NuevoTrain API")
        .setDescription("API del sistema de gestión de gimnasio")
        .setVersion("1.0")
        .addBearerAuth()
        .addCookieAuth("refresh_token")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document);
    return app;
}
async function bootstrap() {
    const app = await createApp();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📚 Documentation available at http://localhost:${port}/docs`);
}
async function bootstrapProduction() {
    const app = await createApp();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📚 Documentation available at https://your-app.onrender.com/docs`);
}
if (process.env.NODE_ENV === "development") {
    bootstrap();
}
else {
    bootstrapProduction();
}
