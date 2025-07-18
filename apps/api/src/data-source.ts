import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Import all entities
import { User } from './entities/User';
import { Workspace } from './entities/Workspace';
import { Contact } from './entities/Contact';
import { Pipeline } from './entities/Pipeline';
import { Transaction } from './entities/Transaction';
import { Property } from './entities/Property';
import { DocumentTemplate } from './entities/DocumentTemplate';
import { Campaign } from './entities/Campaign';
import { Webhook } from './entities/Webhook';
import { WebhookLog } from './entities/WebhookLog';
import { WebhookSecret } from './entities/WebhookSecret';
import { WebhookEvent } from './entities/WebhookEvent';
import { ApiKey } from './entities/ApiKey';
import { CommercialPropertyRecord } from './entities/CountyRecord';
import { Appointment } from './entities/Appointment';
import { Availability } from './entities/Availability';
import { LeadScore } from './entities/LeadScore';
import { InitWorkspaceAndUsers1640000000000 } from './migrations/1640000000000-InitWorkspaceAndUsers';
import { CreateWebhookTables1642000000000 } from './migrations/1642000000000-CreateWebhookTables';
import { UpdateUserSchema1642000000001 } from './migrations/1642000000001-UpdateUserSchema';
import { AddCalendarEntities1642000000002 } from './migrations/1642000000002-AddCalendarEntities';
import { AddPropertyEntity1642000000003 } from './migrations/1642000000003-AddPropertyEntity';
import { AddPerformanceIndexes1752803900000 } from './migrations/1752803900000-AddPerformanceIndexes';
 
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Database config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD ? '***' : 'undefined',
  database: process.env.DB_DATABASE,
  url: process.env.DATABASE_URL ? '***' : 'undefined'
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'openhouse_crm',
  url: process.env.DATABASE_URL,
  synchronize: false, // Always use migrations for schema changes
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Workspace,
    Contact,
    Pipeline,
    Transaction,
    Property,
    DocumentTemplate,
    Campaign,
    Webhook,
    WebhookLog,
    WebhookSecret,
    WebhookEvent,
    ApiKey,
    CommercialPropertyRecord,
    Appointment,
    Availability,
    LeadScore
  ],
  migrations: [InitWorkspaceAndUsers1640000000000, CreateWebhookTables1642000000000, UpdateUserSchema1642000000001, AddCalendarEntities1642000000002, AddPropertyEntity1642000000003, AddPerformanceIndexes1752803900000],
  migrationsTableName: 'migrations',
  migrationsRun: true, // Automatically run migrations on startup
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Always run migrations to ensure schema is up to date
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};
