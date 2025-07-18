import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Webhook } from '../entities/Webhook';
import { WebhookLog } from '../entities/WebhookLog';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateWebhookConfig, validateWebhookUpdate } from '../validators/webhook';
import { EnhancedWebhookService } from '../services/EnhancedWebhookService';
import { WEBHOOK_EVENTS } from '../../../../packages/core/src/types';
import { In } from 'typeorm';

const router = Router();
const webhookService = new EnhancedWebhookService();

// Apply authentication middleware to all webhook routes
router.use(authMiddleware);

/**
 * @route   POST /api/webhooks
 * @desc    Register a new webhook
 * @access  Private
 */
router.post('/', validateWebhookConfig, async (req, res) => {
  try {
    const { url, events, secret, description, isActive = true } = req.body;
    const { user } = req;

    // Validate webhook URL accessibility
    const isValidUrl = await webhookService.validateWebhookUrl(url);
    if (!isValidUrl) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is not accessible or invalid'
      });
    }

    // Create webhook
    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = webhookRepository.create({
      workspaceId: user.workspaceId,
      url,
      events,
      secret: secret || webhookService.generateSecret(),
      description,
      isActive,
      createdBy: user.id
    });

    const savedWebhook = await webhookRepository.save(webhook);

    // Send verification challenge if configured
    if (secret) {
      await webhookService.sendVerificationChallenge(savedWebhook);
    }

    res.status(201).json({
      success: true,
      data: {
        id: savedWebhook.id,
        url: savedWebhook.url,
        events: savedWebhook.events,
        description: savedWebhook.description,
        isActive: savedWebhook.isActive,
        createdAt: savedWebhook.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhooks
 * @desc    List all webhooks for workspace
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 20 } = req.query;

    const webhookRepository = AppDataSource.getRepository(Webhook);
    const [webhooks, total] = await webhookRepository.findAndCount({
      where: { workspaceId: user.workspaceId },
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Get delivery stats for each webhook
    const webhooksWithStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const stats = await webhookService.getWebhookStats(webhook.id);
        return {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          description: webhook.description,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
          stats
        };
      })
    );

    res.json({
      success: true,
      data: webhooksWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhooks/:id
 * @desc    Get specific webhook details
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = await webhookRepository.findOne({
      where: { id, workspaceId: user.workspaceId }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    const stats = await webhookService.getWebhookStats(webhook.id);

    res.json({
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        description: webhook.description,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PATCH /api/webhooks/:id
 * @desc    Update a webhook
 * @access  Private
 */
router.patch('/:id', validateWebhookUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updates = req.body;

    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = await webhookRepository.findOne({
      where: { id, workspaceId: user.workspaceId }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    // Validate URL if it's being updated
    if (updates.url && updates.url !== webhook.url) {
      const isValidUrl = await webhookService.validateWebhookUrl(updates.url);
      if (!isValidUrl) {
        return res.status(400).json({
          success: false,
          message: 'Webhook URL is not accessible or invalid'
        });
      }
    }

    // Update webhook
    Object.assign(webhook, updates);
    const updatedWebhook = await webhookRepository.save(webhook);

    res.json({
      success: true,
      data: {
        id: updatedWebhook.id,
        url: updatedWebhook.url,
        events: updatedWebhook.events,
        description: updatedWebhook.description,
        isActive: updatedWebhook.isActive,
        updatedAt: updatedWebhook.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/webhooks/:id
 * @desc    Delete a webhook
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = await webhookRepository.findOne({
      where: { id, workspaceId: user.workspaceId }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    await webhookRepository.remove(webhook);

    res.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhooks/logs
 * @desc    Get all webhook delivery logs for workspace
 * @access  Private
 */
router.get('/logs', async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 50 } = req.query;

    const logRepository = AppDataSource.getRepository(WebhookLog);
    const webhookRepository = AppDataSource.getRepository(Webhook);

    // Get all webhooks for the workspace first
    const webhooks = await webhookRepository.find({
      where: { workspaceId: user.workspaceId },
      select: ['id']
    });

    if (webhooks.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const webhookIds = webhooks.map(w => w.id);

    const [logs, total] = await logRepository.findAndCount({
      where: { webhookId: In(webhookIds) },
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhooks/:id/logs
 * @desc    Get webhook delivery logs
 * @access  Private
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { page = 1, limit = 50 } = req.query;

    // Verify webhook ownership
    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = await webhookRepository.findOne({
      where: { id, workspaceId: user.workspaceId }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    const logRepository = AppDataSource.getRepository(WebhookLog);
    const [logs, total] = await logRepository.findAndCount({
      where: { webhookId: id },
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/webhooks/:id/test
 * @desc    Test a webhook with sample data
 * @access  Private
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { eventType = 'webhook.test' } = req.body;

    // Verify webhook ownership
    const webhookRepository = AppDataSource.getRepository(Webhook);
    const webhook = await webhookRepository.findOne({
      where: { id, workspaceId: user.workspaceId }
    });

    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }

    // Send test event
    const testEvent = {
      id: `test_${Date.now()}`,
      type: eventType,
      workspaceId: user.workspaceId,
      data: {
        message: 'This is a test webhook event',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: 'openhousecrm'
    };

    const result = await webhookService.sendWebhookEvent(webhook, testEvent);

    res.json({
      success: true,
      data: {
        delivered: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        error: result.error
      }
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhooks/events
 * @desc    Get available webhook events
 * @access  Private
 */
router.get('/events', async (req, res) => {
  try {
    const events = Object.entries(WEBHOOK_EVENTS).map(([key, value]) => ({
      key,
      value,
      description: `Triggered when ${value.replace('.', ' is ')}`
    }));

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
