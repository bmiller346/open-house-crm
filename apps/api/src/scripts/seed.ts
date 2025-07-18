import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function runSeed() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('🌱 Running seed data...');
    
    // Import and run the seed function
    const { seedDatabase } = await import('../seeds');
    await seedDatabase();
    
    console.log('✅ Seed data completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runSeed();
