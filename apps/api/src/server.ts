import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Workspace } from './entities/Workspace';
import { authRouter } from './routes/auth';
import webhookRouter from './routes/webhooks';
import apiKeyRouter from './routes/api-keys';
import { authMiddleware } from './middleware/authMiddleware';
import { tenantMiddleware } from './middleware/tenantMiddleware';
import { rbacMiddleware } from './middleware/rbacMiddleware';
import { AuthRequest } from './types/auth';

// Import feature controllers
import { loginHandler } from './features/auth/controller';
import { 
  getWorkspacesHandler, 
  getWorkspaceHandler, 
  createWorkspaceHandler, 
  updateWorkspaceHandler 
} from './features/workspaces/controller';
import {
  getContactsHandler,
  getContactHandler,
  createContactHandler,
  updateContactHandler,
  deleteContactHandler,
  // Enhanced CRM functions
  createContactAdvancedHandler,
  searchContactsHandler,
  calculateLeadScoreHandler,
  checkDuplicatesHandler,
  getContactRecommendationsHandler,
  bulkUpdateContactsHandler,
  getContactAnalyticsHandler
} from './features/contacts/controller';
import { getPipelinesHandler } from './features/pipelines/controller';
import {
  getTransactionsHandler,
  getTransactionHandler,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler
} from './features/transactions/controller';
import resourceController from './features/resources/controller';
import * as calendarController from './features/calendar/controller';
import { getDocumentsHandler } from './features/documents/controller';
import { getCampaignsHandler } from './features/campaigns/controller';
import { getAnalyticsHandler } from './features/analytics/controller';
import { getPostsHandler } from './features/forum/controller';
import {
  getInventoryHandler,
  getPropertyHandler,
  createPropertyHandler,
  updatePropertyHandler,
  deletePropertyHandler
} from './features/inventory/controller';
import {
  registerWebhookHandler,
  getWebhooksHandler,
  updateWebhookHandler,
  deleteWebhookHandler,
  testWebhookHandler,
  getWebhookLogsHandler,
  getWebhookStatsHandler
} from './features/webhooks/controller';
import {
  getUserPreferences,
  updateUserPreferences,
  getWorkspaceSettings,
  updateWorkspaceSettings,
  resetUserPreferences
} from './features/settings/preferences.controller';
import {
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  getApiKeys,
  createApiKey,
  deleteApiKey
} from './features/settings/integrations.controller';
import {
  getNotificationSettings,
  updateNotificationSettings,
  testNotification,
  unsubscribeFromNotifications,
  getNotificationDigest
} from './features/settings/notifications.controller';
import { commercialPropertyController } from './features/government-data/commercial-controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Initialize database
async function initializeApp() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    
    // Run migrations
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-ID']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Load Google OAuth Configuration
let googleConfig: any = null;
try {
  const googleClientSecretPath = path.join(__dirname, '..', 'google-client-secret.json');
  if (fs.existsSync(googleClientSecretPath)) {
    const googleClientSecret = fs.readFileSync(googleClientSecretPath, 'utf8');
    googleConfig = JSON.parse(googleClientSecret);
    console.log('✅ Google OAuth credentials loaded successfully');
  } else {
    console.log('⚠️ Google OAuth credentials not found. OAuth will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to load Google OAuth credentials:', error);
}

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 */
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Open House CRM API Documentation',
}));

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Workspaces
 *     description: Multi-tenant workspace management
 *   - name: Contacts
 *     description: Contact and lead management
 *   - name: Pipelines
 *     description: Sales pipeline management
 *   - name: Transactions
 *     description: Deal and transaction tracking
 *   - name: Resources
 *     description: Educational resources and tools
 *   - name: Inventory
 *     description: Property inventory management
 *   - name: AI
 *     description: AI-powered features
 *   - name: Calendar
 *     description: Appointment and calendar management
 *   - name: Documents
 *     description: Document templates and management
 *   - name: Campaigns
 *     description: Marketing campaign management
 *   - name: Analytics
 *     description: Reporting and analytics
 *   - name: Forum
 *     description: Agent collaboration and forum
 *   - name: Health
 *     description: System health and monitoring
 */

// Auth routes (no middleware)
app.use('/auth', authRouter);

// Webhook routes (with middleware)
app.use('/api/webhooks', webhookRouter);

// API Key routes (with middleware)
app.use('/api/api-keys', apiKeyRouter);

// Legacy auth endpoint (for backward compatibility)
app.post('/api/auth/login', loginHandler);

// Get current user endpoint
app.get('/api/auth', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.userId },
      relations: ['workspaces']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          preferences: user.preferences,
          workspaces: user.workspaces
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Protected API routes with auth, tenant, and RBAC middleware
/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: List all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @ts-ignore - Type issue with AuthRequest vs Request, will fix later
app.get('/api/workspaces', authMiddleware, getWorkspacesHandler);
/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   get:
 *     summary: Get a specific workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - name: workspaceId
 *         in: path
 *         required: true
 *         description: The workspace ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workspace details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Workspace'
 *       404:
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @ts-ignore
app.get('/api/workspaces/:workspaceId', authMiddleware, tenantMiddleware, getWorkspaceHandler);
/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceRequest'
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @ts-ignore
app.post('/api/workspaces', authMiddleware, createWorkspaceHandler);
// @ts-ignore
app.put('/api/workspaces/:workspaceId', authMiddleware, tenantMiddleware, updateWorkspaceHandler);

// Contacts, Transactions, Inventory routes with tenant middleware
const apiRoutes = express.Router();
apiRoutes.use(tenantMiddleware);

// Use the tenant-scoped router for these features
app.use('/api/contacts', authMiddleware, apiRoutes);
app.use('/api/transactions', authMiddleware, apiRoutes);
app.use('/api/inventory', authMiddleware, apiRoutes);

// Assign handlers to the tenant-scoped router
apiRoutes.get('/api/contacts', rbacMiddleware(['read:contacts']), getContactsHandler);
apiRoutes.get('/api/contacts/:contactId', rbacMiddleware(['read:contacts']), getContactHandler);
apiRoutes.post('/api/contacts', rbacMiddleware(['create:contacts']), createContactHandler);
apiRoutes.put('/api/contacts/:contactId', rbacMiddleware(['update:contacts']), updateContactHandler);
apiRoutes.delete('/api/contacts/:contactId', rbacMiddleware(['delete:contacts']), deleteContactHandler);
apiRoutes.post('/api/contacts/advanced', rbacMiddleware(['create:contacts']), createContactAdvancedHandler);
apiRoutes.get('/api/contacts/search/all', rbacMiddleware(['read:contacts']), searchContactsHandler);
apiRoutes.post('/api/contacts/:contactId/lead-score', rbacMiddleware(['read:contacts']), calculateLeadScoreHandler);
apiRoutes.post('/api/contacts/check-duplicates', rbacMiddleware(['read:contacts']), checkDuplicatesHandler);
apiRoutes.get('/api/contacts/recommendations/all', rbacMiddleware(['read:contacts']), getContactRecommendationsHandler);
apiRoutes.put('/api/contacts/bulk/update', rbacMiddleware(['update:contacts']), bulkUpdateContactsHandler);
apiRoutes.get('/api/contacts/analytics/dashboard', rbacMiddleware(['read:contacts']), getContactAnalyticsHandler);

apiRoutes.get('/api/transactions', rbacMiddleware(['read:transactions']), getTransactionsHandler);
apiRoutes.get('/api/transactions/:transactionId', rbacMiddleware(['read:transactions']), getTransactionHandler);
apiRoutes.post('/api/transactions', rbacMiddleware(['create:transactions']), createTransactionHandler);
apiRoutes.put('/api/transactions/:transactionId', rbacMiddleware(['update:transactions']), updateTransactionHandler);
apiRoutes.delete('/api/transactions/:transactionId', rbacMiddleware(['delete:transactions']), deleteTransactionHandler);

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: List all contacts in the workspace
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: List of contacts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContactRequest'
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 */
// Contacts CRUD
app.get(
  '/api/contacts',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  getContactsHandler
);
/**
 * @swagger
 * /api/contacts/{contactId}:
 *   get:
 *     summary: Get a specific contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - name: contactId
 *         in: path
 *         required: true
 *         description: The contact ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contact details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - name: contactId
 *         in: path
 *         required: true
 *         description: The contact ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContactRequest'
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - name: contactId
 *         in: path
 *         required: true
 *         description: The contact ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @ts-ignore
app.get(
  '/api/contacts/:contactId',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  getContactHandler
);
// @ts-ignore
app.post(
  '/api/contacts',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['create:contacts']) as any),
  createContactHandler
);
// @ts-ignore
app.put(
  '/api/contacts/:contactId',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['update:contacts']) as any),
  updateContactHandler
);
// @ts-ignore
app.delete(
  '/api/contacts/:contactId',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['delete:contacts']) as any),
  deleteContactHandler
);
// Enhanced Contacts endpoints
// @ts-ignore
app.post(
  '/api/contacts/advanced',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['create:contacts']) as any),
  createContactAdvancedHandler
);
// @ts-ignore
app.get(
  '/api/contacts/search/all',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  searchContactsHandler
);
// @ts-ignore
app.post(
  '/api/contacts/:contactId/lead-score',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  calculateLeadScoreHandler
);
// @ts-ignore
app.post(
  '/api/contacts/check-duplicates',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  checkDuplicatesHandler
);
// @ts-ignore
app.get(
  '/api/contacts/recommendations/all',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  getContactRecommendationsHandler
);
// @ts-ignore
app.put(
  '/api/contacts/bulk/update',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['update:contacts']) as any),
  bulkUpdateContactsHandler
);
// @ts-ignore
app.get(
  '/api/contacts/analytics/dashboard',
  authMiddleware as any,
  tenantMiddleware as any,
  (rbacMiddleware(['read:contacts']) as any),
  getContactAnalyticsHandler
);

/**
 * @swagger
 * /api/pipelines:
 *   get:
 *     summary: List all pipelines in the workspace
 *     tags: [Pipelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: List of pipelines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pipeline'
 * 
 * /api/transactions:
 *   get:
 *     summary: List all transactions in the workspace
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 * 
 * /api/inventory:
 *   get:
 *     summary: List all properties in the workspace
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *   post:
 *     summary: Create a new property
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 */
// @ts-ignore
app.get('/api/pipelines', authMiddleware, tenantMiddleware, rbacMiddleware(['read:pipelines']), getPipelinesHandler);
// @ts-ignore
app.get('/api/transactions', authMiddleware, tenantMiddleware, rbacMiddleware(['read:transactions']), getTransactionsHandler);
// @ts-ignore
app.get('/api/transactions/:transactionId', authMiddleware, tenantMiddleware, rbacMiddleware(['read:transactions']), getTransactionHandler);
// @ts-ignore
app.post('/api/transactions', authMiddleware, tenantMiddleware, rbacMiddleware(['create:transactions']), createTransactionHandler);
// @ts-ignore
app.put('/api/transactions/:transactionId', authMiddleware, tenantMiddleware, rbacMiddleware(['update:transactions']), updateTransactionHandler);
// @ts-ignore
app.delete('/api/transactions/:transactionId', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:transactions']), deleteTransactionHandler);

// Resources routes
app.use('/api/resources', resourceController);

// 🏠 Commercial Property Data Routes (Modern Commercial API Integration)
import { 
  getPropertyByAddress,
  searchProperties,
  getProperties,
  getAnalytics as getPropertyAnalytics,
  bulkImport as bulkImportProperties,
  getLeads,
  getProviderStatus,
  refreshPropertyData
} from './features/government-data/commercial-controller';

/**
 * @swagger
 * /api/property-data:
 *   get:
 *     summary: Get property data from commercial providers
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: address
 *         in: query
 *         description: Property address to search
 *         required: true
 *         schema:
 *           type: string
 *       - name: providers
 *         in: query
 *         description: Comma-separated list of providers to use
 *         schema:
 *           type: string
 *           example: "ATTOM,REGRID"
 *     responses:
 *       200:
 *         description: Property data with lead scoring
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommercialPropertyRecord'
 *                 leadScore:
 *                   type: number
 *                 isPotentialLead:
 *                   type: boolean
 *                 estimatedEquity:
 *                   type: number
 */
// @ts-ignore
app.get('/api/property-data/search', authMiddleware, tenantMiddleware, commercialPropertyController.getPropertyByAddress);

/**
 * @swagger
 * /api/property-data/properties:
 *   get:
 *     summary: Get all properties with advanced filtering
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: county
 *         in: query
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
 *         schema:
 *           type: string
 *       - name: propertyType
 *         in: query
 *         schema:
 *           type: string
 *       - name: delinquentTaxes
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: providers
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties with pagination and quality metrics
 */
// @ts-ignore
app.get('/api/property-data/properties', authMiddleware, tenantMiddleware, commercialPropertyController.getProperties);

/**
 * @swagger
 * /api/property-data/advanced-search:
 *   post:
 *     summary: Advanced property search with multiple criteria
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertySearchFilters'
 *     responses:
 *       200:
 *         description: Advanced search results
 */
// @ts-ignore
app.post('/api/property-data/advanced-search', authMiddleware, tenantMiddleware, commercialPropertyController.searchProperties);

/**
 * @swagger
 * /api/property-data/leads:
 *   get:
 *     summary: Get potential leads from property data
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: minScore
 *         in: query
 *         schema:
 *           type: number
 *           default: 50
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *           default: 100
 *     responses:
 *       200:
 *         description: List of potential leads with scoring and motivation factors
 */
// @ts-ignore
app.get('/api/property-data/leads', authMiddleware, tenantMiddleware, commercialPropertyController.getLeads);

/**
 * @swagger
 * /api/property-data/analytics:
 *   get:
 *     summary: Get property data analytics and insights
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comprehensive analytics including provider performance, cost analysis, and data quality metrics
 */
// @ts-ignore
app.get('/api/property-data/analytics', authMiddleware, tenantMiddleware, commercialPropertyController.getAnalytics);

/**
 * @swagger
 * /api/property-data/providers/status:
 *   get:
 *     summary: Get status and performance of all data providers
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider status, performance metrics, and cost analysis
 */
// @ts-ignore
app.get('/api/property-data/providers/status', authMiddleware, tenantMiddleware, commercialPropertyController.getProviderStatus);

/**
 * @swagger
 * /api/property-data/bulk-import:
 *   post:
 *     summary: Bulk import properties from commercial providers
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkPropertyImportRequest'
 *     responses:
 *       200:
 *         description: Bulk import results
 */
// @ts-ignore
app.post('/api/property-data/bulk-import', authMiddleware, tenantMiddleware, commercialPropertyController.bulkImport);

/**
 * @swagger
 * /api/property-data/properties/{propertyId}/refresh:
 *   post:
 *     summary: Refresh property data from providers
 *     tags: [Property Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: propertyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: providers
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refresh operation status
 */
// @ts-ignore
app.post('/api/property-data/properties/:propertyId/refresh', authMiddleware, tenantMiddleware, commercialPropertyController.refreshPropertyData);

// Legacy government data routes for backward compatibility
// @ts-ignore
app.get('/api/government-data/county-records', authMiddleware, tenantMiddleware, rbacMiddleware(['read:government-data']), getProperties);
// @ts-ignore
app.get('/api/government-data/analytics', authMiddleware, tenantMiddleware, rbacMiddleware(['read:government-data']), getPropertyAnalytics);
// @ts-ignore
app.post('/api/government-data/search', authMiddleware, tenantMiddleware, rbacMiddleware(['read:government-data']), getPropertyByAddress);

// Inventory routes
// @ts-ignore
app.get('/api/inventory', authMiddleware, tenantMiddleware, rbacMiddleware(['read:inventory']), getInventoryHandler);
// @ts-ignore
app.get('/api/inventory/:propertyId', authMiddleware, tenantMiddleware, rbacMiddleware(['read:inventory']), getPropertyHandler);
// @ts-ignore
app.post('/api/inventory', authMiddleware, tenantMiddleware, rbacMiddleware(['create:inventory']), createPropertyHandler);
// @ts-ignore
app.put('/api/inventory/:propertyId', authMiddleware, tenantMiddleware, rbacMiddleware(['update:inventory']), updatePropertyHandler);
// @ts-ignore
app.delete('/api/inventory/:propertyId', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:inventory']), deletePropertyHandler);
// 📅 Calendar & Scheduling Routes
app.get('/api/calendar/appointments', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getAppointmentsHandler);
app.get('/api/calendar/appointments/:id', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getAppointmentHandler);
app.post('/api/calendar/appointments', authMiddleware, tenantMiddleware, rbacMiddleware(['create:calendar']), calendarController.createAppointmentHandler);
app.put('/api/calendar/appointments/:id', authMiddleware, tenantMiddleware, rbacMiddleware(['update:calendar']), calendarController.updateAppointmentHandler);
app.delete('/api/calendar/appointments/:id', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:calendar']), calendarController.deleteAppointmentHandler);
app.get('/api/calendar/availability/:userId', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getUserAvailabilityHandler);
app.post('/api/calendar/availability', authMiddleware, tenantMiddleware, rbacMiddleware(['create:calendar']), calendarController.setAvailabilityHandler);
app.get('/api/calendar/slots', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getAvailableSlotsHandler);
app.post('/api/calendar/smart-schedule', authMiddleware, tenantMiddleware, rbacMiddleware(['create:calendar']), calendarController.smartScheduleHandler);
app.get('/api/calendar/agenda/:userId', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getDailyAgendaHandler);
app.post('/api/calendar/reminders/send', authMiddleware, tenantMiddleware, rbacMiddleware(['create:calendar']), calendarController.sendRemindersHandler);
app.get('/api/calendar/analytics', authMiddleware, tenantMiddleware, rbacMiddleware(['read:calendar']), calendarController.getCalendarAnalyticsHandler);

// 🤖 AI Lead Scoring Routes - Temporarily disabled
// @ts-ignore
// app.get('/api/ai/lead-scores', authMiddleware, aiController.getLeadScores as any);
// @ts-ignore
// app.get('/api/ai/lead-scores/analytics', authMiddleware, aiController.getLeadScoreAnalytics as any);
// @ts-ignore
// app.get('/api/ai/lead-scores/:contactId', authMiddleware, aiController.getLeadScore as any);
// @ts-ignore
// app.post('/api/ai/lead-scores/:contactId/compute', authMiddleware, aiController.computeLeadScore as any);
// @ts-ignore
// app.post('/api/ai/lead-scores/refresh-all', authMiddleware, aiController.refreshAllLeadScores as any);
// @ts-ignore
// app.get('/api/ai/recommendations/:contactId', authMiddleware, aiController.getContactRecommendations as any);
// @ts-ignore
// app.post('/api/ai/batch-score', authMiddleware, aiController.batchComputeScores as any);

// 🔗 Webhook Routes (using webhook router instead)
// @ts-ignore
// app.post('/api/webhooks', authMiddleware, tenantMiddleware, rbacMiddleware(['create:webhooks']), registerWebhookHandler as any);
// @ts-ignore
// app.get('/api/webhooks', authMiddleware, tenantMiddleware, rbacMiddleware(['read:webhooks']), getWebhooksHandler as any);
// @ts-ignore
// app.put('/api/webhooks/:webhookId', authMiddleware, tenantMiddleware, rbacMiddleware(['update:webhooks']), updateWebhookHandler as any);
// @ts-ignore
// app.delete('/api/webhooks/:webhookId', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:webhooks']), deleteWebhookHandler as any);
// @ts-ignore
// app.post('/api/webhooks/:webhookId/test', authMiddleware, tenantMiddleware, rbacMiddleware(['test:webhooks']), testWebhookHandler as any);
// @ts-ignore
// app.get('/api/webhooks/:webhookId/logs', authMiddleware, tenantMiddleware, rbacMiddleware(['read:webhooks']), getWebhookLogsHandler as any);
// @ts-ignore
// app.get('/api/webhooks/stats', authMiddleware, tenantMiddleware, rbacMiddleware(['read:webhooks']), getWebhookStatsHandler as any);

// ================================
// Settings Routes
// ================================

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: User preferences, workspace settings, integrations, and notifications
 */

// User Preferences Routes
/**
 * @swagger
 * /api/settings/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
app.get('/api/settings/preferences', authMiddleware, getUserPreferences);

/**
 * @swagger
 * /api/settings/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               notifications:
 *                 type: object
 *               dashboard:
 *                 type: object
 *               privacy:
 *                 type: object
 *               accessibility:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
app.put('/api/settings/preferences', authMiddleware, updateUserPreferences);

/**
 * @swagger
 * /api/settings/preferences/reset:
 *   post:
 *     summary: Reset user preferences to defaults
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset successfully
 */
app.post('/api/settings/preferences/reset', authMiddleware, resetUserPreferences);

// Workspace Settings Routes
/**
 * @swagger
 * /api/settings/workspace:
 *   get:
 *     summary: Get workspace settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspace settings retrieved successfully
 */
app.get('/api/settings/workspace', authMiddleware, tenantMiddleware, rbacMiddleware(['read:settings']), getWorkspaceSettings);

/**
 * @swagger
 * /api/settings/workspace:
 *   put:
 *     summary: Update workspace settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branding:
 *                 type: object
 *               features:
 *                 type: object
 *               security:
 *                 type: object
 *               integrations:
 *                 type: object
 *     responses:
 *       200:
 *         description: Workspace settings updated successfully
 */
app.put('/api/settings/workspace', authMiddleware, tenantMiddleware, rbacMiddleware(['update:settings']), updateWorkspaceSettings);

// Integrations Routes
/**
 * @swagger
 * /api/settings/integrations:
 *   get:
 *     summary: Get all integrations
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integrations retrieved successfully
 */
app.get('/api/settings/integrations', authMiddleware, tenantMiddleware, rbacMiddleware(['read:integrations']), getIntegrations);

/**
 * @swagger
 * /api/settings/integrations:
 *   post:
 *     summary: Create new integration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - provider
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               provider:
 *                 type: string
 *               settings:
 *                 type: object
 *               apiKeys:
 *                 type: object
 *     responses:
 *       201:
 *         description: Integration created successfully
 */
app.post('/api/settings/integrations', authMiddleware, tenantMiddleware, rbacMiddleware(['create:integrations']), createIntegration);

/**
 * @swagger
 * /api/settings/integrations/{integrationId}:
 *   put:
 *     summary: Update integration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration updated successfully
 */
app.put('/api/settings/integrations/:integrationId', authMiddleware, tenantMiddleware, rbacMiddleware(['update:integrations']), updateIntegration);

/**
 * @swagger
 * /api/settings/integrations/{integrationId}:
 *   delete:
 *     summary: Delete integration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration deleted successfully
 */
app.delete('/api/settings/integrations/:integrationId', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:integrations']), deleteIntegration);

/**
 * @swagger
 * /api/settings/integrations/{integrationId}/test:
 *   post:
 *     summary: Test integration connection
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration test completed
 */
app.post('/api/settings/integrations/:integrationId/test', authMiddleware, tenantMiddleware, rbacMiddleware(['test:integrations']), testIntegration);

// API Keys Routes
/**
 * @swagger
 * /api/settings/api-keys:
 *   get:
 *     summary: Get API keys
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 */
app.get('/api/settings/api-keys', authMiddleware, tenantMiddleware, rbacMiddleware(['read:api-keys']), getApiKeys);

/**
 * @swagger
 * /api/settings/api-keys:
 *   post:
 *     summary: Create new API key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: API key created successfully
 */
app.post('/api/settings/api-keys', authMiddleware, tenantMiddleware, rbacMiddleware(['create:api-keys']), createApiKey);

/**
 * @swagger
 * /api/settings/api-keys/{keyId}:
 *   delete:
 *     summary: Delete API key
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key deleted successfully
 */
app.delete('/api/settings/api-keys/:keyId', authMiddleware, tenantMiddleware, rbacMiddleware(['delete:api-keys']), deleteApiKey);

// Notification Settings Routes
/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 */
app.get('/api/settings/notifications', authMiddleware, getNotificationSettings);

/**
 * @swagger
 * /api/settings/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *               push:
 *                 type: object
 *               sms:
 *                 type: object
 *               inApp:
 *                 type: object
 *               quietHours:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 */
app.put('/api/settings/notifications', authMiddleware, updateNotificationSettings);

/**
 * @swagger
 * /api/settings/notifications/test:
 *   post:
 *     summary: Test notification delivery
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, push, sms, inApp]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 */
app.post('/api/settings/notifications/test', authMiddleware, testNotification);

/**
 * @swagger
 * /api/settings/notifications/unsubscribe:
 *   post:
 *     summary: Unsubscribe from notification type
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, push, sms, inApp]
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
app.post('/api/settings/notifications/unsubscribe', authMiddleware, unsubscribeFromNotifications);

/**
 * @swagger
 * /api/settings/notifications/digest:
 *   get:
 *     summary: Get notification digest settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification digest settings retrieved successfully
 */
app.get('/api/settings/notifications/digest', authMiddleware, getNotificationDigest);

// OAuth Test Route
app.get('/oauth-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>OAuth Test - Open House CRM</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 40px; background: #f5f5f5; 
          }
          .container { 
            max-width: 800px; margin: 0 auto; background: white; 
            padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 { color: #333; margin-bottom: 30px; }
          .oauth-btn { 
            display: inline-block; padding: 12px 24px; margin: 10px 10px 10px 0;
            background: #4285f4; color: white; text-decoration: none; 
            border-radius: 6px; font-weight: 500; transition: all 0.2s;
          }
          .oauth-btn:hover { background: #3367d6; transform: translateY(-1px); }
          .oauth-btn.linkedin { background: #0077b5; }
          .oauth-btn.linkedin:hover { background: #005885; }
          .status { 
            background: #e8f5e8; padding: 15px; border-radius: 6px; 
            margin: 20px 0; border-left: 4px solid #4caf50; 
          }
          .endpoints { 
            background: #f8f9fa; padding: 20px; border-radius: 6px; 
            margin-top: 30px; 
          }
          .endpoints ul { margin: 0; }
          .endpoints li { margin: 8px 0; }
          .endpoints a { color: #1976d2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1
          
          <div class="status">
            <strong>✅ Google OAuth Configured:</strong> 
            Ready for Gmail integration testing
          </div>
          
          <p><strong>Test OAuth Authentication:</strong></p>
          <a href="/auth/google" class="oauth-btn">🔑 Login with Google</a>
          <a href="/auth/linkedin" class="oauth-btn linkedin">💼 Login with LinkedIn</a>
          
          <div class="endpoints">
            <h3>📡 Available API Endpoints:</h3>
            <ul>
              <li><a href="/health">🏥 Health Check</a></li>
              <li><a href="/api-docs">📚 API Documentation (Swagger)</a></li>
              <li><a href="/api/contacts">👥 Contacts API</a> (requires auth)</li>
              <li><a href="/api/transactions">💼 Transactions API</a> (requires auth)</li>
              <li><a href="/api/calendar">📅 Calendar API</a> (requires auth)</li>
            </ul>
          </div>
          
          <div class="endpoints">
            <h3>🔗 OAuth Endpoints:</h3>
            <ul>
              <li><code>GET /auth/google</code> - Google OAuth initiation</li>
              <li><code>GET /auth/google/callback</code> - Google OAuth callback</li>
              <li><code>GET /auth/linkedin</code> - LinkedIn OAuth initiation</li>
              <li><code>GET /auth/linkedin/callback</code> - LinkedIn OAuth callback</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Success page after OAuth
app.get('/auth/success', (req, res) => {
  if (!req.user) {
    return res.redirect('/oauth-test?error=no_user');
  }

  const user = req.user as any;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>🎉 OAuth Success - Open House CRM</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 40px; background: #f5f5f5; 
          }
          .container { 
            max-width: 700px; margin: 0 auto; background: white; 
            padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .success { 
            background: #e8f5e8; padding: 20px; border-radius: 8px; 
            margin: 20px 0; border-left: 4px solid #4caf50; 
          }
          .user-info { 
            background: #f8f9fa; padding: 20px; border-radius: 8px; 
            margin: 20px 0; 
          }
          .test-btn {
            display: inline-block; padding: 12px 24px; margin: 10px 10px 10px 0;
            background: #4285f4; color: white; text-decoration: none; 
            border-radius: 6px; font-weight: 500; transition: all 0.2s;
          }
          .test-btn:hover { background: #3367d6; }
          .test-btn.gmail { background: #ea4335; }
          .test-btn.gmail:hover { background: #d33b2c; }
          .test-btn.success { background: #34a853; }
          .test-btn.success:hover { background: #2e7d32; }
          .code { 
            background: #f5f5f5; padding: 10px; border-radius: 4px; 
            font-family: 'Courier New', monospace; font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Google OAuth Successfully Connected!</h1>
          
          <div class="success">
            <strong>✅ Authentication Complete:</strong><br/>
            Gmail API access has been granted to Open House CRM!
          </div>
          
          <div class="user-info">
            <h3>👤 Authenticated User Details:</h3>
            <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Google ID:</strong> ${user.googleId || 'N/A'}</p>
            <p><strong>Workspace:</strong> ${user.workspaceId || 'N/A'}</p>
            <p><strong>Access Token:</strong> ${user.googleAccessToken ? '✅ Available for Gmail API' : '❌ Missing'}</p>
            <p><strong>Refresh Token:</strong> ${user.googleRefreshToken ? '✅ Available' : '❌ Missing'}</p>
          </div>
          
          <h3>🧪 Test Gmail Integration:</h3>
          <p>Now that you're authenticated, test the Gmail API features:</p>
          
          <a href="/api/email/test" class="test-btn gmail">📧 Send Test Email</a>
          <a href="/api/email/inbox" class="test-btn success">📥 View Gmail Inbox</a>
          <a href="/oauth-test" class="test-btn">🔄 Back to OAuth Test</a>
          
          <div class="user-info">
            <h3>📋 Next Steps:</h3>
            <ul>
              <li><strong>Send Test Email:</strong> Click "Send Test Email" to send a welcome email to yourself</li>
              <li><strong>View Inbox:</strong> Click "View Gmail Inbox" to see your recent emails</li>
              <li><strong>CRM Integration:</strong> Gmail is now connected to your CRM for client communications</li>
              <li><strong>Real Estate Templates:</strong> Use professional email templates for client outreach</li>
            </ul>
          </div>
          
          <div class="code">
            <strong>🔧 Developer Info:</strong><br/>
            Session Active: ✅ Yes<br/>
            OAuth Provider: Google<br/>
            API Endpoint: http://localhost:3001<br/>
            User ID: ${user.id}<br/>
          </div>
        </div>
      </body>
    </html>
  `);
});

// LinkedIn OAuth placeholder (can be implemented later)
app.get('/auth/linkedin', (req, res) => {
  res.json({ 
    message: 'LinkedIn OAuth not yet implemented',
    status: 'coming_soon',
    note: 'Google OAuth is fully functional for Gmail integration'
  });
});

app.get('/auth/linkedin/callback', (req, res) => {
  res.json({ 
    message: 'LinkedIn OAuth callback not yet implemented',
    status: 'coming_soon'
  });
});

// Gmail API endpoints
app.post('/api/email/send', async (req, res) => {
  if (!req.user || !(req.user as any).googleAccessToken) {
    return res.status(401).json({ error: 'Google authentication required' });
  }

  try {
    const { GmailService } = await import('./services/gmail');
    const gmailService = new GmailService(
      googleConfig?.web?.client_id || '',
      googleConfig?.web?.client_secret || '',
      '/auth/google/callback'
    );

    const user = req.user as any;
    const { to, subject, body, isHtml } = req.body;

    const result = await gmailService.sendEmail(user, { to, subject, body, isHtml });
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.id 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/api/email/inbox', async (req, res) => {
  if (!req.user || !(req.user as any).googleAccessToken) {
    return res.status(401).json({ error: 'Google authentication required' });
  }

  try {
    const { GmailService } = await import('./services/gmail');
    const gmailService = new GmailService(
      googleConfig?.web?.client_id || '',
      googleConfig?.web?.client_secret || '',
      '/auth/google/callback'
    );

    const user = req.user as any;
    const maxResults = parseInt(req.query.maxResults as string) || 10;

    const messages = await gmailService.getInboxMessages(user, maxResults);
    
    res.json({ 
      success: true, 
      messages: messages 
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

app.get('/api/email/test', async (req, res) => {
  if (!req.user || !(req.user as any).googleAccessToken) {
    return res.status(401).json({ error: 'Google authentication required' });
  }

  try {
    const { GmailService, EmailTemplates } = await import('./services/gmail');
    const gmailService = new GmailService(
      googleConfig?.web?.client_id || '',
      googleConfig?.web?.client_secret || '',
      '/auth/google/callback'
    );

    const user = req.user as any;
    const testEmail = EmailTemplates.welcome('Test Client', 'Demo Agent');
    
    const result = await gmailService.sendEmail(user, {
      to: user.email,
      subject: testEmail.subject,
      body: testEmail.body,
      isHtml: testEmail.isHtml
    });
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully to ' + user.email,
      messageId: result.id 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API Base URL: http://localhost:${PORT}`);
    console.log(`� API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`�🔐 Auth URLs:`);
    console.log(`   - Login: http://localhost:${PORT}/auth/login`);
    console.log(`   - Google OAuth: http://localhost:${PORT}/auth/google`);
    console.log(`   - LinkedIn OAuth: http://localhost:${PORT}/auth/linkedin`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});

 
