import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('🔄 Running migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('📋 No pending migrations');
    } else {
      console.log(`✅ Executed ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`   - ${migration.name}`);
      });
    }

    console.log('✅ Migration process completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runMigrations();
