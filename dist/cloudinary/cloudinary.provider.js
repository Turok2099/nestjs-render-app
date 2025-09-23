"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
exports.CloudinaryProvider = {
    provide: "CLOUDINARY",
    useFactory: (configService) => {
        const cloudName = configService.get("CLOUDINARY_CLOUD_NAME");
        const apiKey = configService.get("CLOUDINARY_API_KEY");
        const apiSecret = configService.get("CLOUDINARY_API_SECRET");
        if (cloudName && apiKey && apiSecret) {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            console.log("✅ Cloudinary configurado correctamente");
        }
        else {
            console.log("⚠️ Cloudinary no configurado - variables de entorno faltantes");
        }
        return cloudinary_1.v2;
    },
    inject: [config_1.ConfigService],
};
