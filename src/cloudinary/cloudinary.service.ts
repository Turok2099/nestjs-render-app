import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    console.log('☁️ [CloudinaryService] Iniciando subida de imagen...');
    console.log('📁 [CloudinaryService] Archivo:', file.originalname, 'Tamaño:', file.size, 'bytes');
    console.log('📁 [CloudinaryService] MIME type:', file.mimetype);
    
    try {
      // Convertir buffer a base64 string
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      console.log('📤 [CloudinaryService] Subiendo imagen como base64...');
      
      // Usar el método upload directamente con base64
      const result = await this.cloudinary.uploader.upload(base64String, {
        resource_type: 'image',
        folder: 'exercises',
        public_id: `exercise_${Date.now()}`,
      });

      console.log('📋 [CloudinaryService] Resultado de Cloudinary:', result);
      
      if (result && result.secure_url) {
        console.log('✅ [CloudinaryService] URL generada:', result.secure_url);
        return result.secure_url;
      } else {
        console.error('❌ [CloudinaryService] Resultado sin secure_url:', result);
        throw new Error("Cloudinary result is missing secure_url.");
      }
    } catch (error) {
      console.error('❌ [CloudinaryService] Error en upload:', error);
      throw error;
    }
  }

  async deleteImage(publicUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(publicUrl);
      await this.cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }

  private extractPublicId(url: string): string {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : url;
  }
}