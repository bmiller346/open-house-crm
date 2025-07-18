# 🔐 Authentication Setup Guide

## Overview

The Open House CRM implements a comprehensive authentication system with:
- JWT-based access tokens (15 minutes)
- Refresh tokens (7 days)
- Google OAuth integration
- LinkedIn OAuth integration
- Multi-tenant workspace isolation
- Row-level security (RLS)

## Quick Start

### 1. Install Dependencies

**Note**: Node.js is required but not currently installed. Please install Node.js first:

1. Download Node.js from: https://nodejs.org/
2. Install the LTS version
3. Restart your terminal
4. Then run:

```bash
# From the root directory
cd apps/api
npm install

cd ../web
npm install
```

### 2. Database Setup

1. Install PostgreSQL (if not already installed)
2. Create database:
   ```sql
   CREATE DATABASE open_house_crm_dev;
   ```

3. Copy environment file:
   ```bash
   cd apps/api
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/open_house_crm_dev
   JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-min-32-chars
   ```

5. Run migrations and seed data:
   ```bash
   npm run migrate
   npm run seed
   ```

### 3. OAuth Setup (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add secrets to exported json file..

6. This could be reconfigured to use the `.env`:
   ```env 
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add OAuth redirect URL: `http://localhost:3001/auth/linkedin/callback`
4. Add to `.env`:
   ```env
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   ```

### 4. Start Development Servers

```bash
# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Web App
cd apps/web
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email/password login |
| POST | `/auth/register` | User registration |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/linkedin` | LinkedIn OAuth login |

### Example Usage

#### Login
```typescript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@openhouse.dev',
    password: 'admin123'
  })
});

const { data } = await response.json();
const { accessToken, refreshToken, user } = data;
```

#### Protected API Calls
```typescript
const response = await fetch('http://localhost:3001/api/contacts', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Frontend Integration

### useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, isLoginLoading, loginError } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // User will be redirected to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Login form */}
    </form>
  );
}
```

### OAuth Integration

```typescript
function LoginPage() {
  const { handleGoogleAuth, handleLinkedInAuth } = useAuth();

  return (
    <div>
      <button onClick={handleGoogleAuth}>
        Login with Google
      </button>
      <button onClick={handleLinkedInAuth}>
        Login with LinkedIn
      </button>
    </div>
  );
}
```

## Security Features

### Multi-Tenant Isolation
- Each user belongs to one or more workspaces
- Row-level security (RLS) enforces data isolation
- Workspace context is set via `app.workspace_id`

### Token Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on API calls

### Password Security
- bcrypt hashing with salt rounds
- Minimum password requirements (implement as needed)

## Demo Accounts

After running the seed script, you can use these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@openhouse.dev | admin123 | Admin |
| investor@openhouse.dev | investor123 | Investor |

## Development Notes

### Current Status
✅ Authentication routes implemented  
✅ JWT token management  
✅ OAuth strategies configured  
✅ Database schema with RLS  
✅ Frontend auth hook  
⚠️ **Node.js not installed** - Dependencies need to be installed  
⚠️ **Database not configured** - Set up PostgreSQL and run migrations  

### Next Steps
1. Install Node.js and dependencies
2. Set up PostgreSQL database
3. Configure environment variables
4. Run migrations and seeds
5. Test authentication flow
6. Implement protected routes

## Troubleshooting

### Common Issues

1. **Node.js not found**
   - Install Node.js from nodejs.org
   - Restart terminal after installation

2. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check database credentials in .env
   - Verify database exists

3. **JWT errors**
   - Ensure JWT_SECRET is at least 32 characters
   - Check token expiration settings

4. **OAuth redirect errors**
   - Verify callback URLs in provider settings
   - Check CLIENT_ID and CLIENT_SECRET

For more help, check the logs or create an issue in the repository.
