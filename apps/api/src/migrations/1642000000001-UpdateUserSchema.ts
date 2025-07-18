import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserSchema1642000000001 implements MigrationInterface {
    name = 'UpdateUserSchema1642000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Starting user schema migration...');

        // Add new columns if they don't exist (these are additions to the existing schema)
        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS googleAccessToken TEXT;
        `);

        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS googleRefreshToken TEXT;
        `);

        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
        `);

        // Note: Other columns like name, googleId, avatar, isEmailVerified, etc. already exist from the initial schema

        // Update existing users to have settings if they don't have them
        await queryRunner.query(`
            UPDATE users 
            SET settings = '{}'
            WHERE settings IS NULL;
        `);

        // Create unique index on googleId if not exists
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(googleId) WHERE googleId IS NOT NULL;
        `);

        // The workspace and user_workspaces relationship should already exist from the initial schema
        // Just make sure we have the right junction table name (workspace_users vs user_workspaces)
        
        console.log('✅ User schema migration completed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting user schema migration...');

        // Drop added columns
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS settings`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS googleRefreshToken`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS googleAccessToken`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_google_id`);

        console.log('✅ User schema migration reverted');
    }
}
