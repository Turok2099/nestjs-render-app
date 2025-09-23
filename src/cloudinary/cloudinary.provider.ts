import { v2 as cloudinary } from "cloudinary";
import { ConfigService } from "@nestjs/config";

export const CloudinaryProvider = {
  provide: "CLOUDINARY",
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = configService.get("CLOUDINARY_API_KEY");
    const apiSecret = configService.get("CLOUDINARY_API_SECRET");
    
    // Solo configurar Cloudinary si todas las variables están presentes
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      console.log("✅ Cloudinary configurado correctamente");
    } else {
      console.log("⚠️ Cloudinary no configurado - variables de entorno faltantes");
    }
    
    return cloudinary;
  },
  inject: [ConfigService],
};
