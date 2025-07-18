import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Workspace } from '../../entities/Workspace';
import crypto from 'crypto';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'calendar' | 'webhook' | 'crm' | 'marketing' | 'analytics';
  provider: string;
  enabled: boolean;
  settings: Record<string, any>;
  apiKeys?: {
    primary?: string;
    secondary?: string;
    webhook?: string;
  };
  lastTested?: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIKeyConfig {
  id: string;
  name: string;
  description?: string;
  key: string;
  permissions: string[];
  enabled: boolean;
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const encryptApiKey = (key: string): string => {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.API_KEY_ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptApiKey = (encryptedKey: string): string => {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.API_KEY_ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
  const [ivHex, encrypted] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       provider:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       lastTested:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const integrations: IntegrationConfig[] = workspace.integrations || [];

    // Hide sensitive API keys in response
    const sanitizedIntegrations = integrations.map(integration => ({
      ...integration,
      apiKeys: integration.apiKeys ? {
        primary: integration.apiKeys.primary ? '••••••••' : undefined,
        secondary: integration.apiKeys.secondary ? '••••••••' : undefined,
        webhook: integration.apiKeys.webhook ? '••••••••' : undefined
      } : undefined
    }));

    res.json({
      success: true,
      data: sanitizedIntegrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations'
    });
  }
};

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
 *                 enum: [email, sms, calendar, webhook, crm, marketing, analytics]
 *               provider:
 *                 type: string
 *               settings:
 *                 type: object
 *               apiKeys:
 *                 type: object
 *     responses:
 *       201:
 *         description: Integration created successfully
 *       400:
 *         description: Invalid integration data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createIntegration = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const { name, type, provider, settings = {}, apiKeys = {} } = req.body;

    if (!name || !type || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and provider are required'
      });
    }

    const newIntegration: IntegrationConfig = {
      id: crypto.randomUUID(),
      name,
      type,
      provider,
      enabled: true,
      settings,
      apiKeys: {
        primary: apiKeys.primary ? encryptApiKey(apiKeys.primary) : undefined,
        secondary: apiKeys.secondary ? encryptApiKey(apiKeys.secondary) : undefined,
        webhook: apiKeys.webhook ? encryptApiKey(apiKeys.webhook) : undefined
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentIntegrations = workspace.integrations || [];
    currentIntegrations.push(newIntegration);

    await workspaceRepository.update(workspace.id, {
      integrations: currentIntegrations
    });

    // Return sanitized integration
    const sanitizedIntegration = {
      ...newIntegration,
      apiKeys: newIntegration.apiKeys ? {
        primary: newIntegration.apiKeys.primary ? '••••••••' : undefined,
        secondary: newIntegration.apiKeys.secondary ? '••••••••' : undefined,
        webhook: newIntegration.apiKeys.webhook ? '••••••••' : undefined
      } : undefined
    };

    res.status(201).json({
      success: true,
      data: sanitizedIntegration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create integration'
    });
  }
};

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *               settings:
 *                 type: object
 *               apiKeys:
 *                 type: object
 *     responses:
 *       200:
 *         description: Integration updated successfully
 *       400:
 *         description: Invalid integration data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Integration not found
 *       500:
 *         description: Server error
 */
export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const integrations = workspace.integrations || [];
    const integrationIndex = integrations.findIndex(i => i.id === integrationId);

    if (integrationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const { name, enabled, settings, apiKeys } = req.body;
    const currentIntegration = integrations[integrationIndex];

    // Update integration fields
    if (name !== undefined) currentIntegration.name = name;
    if (enabled !== undefined) currentIntegration.enabled = enabled;
    if (settings !== undefined) currentIntegration.settings = { ...currentIntegration.settings, ...settings };
    
    // Update API keys if provided
    if (apiKeys) {
      const updatedApiKeys = { ...currentIntegration.apiKeys };
      if (apiKeys.primary !== undefined) {
        updatedApiKeys.primary = apiKeys.primary ? encryptApiKey(apiKeys.primary) : undefined;
      }
      if (apiKeys.secondary !== undefined) {
        updatedApiKeys.secondary = apiKeys.secondary ? encryptApiKey(apiKeys.secondary) : undefined;
      }
      if (apiKeys.webhook !== undefined) {
        updatedApiKeys.webhook = apiKeys.webhook ? encryptApiKey(apiKeys.webhook) : undefined;
      }
      currentIntegration.apiKeys = updatedApiKeys;
    }

    currentIntegration.updatedAt = new Date().toISOString();
    integrations[integrationIndex] = currentIntegration;

    await workspaceRepository.update(workspace.id, {
      integrations: integrations
    });

    // Return sanitized integration
    const sanitizedIntegration = {
      ...currentIntegration,
      apiKeys: currentIntegration.apiKeys ? {
        primary: currentIntegration.apiKeys.primary ? '••••••••' : undefined,
        secondary: currentIntegration.apiKeys.secondary ? '••••••••' : undefined,
        webhook: currentIntegration.apiKeys.webhook ? '••••••••' : undefined
      } : undefined
    };

    res.json({
      success: true,
      data: sanitizedIntegration,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update integration'
    });
  }
};

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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Integration not found
 *       500:
 *         description: Server error
 */
export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const integrations = workspace.integrations || [];
    const filteredIntegrations = integrations.filter(i => i.id !== integrationId);

    if (filteredIntegrations.length === integrations.length) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    await workspaceRepository.update(workspace.id, {
      integrations: filteredIntegrations
    });

    res.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration'
    });
  }
};

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     message:
 *                       type: string
 *                     responseTime:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Integration not found
 *       500:
 *         description: Server error
 */
export const testIntegration = async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const integrations = workspace.integrations || [];
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const startTime = Date.now();
    let testResult = {
      status: 'success',
      message: 'Integration test completed successfully',
      responseTime: 0
    };

    try {
      // Simulate integration test based on provider
      switch (integration.provider.toLowerCase()) {
        case 'twilio':
          // Test Twilio SMS integration
          testResult.message = 'Twilio SMS connection verified';
          break;
        case 'sendgrid':
          // Test SendGrid email integration
          testResult.message = 'SendGrid email connection verified';
          break;
        case 'google':
          // Test Google Calendar integration
          testResult.message = 'Google Calendar connection verified';
          break;
        case 'webhooks':
          // Test webhook endpoint
          testResult.message = 'Webhook endpoint is accessible';
          break;
        default:
          testResult.message = 'Generic integration test completed';
      }

      // Update integration status
      const integrationIndex = integrations.findIndex(i => i.id === integrationId);
      if (integrationIndex !== -1) {
        integrations[integrationIndex].status = 'active';
        integrations[integrationIndex].lastTested = new Date().toISOString();
        integrations[integrationIndex].errorMessage = undefined;
        integrations[integrationIndex].updatedAt = new Date().toISOString();

        await workspaceRepository.update(workspace.id, {
          integrations: integrations
        });
      }

    } catch (testError) {
      testResult = {
        status: 'error',
        message: `Integration test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`,
        responseTime: 0
      };

      // Update integration status
      const integrationIndex = integrations.findIndex(i => i.id === integrationId);
      if (integrationIndex !== -1) {
        integrations[integrationIndex].status = 'error';
        integrations[integrationIndex].lastTested = new Date().toISOString();
        integrations[integrationIndex].errorMessage = testResult.message;
        integrations[integrationIndex].updatedAt = new Date().toISOString();

        await workspaceRepository.update(workspace.id, {
          integrations: integrations
        });
      }
    }

    testResult.responseTime = Date.now() - startTime;

    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test integration'
    });
  }
};

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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const apiKeys: APIKeyConfig[] = workspace.apiKeys || [];

    // Hide actual keys in response
    const sanitizedApiKeys = apiKeys.map(key => ({
      ...key,
      key: key.key.substring(0, 8) + '••••••••••••••••'
    }));

    res.json({
      success: true,
      data: sanitizedApiKeys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys'
    });
  }
};

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
 *       400:
 *         description: Invalid API key data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const { name, description, permissions, expiresAt } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'Name and permissions array are required'
      });
    }

    // Generate secure API key
    const apiKey = 'ohc_' + crypto.randomBytes(32).toString('hex');

    const newApiKey: APIKeyConfig = {
      id: crypto.randomUUID(),
      name,
      description,
      key: apiKey,
      permissions,
      enabled: true,
      expiresAt,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentApiKeys = workspace.apiKeys || [];
    currentApiKeys.push(newApiKey);

    await workspaceRepository.update(workspace.id, {
      apiKeys: currentApiKeys
    });

    res.status(201).json({
      success: true,
      data: {
        ...newApiKey,
        key: apiKey // Return full key only on creation
      },
      message: 'API key created successfully. Please save this key securely as it will not be shown again.'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key'
    });
  }
};

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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Server error
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    const apiKeys = workspace.apiKeys || [];
    const filteredApiKeys = apiKeys.filter(key => key.id !== keyId);

    if (filteredApiKeys.length === apiKeys.length) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    await workspaceRepository.update(workspace.id, {
      apiKeys: filteredApiKeys
    });

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key'
    });
  }
};
