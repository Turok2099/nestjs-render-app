import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnnecessaryImageColumns1700000000000
  implements MigrationInterface
{
  name = "RemoveUnnecessaryImageColumns1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columna image_url (legacy)
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN IF EXISTS "image_url"`,
    );

    // Eliminar columna imagen_grupo (no se usa para ejercicios específicos)
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN IF EXISTS "imagen_grupo"`,
    );

    console.log("✅ Columnas de imagen innecesarias eliminadas");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recrear columna image_url
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "image_url" varchar(500)`,
    );

    // Recrear columna imagen_grupo
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "imagen_grupo" varchar(500)`,
    );

    console.log("✅ Columnas de imagen restauradas");
  }
}
