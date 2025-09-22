import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1758236000000 implements MigrationInterface {
  name = 'CreatePaymentsTable1758236000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear la tabla de pagos
    await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "stripe_payment_intent_id" character varying NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "currency" character varying(3) NOT NULL,
                "status" character varying(20) NOT NULL DEFAULT 'pending',
                "payment_type" character varying(20) NOT NULL DEFAULT 'subscription',
                "plan_id" uuid,
                "subscription_id" uuid,
                "stripe_metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_payments_stripe_payment_intent_id" UNIQUE ("stripe_payment_intent_id")
            )
        `);

    // Crear índices
    await queryRunner.query(`
            CREATE INDEX "IDX_payments_user_status_created" 
            ON "payments" ("user_id", "status", "created_at")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_payments_stripe_payment_intent_id" 
            ON "payments" ("stripe_payment_intent_id")
        `);

    // Agregar foreign key constraint si la tabla users existe
    await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}



