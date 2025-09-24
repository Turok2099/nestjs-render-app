"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUnnecessaryImageColumns1700000000000 = void 0;
class RemoveUnnecessaryImageColumns1700000000000 {
    constructor() {
        this.name = "RemoveUnnecessaryImageColumns1700000000000";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "image_url"`);
        await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "imagen_grupo"`);
        console.log("✅ Columnas de imagen innecesarias eliminadas");
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exercises" ADD "image_url" varchar(500)`);
        await queryRunner.query(`ALTER TABLE "exercises" ADD "imagen_grupo" varchar(500)`);
        console.log("✅ Columnas de imagen restauradas");
    }
}
exports.RemoveUnnecessaryImageColumns1700000000000 = RemoveUnnecessaryImageColumns1700000000000;
