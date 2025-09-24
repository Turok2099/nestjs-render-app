"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
let CloudinaryService = class CloudinaryService {
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
    }
    async uploadImage(file) {
        console.log('☁️ [CloudinaryService] Iniciando subida de imagen...');
        console.log('📁 [CloudinaryService] Archivo:', file.originalname, 'Tamaño:', file.size, 'bytes');
        console.log('📁 [CloudinaryService] MIME type:', file.mimetype);
        try {
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            console.log('📤 [CloudinaryService] Subiendo imagen como base64...');
            const result = await this.cloudinary.uploader.upload(base64String, {
                resource_type: 'image',
                folder: 'exercises',
                public_id: `exercise_${Date.now()}`,
            });
            console.log('📋 [CloudinaryService] Resultado de Cloudinary:', result);
            if (result && result.secure_url) {
                console.log('✅ [CloudinaryService] URL generada:', result.secure_url);
                return result.secure_url;
            }
            else {
                console.error('❌ [CloudinaryService] Resultado sin secure_url:', result);
                throw new Error("Cloudinary result is missing secure_url.");
            }
        }
        catch (error) {
            console.error('❌ [CloudinaryService] Error en upload:', error);
            throw error;
        }
    }
    async deleteImage(publicUrl) {
        try {
            const publicId = this.extractPublicId(publicUrl);
            await this.cloudinary.uploader.destroy(publicId);
        }
        catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }
    }
    extractPublicId(url) {
        const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
        return matches ? matches[1] : url;
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CLOUDINARY')),
    __metadata("design:paramtypes", [Object])
], CloudinaryService);
