import 'reflect-metadata';
import { AppDataSource } from './data-source';

async function runMigration() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('🔄 Running migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed successfully');

    console.log('🔍 Checking migrations table...');
    const migrations = await AppDataSource.query('SELECT * FROM migrations ORDER BY timestamp DESC');
    console.log('📋 Applied migrations:');
    migrations.forEach((migration: any) => {
      console.log(`  - ${migration.name} (${migration.timestamp})`);
    });

    console.log('🔍 Checking users table structure...');
    const userColumns = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('📋 Users table columns:');
    userColumns.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
