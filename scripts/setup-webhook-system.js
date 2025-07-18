#!/usr/bin/env node

/**
 * Webhook & API Management Setup Script
 * 
 * This script sets up the complete webhook and API management system
 * including database migrations, service integrations, and configuration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.WHITE) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.GREEN);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.RED);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.YELLOW);
}

function logStep(message) {
  log(`🔄 ${message}`, COLORS.CYAN);
}

function checkPrerequisites() {
  logStep('Checking prerequisites...');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  // Check if database is accessible
  try {
    if (fs.existsSync('config/db.js')) {
      logSuccess('Database configuration found');
    } else {
      logWarning('Database configuration not found at config/db.js');
    }
  } catch (error) {
    logError('Error checking database configuration');
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 14) {
    logError('Node.js version 14 or higher is required');
    process.exit(1);
  }
  
  logSuccess('Prerequisites check passed');
}

function installDependencies() {
  logStep('Installing required dependencies...');
  
  const dependencies = [
    'express-validator',
    'node-cron',
    'axios'
  ];
  
  const devDependencies = [
    '@types/node-cron',
    '@types/express-validator'
  ];
  
  try {
    // Install production dependencies
    execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
    
    // Install dev dependencies
    execSync(`npm install --save-dev ${devDependencies.join(' ')}`, { stdio: 'inherit' });
    
    logSuccess('Dependencies installed successfully');
  } catch (error) {
    logError('Failed to install dependencies');
    console.error(error.message);
    process.exit(1);
  }
}

function runDatabaseMigrations() {
  logStep('Running database migrations...');
  
  const migrationFile = path.join(__dirname, 'migrations', '001_create_webhook_api_tables.sql');
  
  if (!fs.existsSync(migrationFile)) {
    logError('Migration file not found');
    return;
  }
  
  // This would need to be adapted based on your database setup
  logInfo('Database migration file is ready. Please run it manually against your database.');
  logInfo(`Migration file: ${migrationFile}`);
  
  // Example commands you might run:
  logInfo('Example commands:');
  logInfo('PostgreSQL: psql -d your_database -f migrations/001_create_webhook_api_tables.sql');
  logInfo('MySQL: mysql -u username -p database_name < migrations/001_create_webhook_api_tables.sql');
  
  logWarning('Please run the migration manually and press Enter to continue...');
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).question('', () => {
    logSuccess('Database migrations completed');
  });
}

function updateServerConfiguration() {
  logStep('Updating server configuration...');
  
  const serverFile = path.join(__dirname, 'server.js');
  
  if (!fs.existsSync(serverFile)) {
    logError('server.js not found');
    return;
  }
  
  let serverContent = fs.readFileSync(serverFile, 'utf8');
  
  // Check if webhook routes are already added
  if (serverContent.includes('webhooks') && serverContent.includes('api-keys')) {
    logSuccess('Server configuration already updated');
    return;
  }
  
  // Add webhook routes
  const webhookRoutes = `
// Webhook and API routes
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/api-keys', require('./routes/api-keys'));
`;
  
  // Find a good place to insert the routes
  const routesIndex = serverContent.lastIndexOf('app.use(');
  if (routesIndex !== -1) {
    const insertIndex = serverContent.indexOf('\n', routesIndex) + 1;
    serverContent = serverContent.slice(0, insertIndex) + webhookRoutes + serverContent.slice(insertIndex);
    
    fs.writeFileSync(serverFile, serverContent);
    logSuccess('Server configuration updated');
  } else {
    logWarning('Could not automatically update server.js. Please add webhook routes manually.');
  }
}

function createEnvironmentVariables() {
  logStep('Setting up environment variables...');
  
  const envFile = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
  }
  
  const requiredEnvVars = [
    'WEBHOOK_SECRET_KEY',
    'WEBHOOK_RETRY_ATTEMPTS',
    'WEBHOOK_RETRY_DELAY',
    'API_KEY_EXPIRY_DAYS',
    'WEBHOOK_CLEANUP_INTERVAL'
  ];
  
  const defaultValues = {
    WEBHOOK_SECRET_KEY: 'your-webhook-secret-key-change-in-production',
    WEBHOOK_RETRY_ATTEMPTS: '3',
    WEBHOOK_RETRY_DELAY: '5000',
    API_KEY_EXPIRY_DAYS: '365',
    WEBHOOK_CLEANUP_INTERVAL: '24'
  };
  
  let updated = false;
  
  requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar)) {
      envContent += `\n${envVar}=${defaultValues[envVar]}`;
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(envFile, envContent);
    logSuccess('Environment variables updated');
  } else {
    logSuccess('Environment variables already configured');
  }
}

function createDocumentation() {
  logStep('Creating documentation...');
  
  const docsDir = path.join(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const quickStartContent = `# Webhook & API Management Quick Start Guide

## Overview
This guide will help you get started with the webhook and API management system.

## Setting Up Webhooks

### 1. Create a Webhook
\`\`\`bash
curl -X POST http://localhost:3000/api/webhooks \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Webhook",
    "url": "https://your-app.com/webhook",
    "events": ["contact.created", "contact.updated"],
    "description": "Webhook for contact events"
  }'
\`\`\`

### 2. Test a Webhook
\`\`\`bash
curl -X POST http://localhost:3000/api/webhooks/{webhook-id}/test \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "webhook.test"
  }'
\`\`\`

## Setting Up API Keys

### 1. Create an API Key
\`\`\`bash
curl -X POST http://localhost:3000/api/api-keys \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My API Key",
    "permissions": ["read:contacts", "write:contacts"],
    "description": "API key for contact management"
  }'
\`\`\`

### 2. Use an API Key
\`\`\`bash
curl -X GET http://localhost:3000/api/contacts \\
  -H "Authorization: Bearer your-api-key-here"
\`\`\`

## Webhook Events

- \`contact.created\` - Triggered when a contact is created
- \`contact.updated\` - Triggered when a contact is updated
- \`contact.deleted\` - Triggered when a contact is deleted
- \`transaction.created\` - Triggered when a transaction is created
- \`transaction.updated\` - Triggered when a transaction is updated
- \`transaction.deleted\` - Triggered when a transaction is deleted
- \`property.created\` - Triggered when a property is created
- \`property.updated\` - Triggered when a property is updated
- \`property.deleted\` - Triggered when a property is deleted

## API Permissions

- \`read:contacts\` - Read contact data
- \`write:contacts\` - Create and update contacts
- \`delete:contacts\` - Delete contacts
- \`read:transactions\` - Read transaction data
- \`write:transactions\` - Create and update transactions
- \`delete:transactions\` - Delete transactions
- \`read:properties\` - Read property data
- \`write:properties\` - Create and update properties
- \`delete:properties\` - Delete properties
- \`*\` - Full access to all resources

## Security

### Webhook Signature Verification
All webhook payloads are signed with HMAC-SHA256. Verify the signature using:

\`\`\`javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}
\`\`\`

### API Key Security
- Store API keys securely
- Use appropriate permissions
- Regularly rotate keys
- Monitor usage

## Monitoring

### Webhook Logs
View webhook delivery logs at: \`GET /api/webhooks/logs\`

### API Key Usage
View API key usage at: \`GET /api/api-keys/{key-id}/usage\`

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook is active
   - Check event subscriptions

2. **API key authentication failing**
   - Verify API key is active
   - Check permissions
   - Ensure correct authorization header

3. **High failure rates**
   - Check endpoint availability
   - Verify SSL certificates
   - Monitor response times

For more detailed information, see the full API documentation.
`;
  
  fs.writeFileSync(path.join(docsDir, 'QUICK_START.md'), quickStartContent);
  logSuccess('Documentation created');
}

function validateSetup() {
  logStep('Validating setup...');
  
  const requiredFiles = [
    'routes/webhooks.js',
    'routes/api-keys.js',
    'middleware/apiKeyAuth.js',
    'services/EnhancedWebhookService.js',
    'services/ApiKeyService.js',
    'models/Webhook.js',
    'models/ApiKey.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`${file} exists`);
    } else {
      logError(`${file} not found`);
      allFilesExist = false;
    }
  });
  
  if (allFilesExist) {
    logSuccess('All required files are present');
  } else {
    logError('Some required files are missing');
    process.exit(1);
  }
}

function displayCompletionMessage() {
  log('\n' + '='.repeat(60), COLORS.GREEN);
  log('🎉 WEBHOOK & API MANAGEMENT SETUP COMPLETE! 🎉', COLORS.GREEN);
  log('='.repeat(60), COLORS.GREEN);
  
  log('\nNext steps:', COLORS.CYAN);
  log('1. Start your server: npm start', COLORS.WHITE);
  log('2. Test webhook creation: curl -X POST http://localhost:3000/api/webhooks', COLORS.WHITE);
  log('3. Create your first API key: curl -X POST http://localhost:3000/api/api-keys', COLORS.WHITE);
  log('4. Check the documentation in docs/QUICK_START.md', COLORS.WHITE);
  
  log('\nAPI Endpoints:', COLORS.CYAN);
  log('• Webhooks: /api/webhooks', COLORS.WHITE);
  log('• API Keys: /api/api-keys', COLORS.WHITE);
  log('• Webhook Logs: /api/webhooks/logs', COLORS.WHITE);
  
  log('\nUI Components:', COLORS.CYAN);
  log('• WebhookApiManagement.js - Main management interface', COLORS.WHITE);
  log('• WebhookTestUtility.tsx - Testing utility', COLORS.WHITE);
  log('• WebhookLogViewer.tsx - Log viewer', COLORS.WHITE);
  
  log('\nSecurity Features:', COLORS.CYAN);
  log('• HMAC-SHA256 webhook signing', COLORS.WHITE);
  log('• API key authentication', COLORS.WHITE);
  log('• Permission-based access control', COLORS.WHITE);
  log('• IP whitelisting support', COLORS.WHITE);
  
  log('\nMonitoring & Analytics:', COLORS.CYAN);
  log('• Webhook delivery statistics', COLORS.WHITE);
  log('• API key usage tracking', COLORS.WHITE);
  log('• Health monitoring', COLORS.WHITE);
  log('• Automatic retry logic', COLORS.WHITE);
  
  log('\n' + '='.repeat(60), COLORS.GREEN);
}

function main() {
  log('🚀 Starting Webhook & API Management Setup', COLORS.MAGENTA);
  log('='.repeat(50), COLORS.MAGENTA);
  
  try {
    checkPrerequisites();
    installDependencies();
    runDatabaseMigrations();
    updateServerConfiguration();
    createEnvironmentVariables();
    createDocumentation();
    validateSetup();
    displayCompletionMessage();
  } catch (error) {
    logError('Setup failed');
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  installDependencies,
  runDatabaseMigrations,
  updateServerConfiguration,
  createEnvironmentVariables,
  createDocumentation,
  validateSetup
};
