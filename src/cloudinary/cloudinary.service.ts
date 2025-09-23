import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    console.log('☁️ [CloudinaryService] Iniciando subida de imagen...');
    console.log('📁 [CloudinaryService] Archivo:', file.originalname, 'Tamaño:', file.size, 'bytes');
    console.log('📁 [CloudinaryService] MIME type:', file.mimetype);
    
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'exercises',
        },
        (error, result) => {
          if (error) {
            console.error('❌ [CloudinaryService] Error en upload_stream:', error);
            reject(error);
          } else {
            console.log('📋 [CloudinaryService] Resultado de Cloudinary:', result);
            if (result && result.secure_url) {
              console.log('✅ [CloudinaryService] URL generada:', result.secure_url);
              resolve(result.secure_url);
            } else {
              console.error('❌ [CloudinaryService] Resultado sin secure_url:', result);
              reject(new Error("Cloudinary result is missing secure_url."));
            }
          }
        },
      );

      console.log('📤 [CloudinaryService] Enviando buffer a Cloudinary...');
      uploadStream.end(file.buffer);
    });
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