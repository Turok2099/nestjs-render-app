const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class MakeTrainerIdNullable1758240000000 {
    name = 'MakeTrainerIdNullable1758240000000'

    async up(queryRunner) {
        // Hacer la columna trainer_id nullable
        await queryRunner.query(`ALTER TABLE "classes" ALTER COLUMN "trainer_id" DROP NOT NULL`);
    }

    async down(queryRunner) {
        // Revertir: hacer la columna trainer_id NOT NULL
        // Primero eliminamos cualquier valor null existente
        await queryRunner.query(`UPDATE "classes" SET "trainer_id" = '00000000-0000-0000-0000-000000000000' WHERE "trainer_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "classes" ALTER COLUMN "trainer_id" SET NOT NULL`);
    }
}


