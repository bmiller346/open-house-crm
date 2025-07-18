import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ApiKeyService } from '../services/ApiKeyService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const apiKeyService = new ApiKeyService();

// Apply authentication middleware to all API key routes
router.use(authMiddleware);

/**
 * @route   POST /api/api-keys
 * @desc    Create a new API key
 * @access  Private
 */
router.post('/', [
  body('name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('Permissions must be an array with at least one permission'),
  
  body('permissions.*')
    .isString()
    .matches(/^(read|write|delete):(contacts|transactions|properties|campaigns|pipelines|deals|appointments|users|webhooks|api-keys|\*)$/)
    .withMessage('Invalid permission format'),
  
  body('ipWhitelist')
    .optional()
    .isArray()
    .withMessage('IP whitelist must be an array'),
  
  body('ipWhitelist.*')
    .optional()
    .isIP()
    .withMessage('Invalid IP address format'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid ISO 8601 date'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { user } = req;
    const { name, description, permissions, ipWhitelist, expiresAt } = req.body;

    const result = await apiKeyService.createApiKey({
      workspaceId: user.workspaceId,
      name,
      description,
      permissions,
      ipWhitelist,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: user.id
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        description: result.apiKey.description,
        keyPrefix: result.apiKey.keyPrefix,
        permissions: result.apiKey.permissions,
        ipWhitelist: result.apiKey.ipWhitelist,
        expiresAt: result.apiKey.expiresAt,
        createdAt: result.apiKey.createdAt,
        plainKey: result.plainKey // Only returned on creation
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/api-keys
 * @desc    List all API keys for workspace
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { user } = req;
    const apiKeys = await apiKeyService.listApiKeys(user.workspaceId);

    // Get usage stats for each API key
    const apiKeysWithStats = await Promise.all(
      apiKeys.map(async (apiKey) => {
        const stats = await apiKeyService.getApiKeyStats(apiKey.id);
        return {
          id: apiKey.id,
          name: apiKey.name,
          description: apiKey.description,
          keyPrefix: apiKey.keyPrefix,
          permissions: apiKey.permissions,
          ipWhitelist: apiKey.ipWhitelist,
          isActive: apiKey.isActive,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
          updatedAt: apiKey.updatedAt,
          stats
        };
      })
    );

    res.json({
      success: true,
      data: apiKeysWithStats
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/api-keys/:id
 * @desc    Get specific API key details
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const apiKey = await apiKeyService.getApiKey(id, user.workspaceId);
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    const stats = await apiKeyService.getApiKeyStats(apiKey.id);

    res.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        keyPrefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        ipWhitelist: apiKey.ipWhitelist,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/api-keys/:id
 * @desc    Update API key
 * @access  Private
 */
router.put('/:id', [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('permissions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Permissions must be an array with at least one permission'),
  
  body('ipWhitelist')
    .optional()
    .isArray()
    .withMessage('IP whitelist must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid ISO 8601 date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { user } = req;
    const updates = {
      ...req.body,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      updatedBy: user.id
    };

    const apiKey = await apiKeyService.updateApiKey(id, user.workspaceId, updates);
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        keyPrefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        ipWhitelist: apiKey.ipWhitelist,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/api-keys/:id
 * @desc    Delete API key
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const success = await apiKeyService.deleteApiKey(id, user.workspaceId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/api-keys/:id/regenerate
 * @desc    Regenerate API key
 * @access  Private
 */
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const result = await apiKeyService.regenerateApiKey(id, user.workspaceId, user.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        keyPrefix: result.apiKey.keyPrefix,
        plainKey: result.plainKey, // Only returned on regeneration
        updatedAt: result.apiKey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/api-keys/permissions
 * @desc    Get available permissions
 * @access  Private
 */
router.get('/permissions', async (req, res) => {
  try {
    const permissions = [
      // Contact permissions
      'read:contacts',
      'write:contacts',
      'delete:contacts',
      
      // Transaction permissions
      'read:transactions',
      'write:transactions',
      'delete:transactions',
      
      // Property permissions
      'read:properties',
      'write:properties',
      'delete:properties',
      
      // Campaign permissions
      'read:campaigns',
      'write:campaigns',
      'delete:campaigns',
      
      // Pipeline permissions
      'read:pipelines',
      'write:pipelines',
      'delete:pipelines',
      
      // Deal permissions
      'read:deals',
      'write:deals',
      'delete:deals',
      
      // Appointment permissions
      'read:appointments',
      'write:appointments',
      'delete:appointments',
      
      // User permissions
      'read:users',
      'write:users',
      'delete:users',
      
      // Webhook permissions
      'read:webhooks',
      'write:webhooks',
      'delete:webhooks',
      
      // API key permissions
      'read:api-keys',
      'write:api-keys',
      'delete:api-keys',
      
      // Wildcard permissions
      'read:*',
      'write:*',
      'delete:*',
      '*'
    ];

    const permissionGroups = [
      {
        name: 'Contacts',
        permissions: permissions.filter(p => p.includes('contacts'))
      },
      {
        name: 'Transactions',
        permissions: permissions.filter(p => p.includes('transactions'))
      },
      {
        name: 'Properties',
        permissions: permissions.filter(p => p.includes('properties'))
      },
      {
        name: 'Campaigns',
        permissions: permissions.filter(p => p.includes('campaigns'))
      },
      {
        name: 'Pipelines',
        permissions: permissions.filter(p => p.includes('pipelines'))
      },
      {
        name: 'Deals',
        permissions: permissions.filter(p => p.includes('deals'))
      },
      {
        name: 'Appointments',
        permissions: permissions.filter(p => p.includes('appointments'))
      },
      {
        name: 'Users',
        permissions: permissions.filter(p => p.includes('users'))
      },
      {
        name: 'Webhooks',
        permissions: permissions.filter(p => p.includes('webhooks'))
      },
      {
        name: 'API Keys',
        permissions: permissions.filter(p => p.includes('api-keys'))
      },
      {
        name: 'Wildcard',
        permissions: permissions.filter(p => p.includes('*'))
      }
    ];

    res.json({
      success: true,
      data: {
        permissions,
        groups: permissionGroups
      }
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
