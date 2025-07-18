# 🔗 Webhook & API Management System

A comprehensive, production-ready webhook and API management system for your CRM application. This system provides secure, scalable, and user-friendly webhook delivery and API key management with enterprise-grade features.

## 🌟 Features

### 🎯 Core Features
- **Webhook Management**: Create, configure, and manage webhooks with full CRUD operations
- **API Key Management**: Generate, manage, and control API keys with granular permissions
- **Event System**: Comprehensive event subscription model with 10+ predefined events
- **Delivery Assurance**: Automatic retry logic with exponential backoff
- **Security First**: HMAC-SHA256 signing, API key authentication, IP whitelisting
- **Real-time Monitoring**: Delivery statistics, health monitoring, and analytics
- **User-friendly UI**: Modern React components for webhook and API management

### 🔒 Security Features
- **HMAC-SHA256 Webhook Signing**: All webhook payloads are cryptographically signed
- **API Key Authentication**: Secure API access with hashed key storage
- **Permission-based Access Control**: Granular permissions for different API operations
- **IP Whitelisting**: Restrict API key usage to specific IP addresses
- **Rate Limiting**: Built-in protection against API abuse
- **Automatic Cleanup**: Scheduled cleanup of old logs and expired keys

### 📊 Monitoring & Analytics
- **Delivery Statistics**: Track success rates, response times, and failure patterns
- **Health Monitoring**: Automatic health checks and alerting
- **Usage Analytics**: API key usage tracking and reporting
- **Audit Trails**: Complete audit logs for all operations
- **Performance Metrics**: Response time monitoring and optimization

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd open-house-crm

# Run the setup script
node scripts/setup-webhook-system.js
```

### 2. Database Setup

Run the migration script to create the necessary tables:

```bash
# PostgreSQL
psql -d your_database -f migrations/001_create_webhook_api_tables.sql

# MySQL
mysql -u username -p database_name < migrations/001_create_webhook_api_tables.sql
```

### 3. Environment Configuration

Add the following environment variables to your `.env` file:

```env
WEBHOOK_SECRET_KEY=your-webhook-secret-key-change-in-production
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5000
API_KEY_EXPIRY_DAYS=365
WEBHOOK_CLEANUP_INTERVAL=24
```

### 4. Start the Server

```bash
npm start
```

## 📡 API Endpoints

### Webhook Management

#### Create Webhook
```bash
POST /api/webhooks
{
  "name": "My Webhook",
  "url": "https://your-app.com/webhook",
  "events": ["contact.created", "contact.updated"],
  "description": "Webhook for contact events",
  "isActive": true
}
```

#### Get Webhooks
```bash
GET /api/webhooks
```

#### Update Webhook
```bash
PATCH /api/webhooks/:id
{
  "name": "Updated Webhook",
  "isActive": false
}
```

#### Delete Webhook
```bash
DELETE /api/webhooks/:id
```

#### Test Webhook
```bash
POST /api/webhooks/:id/test
{
  "eventType": "webhook.test"
}
```

### API Key Management

#### Create API Key
```bash
POST /api/api-keys
{
  "name": "My API Key",
  "permissions": ["read:contacts", "write:contacts"],
  "description": "API key for contact management",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

#### Get API Keys
```bash
GET /api/api-keys
```

#### Regenerate API Key
```bash
POST /api/api-keys/:id/regenerate
```

#### Delete API Key
```bash
DELETE /api/api-keys/:id
```

### Webhook Logs

#### Get Webhook Logs
```bash
GET /api/webhooks/logs?webhook_id=123&status=failed&limit=50
```

#### Retry Failed Webhook
```bash
POST /api/webhooks/logs/:id/retry
```

## 🔧 Configuration

### Webhook Events

The system supports the following webhook events:

| Event | Description |
|-------|-------------|
| `contact.created` | Triggered when a new contact is created |
| `contact.updated` | Triggered when a contact is updated |
| `contact.deleted` | Triggered when a contact is deleted |
| `transaction.created` | Triggered when a new transaction is created |
| `transaction.updated` | Triggered when a transaction is updated |
| `transaction.deleted` | Triggered when a transaction is deleted |
| `property.created` | Triggered when a new property is created |
| `property.updated` | Triggered when a property is updated |
| `property.deleted` | Triggered when a property is deleted |
| `webhook.test` | Test event for webhook verification |

### API Permissions

The system supports granular permissions:

| Permission | Description |
|------------|-------------|
| `read:contacts` | Read contact data |
| `write:contacts` | Create and update contacts |
| `delete:contacts` | Delete contacts |
| `read:transactions` | Read transaction data |
| `write:transactions` | Create and update transactions |
| `delete:transactions` | Delete transactions |
| `read:properties` | Read property data |
| `write:properties` | Create and update properties |
| `delete:properties` | Delete properties |
| `read:webhooks` | Read webhook configurations |
| `write:webhooks` | Create and update webhooks |
| `delete:webhooks` | Delete webhooks |
| `*` | Full access to all resources |

## 🛡️ Security

### Webhook Signature Verification

All webhook payloads are signed with HMAC-SHA256. Verify signatures in your webhook endpoint:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = 'sha256=' + hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// In your webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET_KEY)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook payload
  console.log('Webhook received:', req.body);
  res.json({ success: true });
});
```

### API Key Authentication

Include the API key in the Authorization header:

```javascript
// Using the API key
const response = await fetch('/api/contacts', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});
```

## 🎨 UI Components

### WebhookApiManagement Component

Main management interface for webhooks and API keys:

```jsx
import WebhookApiManagement from './components/settings/WebhookApiManagement';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <WebhookApiManagement />
    </div>
  );
}
```

### WebhookTestUtility Component

Testing utility for webhook endpoints:

```jsx
import WebhookTestUtility from './components/settings/WebhookTestUtility';

function WebhookTesting() {
  return (
    <WebhookTestUtility
      webhookId="webhook-123"
      onTestComplete={(result) => {
        console.log('Test completed:', result);
      }}
    />
  );
}
```

### WebhookLogViewer Component

Log viewer for webhook delivery history:

```jsx
import WebhookLogViewer from './components/settings/WebhookLogViewer';

function WebhookLogs() {
  return (
    <WebhookLogViewer webhookId="webhook-123" />
  );
}
```

## 📊 Monitoring

### Health Monitoring

The system automatically monitors webhook health:

- **Success Rate**: Tracks delivery success rates
- **Response Time**: Monitors average response times
- **Failure Detection**: Automatically detects unhealthy webhooks
- **Auto-disable**: Disables webhooks after consecutive failures

### Analytics Dashboard

View comprehensive analytics:

```bash
GET /api/webhooks/analytics
```

Response:
```json
{
  "success": true,
  "data": {
    "total_webhooks": 15,
    "active_webhooks": 12,
    "total_deliveries": 1234,
    "success_rate": 98.5,
    "average_response_time": 250,
    "healthy_webhooks": 11,
    "failed_webhooks": 1
  }
}
```

## 🔄 Retry Logic

The system implements intelligent retry logic:

1. **Exponential Backoff**: 1s, 5s, 15s, 45s, 135s
2. **Maximum Attempts**: Configurable (default: 3)
3. **Automatic Disable**: After 10 consecutive failures
4. **Manual Retry**: Force retry from the UI or API

## 🧹 Maintenance

### Automated Cleanup

The system includes automated cleanup tasks:

- **Log Cleanup**: Removes logs older than 90 days
- **Statistics Update**: Updates webhook statistics hourly
- **Health Checks**: Monitors webhook health continuously
- **Expired Keys**: Removes expired API keys

### Manual Maintenance

Run maintenance tasks manually:

```bash
# Clean up old logs
node scripts/cleanup-logs.js

# Update statistics
node scripts/update-stats.js

# Health check
node scripts/health-check.js
```

## 🛠️ Development

### Running Tests

```bash
# Run all tests
npm test

# Run webhook tests
npm test -- --grep "webhook"

# Run API key tests
npm test -- --grep "api-key"
```

### Development Server

```bash
# Start development server
npm run dev

# Start with debugging
DEBUG=webhook:* npm run dev
```

### Database Migrations

```bash
# Create new migration
node scripts/create-migration.js "add_webhook_feature"

# Run migrations
node scripts/run-migrations.js

# Rollback migration
node scripts/rollback-migration.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in `docs/`
- Review the troubleshooting guide

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Express API   │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ • Management    │◄──►│ • Webhooks      │◄──►│ • webhooks      │
│ • Testing       │    │ • API Keys      │    │ • webhook_logs  │
│ • Monitoring    │    │ • Auth          │    │ • api_keys      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Services      │
                       │                 │
                       │ • WebhookService│
                       │ • ApiKeyService │
                       │ • EventDispatch │
                       └─────────────────┘
```

### Data Flow

1. **Event Trigger**: Application triggers an event
2. **Event Dispatch**: EventDispatcher processes the event
3. **Webhook Delivery**: WebhookService delivers to registered webhooks
4. **Retry Logic**: Failed deliveries are retried automatically
5. **Logging**: All attempts are logged for monitoring
6. **Analytics**: Statistics are updated in real-time

---

## 🎯 Next Steps

After setting up the system, consider:

1. **Custom Events**: Add custom events for your specific use cases
2. **Advanced Filtering**: Implement event filtering and transformation
3. **Webhooks UI**: Build additional UI components for better user experience
4. **Third-party Integrations**: Add pre-built integrations for popular services
5. **Performance Optimization**: Implement caching and optimization strategies

---

*Built with ❤️ for the Open House CRM project*
