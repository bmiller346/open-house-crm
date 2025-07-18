# Open House CRM API Documentation

## 🚀 Overview

The Open House CRM API is a comprehensive RESTful API for real estate customer relationship management. It provides multi-tenant workspace support, contact management, pipeline tracking, inventory management, and more.

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.openhousecrm.com`

## 🔐 Authentication

### JWT Token Authentication
All API endpoints (except auth and health) require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

#### 1. Email/Password Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. OAuth Login
- **Google OAuth**: `GET /auth/google`
- **LinkedIn OAuth**: `GET /auth/linkedin`

## 🏢 Multi-Tenant Workspaces

### Workspace Header
Most endpoints require a workspace ID in the header for tenant isolation:

```bash
x-workspace-id: 123e4567-e89b-12d3-a456-426614174000
```

### Workspace Management
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace

## 📋 Core Features

### 1. Contacts Management
Manage leads and customers with full CRUD operations.

**Endpoints:**
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

**Example Create Contact:**
```bash
POST /api/contacts
Authorization: Bearer <token>
x-workspace-id: <workspace-id>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567"
}
```

### 2. Pipeline Management
Track sales progress through customizable pipeline stages.

**Endpoints:**
- `GET /api/pipelines` - List all pipelines

### 3. Transaction Tracking
Manage deals and revenue tracking.

**Endpoints:**
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

**Example Create Transaction:**
```bash
POST /api/transactions
Authorization: Bearer <token>
x-workspace-id: <workspace-id>
Content-Type: application/json

{
  "contactId": "123e4567-e89b-12d3-a456-426614174000",
  "pipelineStage": "qualified",
  "amount": 250000.00
}
```

### 4. Property Inventory
Manage real estate property listings.

**Endpoints:**
- `GET /api/inventory` - List all properties
- `POST /api/inventory` - Create new property
- `GET /api/inventory/:id` - Get property details
- `PUT /api/inventory/:id` - Update property
- `DELETE /api/inventory/:id` - Delete property

**Example Create Property:**
```bash
POST /api/inventory
Authorization: Bearer <token>
x-workspace-id: <workspace-id>
Content-Type: application/json

{
  "address": "123 Main St, Anytown, CA 90210",
  "value": 750000.00
}
```

## 🔒 Security & Permissions

### Role-Based Access Control (RBAC)
The API implements role-based permissions for different operations:

- `read:contacts` - View contacts
- `create:contacts` - Create new contacts
- `update:contacts` - Modify existing contacts
- `delete:contacts` - Remove contacts
- Similar patterns for other resources

### Tenant Isolation
All data is scoped to workspaces, ensuring complete tenant isolation through:
- Workspace ID validation in middleware
- Database-level workspace filtering
- Row-level security policies

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🛠 Development

### Prerequisites
- Node.js 24.4.0+
- PostgreSQL 17.4.0+
- npm or pnpm

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=openhouse_user
DB_PASSWORD=your-password
DB_DATABASE=openhousecrm

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Running the API
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Development with auto-reload
npm run dev
```

### Database Setup
The API uses TypeORM with automatic schema synchronization in development mode. For production, run migrations:

```bash
npm run migration:run
```

## 📈 Future Features

### Planned Endpoints
- `/api/ai/lead-score` - AI-powered lead scoring
- `/api/calendar/appointments` - Calendar integration
- `/api/documents` - Document templates
- `/api/campaigns` - Marketing campaigns
- `/api/analytics` - Reporting and analytics
- `/api/forum/posts` - Agent collaboration

## 🤝 Support

### Getting Help
- **Documentation**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)
- **Repository**: [GitHub Repository](https://github.com/bmiller346/open-house-crm)

### Rate Limits
- Development: No limits
- Production: 1000 requests per hour per user

### API Versioning
Current version: **v1.0.0**
All endpoints are prefixed with `/api/` for consistency.

---

**Built with ❤️ using Node.js, TypeScript, Express.js, and PostgreSQL**
