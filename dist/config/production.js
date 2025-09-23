"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionConfig = void 0;
const config_1 = require("@nestjs/config");
exports.productionConfig = (0, config_1.registerAs)("production", () => ({
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || "production",
    frontendUrl: process.env.FRONTEND_URL || "https://front-amber-tau.vercel.app",
    cors: {
        origin: [
            process.env.FRONTEND_URL || "https://front-amber-tau.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        allowedHeaders: "Content-Type, Accept, Authorization, Cookie, X-Requested-With",
        credentials: true,
        optionsSuccessStatus: 200,
    },
    database: {
        url: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        logging: process.env.NODE_ENV === "development",
        synchronize: process.env.NODE_ENV === "development",
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        refreshSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    email: {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
}));
