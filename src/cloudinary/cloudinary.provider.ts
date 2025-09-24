import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "@nestjs/config";

export const CloudinaryProvider = {
  provide: "CLOUDINARY",
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = configService.get("CLOUDINARY_API_KEY");
    const apiSecret = configService.get("CLOUDINARY_API_SECRET");

    console.log("🔍 [CloudinaryProvider] Verificando variables de entorno...");
    console.log("🔍 [CloudinaryProvider] CLOUDINARY_CLOUD_NAME:", cloudName ? "✅ Presente" : "❌ Ausente");
    console.log("🔍 [CloudinaryProvider] CLOUDINARY_API_KEY:", apiKey ? "✅ Presente" : "❌ Ausente");
    console.log("🔍 [CloudinaryProvider] CLOUDINARY_API_SECRET:", apiSecret ? "✅ Presente" : "❌ Ausente");

    // Solo configurar Cloudinary si todas las variables están presentes
    if (cloudName && apiKey && apiSecret) {
      try {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });
        console.log("✅ [CloudinaryProvider] Cloudinary configurado correctamente");
        console.log("✅ [CloudinaryProvider] Cloud Name:", cloudName);
        console.log("✅ [CloudinaryProvider] API Key:", apiKey.substring(0, 8) + "...");
      } catch (error) {
        console.error("❌ [CloudinaryProvider] Error configurando Cloudinary:", error);
      }
    } else {
      console.log("⚠️ [CloudinaryProvider] Cloudinary no configurado - variables de entorno faltantes");
      console.log("⚠️ [CloudinaryProvider] Verificar variables en Render Dashboard");
    }

    return cloudinary;
  },
  inject: [ConfigService],
};
