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
        console.log("🔍 [CloudinaryProvider] Verificando variables de entorno...");
        console.log("🔍 [CloudinaryProvider] CLOUDINARY_CLOUD_NAME:", cloudName ? "✅ Presente" : "❌ Ausente");
        console.log("🔍 [CloudinaryProvider] CLOUDINARY_API_KEY:", apiKey ? "✅ Presente" : "❌ Ausente");
        console.log("🔍 [CloudinaryProvider] CLOUDINARY_API_SECRET:", apiSecret ? "✅ Presente" : "❌ Ausente");
        if (cloudName && apiKey && apiSecret) {
            try {
                cloudinary_1.v2.config({
                    cloud_name: cloudName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                });
                console.log("✅ [CloudinaryProvider] Cloudinary configurado correctamente");
                console.log("✅ [CloudinaryProvider] Cloud Name:", cloudName);
                console.log("✅ [CloudinaryProvider] API Key:", apiKey.substring(0, 8) + "...");
            }
            catch (error) {
                console.error("❌ [CloudinaryProvider] Error configurando Cloudinary:", error);
            }
        }
        else {
            console.log("⚠️ [CloudinaryProvider] Cloudinary no configurado - variables de entorno faltantes");
            console.log("⚠️ [CloudinaryProvider] Verificar variables en Render Dashboard");
        }
        return cloudinary_1.v2;
    },
    inject: [config_1.ConfigService],
};
