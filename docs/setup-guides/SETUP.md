# 🏠 Open House CRM - Setup Instructions

## ⚠️ Current Status: Node.js PATH Issue

Your Node.js is installed but not accessible in the terminal. Here's how to fix it:

### 🔧 Fix Node.js PATH (Choose One)

#### Option 1: Restart Everything
1. Close VS Code completely
2. Restart VS Code  
3. Open new terminal
4. Test: `node --version`

#### Option 2: Fix Environment Variables
1. Press `Win + R` → type `sysdm.cpl` → Enter
2. Click "Environment Variables"
3. In System variables, edit "Path"
4. Add: `C:\Program Files\nodejs`
5. Restart terminal, test: `node --version`

#### Option 3: Reinstall Node.js
1. Download from: https://nodejs.org/
2. Install LTS version
3. Restart computer
4. Test: `node --version`

### 🚀 Once Node.js Works

```bash
# Install dependencies
cd apps/api && npm install
cd ../web && npm install

# Set up database (PostgreSQL required)
cd apps/api
copy .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed

# Start development
npm run dev  # API server
cd ../web && npm run dev  # Web app
```

### 🎯 Demo Accounts
- `admin@openhouse.dev` / `admin123`
- `investor@openhouse.dev` / `investor123`

### 📚 Full Documentation
See `docs/AUTH_SETUP.md` for complete setup guide.

---

✅ **Ready to Continue**: Auth system complete, database schema ready, environment configured!

Once Node.js PATH is fixed, you'll have a fully functional next-gen real estate CRM! 🏠✨
