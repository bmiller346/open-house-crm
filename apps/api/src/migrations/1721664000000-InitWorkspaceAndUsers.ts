import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitWorkspaceAndUsers1640000000000 implements MigrationInterface {
  name = 'InitWorkspaceAndUsers1640000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phone" character varying,
        "avatar" character varying,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "preferences" jsonb NOT NULL DEFAULT '{}',
        "passwordHash" character varying,
        "googleId" character varying,
        "linkedinId" character varying,
        "refreshToken" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint on email
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")');

    // Create workspaces table
    await queryRunner.query(`
      CREATE TYPE "workspaces_subscriptionplan_enum" AS ENUM('free', 'pro', 'enterprise')
    `);

    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "ownerId" character varying NOT NULL,
        "subscriptionPlan" "workspaces_subscriptionplan_enum" NOT NULL DEFAULT 'free',
        "isActive" boolean NOT NULL DEFAULT true,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint on slug
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_8259d8f7b7e8c3e0b1e9c5f1b3" ON "workspaces" ("slug")');

    // Create workspace_users junction table
    await queryRunner.query(`
      CREATE TABLE "workspace_users" (
        "workspaceId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" character varying NOT NULL DEFAULT 'member',
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspace_users" PRIMARY KEY ("workspaceId", "userId")
      )
    `);

    // Add foreign key constraints for workspace_users
    await queryRunner.query(`
      ALTER TABLE "workspace_users" 
      ADD CONSTRAINT "FK_workspace_users_workspace" 
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "workspace_users" 
      ADD CONSTRAINT "FK_workspace_users_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Enable Row Level Security (RLS)
    await queryRunner.query('ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY');
    await queryRunner.query('ALTER TABLE "workspace_users" ENABLE ROW LEVEL SECURITY');

    // Create RLS policies
    await queryRunner.query(`
      CREATE POLICY "workspace_isolation" ON "workspaces"
      FOR ALL
      USING (id::text = current_setting('app.workspace_id', true))
    `);

    await queryRunner.query(`
      CREATE POLICY "workspace_users_isolation" ON "workspace_users"
      FOR ALL
      USING ("workspaceId"::text = current_setting('app.workspace_id', true))
    `);

    // Create function to set workspace context
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_workspace_context(workspace_uuid uuid)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.workspace_id', workspace_uuid::text, true);
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop function
    await queryRunner.query('DROP FUNCTION IF EXISTS set_workspace_context(uuid)');

    // Drop policies
    await queryRunner.query('DROP POLICY IF EXISTS "workspace_users_isolation" ON "workspace_users"');
    await queryRunner.query('DROP POLICY IF EXISTS "workspace_isolation" ON "workspaces"');

    // Disable RLS
    await queryRunner.query('ALTER TABLE "workspace_users" DISABLE ROW LEVEL SECURITY');
    await queryRunner.query('ALTER TABLE "workspaces" DISABLE ROW LEVEL SECURITY');

    // Drop foreign key constraints
    await queryRunner.query('ALTER TABLE "workspace_users" DROP CONSTRAINT "FK_workspace_users_user"');
    await queryRunner.query('ALTER TABLE "workspace_users" DROP CONSTRAINT "FK_workspace_users_workspace"');

    // Drop tables
    await queryRunner.query('DROP TABLE "workspace_users"');
    await queryRunner.query('DROP INDEX "IDX_8259d8f7b7e8c3e0b1e9c5f1b3"');
    await queryRunner.query('DROP TABLE "workspaces"');
    await queryRunner.query('DROP TYPE "workspaces_subscriptionplan_enum"');
    await queryRunner.query('DROP INDEX "IDX_97672ac88f789774dd47f7c8be"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
