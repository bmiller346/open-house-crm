import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1752803900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for frequently queried contact fields
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contacts_workspace_id" ON "contacts" ("workspaceId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contacts_lead_score" ON "contacts" ("leadScore");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contacts_last_contact_date" ON "contacts" ("lastContactDate");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contacts_created_at" ON "contacts" ("createdAt");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_contacts_workspace_lead_score" ON "contacts" ("workspaceId", "leadScore");
    `);
    
    // Add indexes for transactions
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_workspace_id" ON "transaction" ("workspaceId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_transactions_created_at" ON "transaction" ("createdAt");
    `);
    
    // Add indexes for properties
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_properties_workspace_id" ON "properties" ("workspaceId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_properties_created_at" ON "properties" ("createdAt");
    `);
    
    // Add indexes for users
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_google_id" ON "users" ("googleId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
    `);
    
    // Add indexes for workspace_users junction table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_workspace_users_user_id" ON "workspace_users" ("userId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_workspace_users_workspace_id" ON "workspace_users" ("workspaceId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_contacts_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_contacts_lead_score"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_contacts_last_contact_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_contacts_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_contacts_workspace_lead_score"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_transactions_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_properties_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_properties_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_google_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_workspace_users_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_workspace_users_workspace_id"`);
  }
}
