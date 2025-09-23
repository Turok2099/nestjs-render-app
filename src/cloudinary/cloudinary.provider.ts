import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "@nestjs/config";

export const CloudinaryProvider = {
  provide: "CLOUDINARY",
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = configService.get("CLOUDINARY_API_KEY");
    const apiSecret = configService.get("CLOUDINARY_API_SECRET");

    console.log("🔍 [CloudinaryProvider] Verificando variables de entorno...");
    console.log("   CLOUDINARY_CLOUD_NAME:", cloudName ? "✅ Presente" : "❌ Ausente");
    console.log("   CLOUDINARY_API_KEY:", apiKey ? "✅ Presente" : "❌ Ausente");
    console.log("   CLOUDINARY_API_SECRET:", apiSecret ? "✅ Presente" : "❌ Ausente");

    // Solo configurar Cloudinary si todas las variables están presentes
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      console.log("✅ [CloudinaryProvider] Cloudinary configurado correctamente");
      console.log("   Cloud Name:", cloudName);
      console.log("   API Key:", apiKey);
    } else {
      console.log(
        "⚠️ [CloudinaryProvider] Cloudinary no configurado - variables de entorno faltantes",
      );
    }

    return cloudinary;
  },
  inject: [ConfigService],
};
