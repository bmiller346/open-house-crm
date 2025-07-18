import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyEntity1642000000003 implements MigrationInterface {
  name = 'AddPropertyEntity1642000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "address" character varying(500) NOT NULL,
        "city" character varying(100),
        "state" character varying(50),
        "zipCode" character varying(20),
        "propertyType" character varying(100),
        "price" decimal(15,2),
        "squareFootage" decimal(10,2),
        "bedrooms" integer,
        "bathrooms" integer,
        "status" character varying(50) NOT NULL DEFAULT 'available',
        "description" text,
        "images" json,
        "features" json,
        "mlsNumber" character varying(255),
        "listingDate" date,
        "createdBy" uuid,
        "updatedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_properties" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_properties_workspaceId" ON "properties" ("workspaceId")
    `);

    await queryRunner.query(`
      ALTER TABLE "properties" 
      ADD CONSTRAINT "FK_properties_workspaceId" 
      FOREIGN KEY ("workspaceId") 
      REFERENCES "workspaces"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_properties_workspaceId"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_workspaceId"`);
    await queryRunner.query(`DROP TABLE "properties"`);
  }
}
