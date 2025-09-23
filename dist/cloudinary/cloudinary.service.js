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
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                resource_type: 'image',
                folder: 'exercises',
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (result && result.secure_url) {
                        resolve(result.secure_url);
                    }
                    else {
                        reject(new Error("Cloudinary result is missing secure_url."));
                    }
                }
            });
            uploadStream.end(file.buffer);
        });
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
