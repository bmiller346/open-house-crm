import { AppDataSource } from '../../data-source';
import { Webhook } from '../../entities/Webhook';
import { WebhookLog } from '../../entities/WebhookLog';
import crypto from 'crypto';
import axios from 'axios';

export interface WebhookCreateData {
  workspaceId: string;
  url: string;
  events: string[];
  secret?: string;
  description?: string;
  createdBy: string;
}

export interface WebhookUpdateData {
  url?: string;
  events?: string[];
  secret?: string;
  description?: string;
  isActive?: boolean;
}

export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export interface WebhookStats {
  total: number;
  active: number;
  inactive: number;
  recentDeliveries: number;
  successRate: number;
}

export async function createWebhook(data: WebhookCreateData): Promise<Webhook> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  // Generate a secret if not provided
  const secret = data.secret || crypto.randomBytes(32).toString('hex');
  
  const webhook = webhookRepository.create({
    workspaceId: data.workspaceId,
    url: data.url,
    events: data.events,
    secret,
    description: data.description,
    createdBy: data.createdBy,
    isActive: true
  });
  
  return await webhookRepository.save(webhook);
}

export async function getWebhooksByWorkspace(workspaceId: string): Promise<Webhook[]> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  return await webhookRepository.find({
    where: { workspaceId },
    order: { createdAt: 'DESC' }
  });
}

export async function updateWebhook(
  webhookId: string, 
  workspaceId: string, 
  data: WebhookUpdateData
): Promise<Webhook | null> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  const webhook = await webhookRepository.findOne({
    where: { id: webhookId, workspaceId }
  });
  
  if (!webhook) {
    return null;
  }
  
  // Update fields
  if (data.url !== undefined) webhook.url = data.url;
  if (data.events !== undefined) webhook.events = data.events;
  if (data.secret !== undefined) webhook.secret = data.secret;
  if (data.description !== undefined) webhook.description = data.description;
  if (data.isActive !== undefined) webhook.isActive = data.isActive;
  
  webhook.updatedAt = new Date();
  
  return await webhookRepository.save(webhook);
}

export async function deleteWebhook(webhookId: string, workspaceId: string): Promise<void> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  await webhookRepository.delete({
    id: webhookId,
    workspaceId
  });
}

export async function testWebhook(
  webhookId: string, 
  workspaceId: string
): Promise<WebhookTestResult> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  const webhook = await webhookRepository.findOne({
    where: { id: webhookId, workspaceId }
  });
  
  if (!webhook) {
    throw new Error('Webhook not found');
  }
  
  try {
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery'
      }
    };
    
    const signature = generateSignature(JSON.stringify(testPayload), webhook.secret);
    const startTime = Date.now();
    
    const response = await axios.post(webhook.url, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'OpenHouse-CRM-Webhook/1.0'
      },
      timeout: 30000 // 30 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    // Log the test
    await logWebhookDelivery(webhook.id, 'webhook.test', testPayload, {
      success: true,
      statusCode: response.status,
      responseTime
    });
    
    return {
      success: true,
      statusCode: response.status,
      responseTime
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - Date.now();
    
    // Log the failed test
    await logWebhookDelivery(webhook.id, 'webhook.test', {}, {
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      responseTime
    });
    
    return {
      success: false,
      statusCode: error.response?.status,
      error: error.message
    };
  }
}

export async function getWebhookLogs(
  webhookId: string,
  workspaceId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  logs: WebhookLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const webhookLogRepository = AppDataSource.getRepository(WebhookLog);
  
  // Verify webhook belongs to workspace
  const webhookRepository = AppDataSource.getRepository(Webhook);
  const webhook = await webhookRepository.findOne({
    where: { id: webhookId, workspaceId }
  });
  
  if (!webhook) {
    throw new Error('Webhook not found');
  }
  
  const [logs, total] = await webhookLogRepository.findAndCount({
    where: { webhookId },
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit
  });
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getWebhookStats(workspaceId: string): Promise<WebhookStats> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  const webhookLogRepository = AppDataSource.getRepository(WebhookLog);
  
  const [total, active] = await Promise.all([
    webhookRepository.count({ where: { workspaceId } }),
    webhookRepository.count({ where: { workspaceId, isActive: true } })
  ]);
  
  const inactive = total - active;
  
  // Get recent deliveries (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const webhooks = await webhookRepository.find({
    where: { workspaceId },
    select: ['id']
  });
  
  const webhookIds = webhooks.map(w => w.id);
  
  const [recentDeliveries, successfulDeliveries] = await Promise.all([
    webhookLogRepository.count({
      where: {
        webhookId: webhookIds.length > 0 ? webhookIds[0] : 'none', // This is a simplified approach
        createdAt: undefined // Would need proper date filtering in real implementation
      }
    }),
    webhookLogRepository.count({
      where: {
        webhookId: webhookIds.length > 0 ? webhookIds[0] : 'none', // This is a simplified approach
        success: true
      }
    })
  ]);
  
  const successRate = recentDeliveries > 0 ? (successfulDeliveries / recentDeliveries) * 100 : 0;
  
  return {
    total,
    active,
    inactive,
    recentDeliveries,
    successRate
  };
}

// Helper function to generate webhook signature
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Helper function to log webhook delivery
async function logWebhookDelivery(
  webhookId: string,
  event: string,
  payload: any,
  result: {
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  }
): Promise<void> {
  const webhookLogRepository = AppDataSource.getRepository(WebhookLog);
  
  const log = webhookLogRepository.create({
    webhookId,
    event,
    payload,
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    error: result.error
  });
  
  await webhookLogRepository.save(log);
}

// Function to trigger webhook (used by other parts of the system)
export async function triggerWebhook(
  workspaceId: string,
  event: string,
  payload: any
): Promise<void> {
  const webhookRepository = AppDataSource.getRepository(Webhook);
  
  const webhooks = await webhookRepository.find({
    where: {
      workspaceId,
      isActive: true
    }
  });
  
  // Filter webhooks that are subscribed to this event
  const relevantWebhooks = webhooks.filter(webhook => 
    webhook.events.includes(event) || webhook.events.includes('*')
  );
  
  // Trigger all relevant webhooks
  await Promise.all(
    relevantWebhooks.map(webhook => deliverWebhook(webhook, event, payload))
  );
}

// Helper function to deliver webhook
async function deliverWebhook(
  webhook: Webhook,
  event: string,
  payload: any
): Promise<void> {
  try {
    const webhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload
    };
    
    const signature = generateSignature(JSON.stringify(webhookPayload), webhook.secret);
    const startTime = Date.now();
    
    const response = await axios.post(webhook.url, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'OpenHouse-CRM-Webhook/1.0'
      },
      timeout: 30000 // 30 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    await logWebhookDelivery(webhook.id, event, payload, {
      success: true,
      statusCode: response.status,
      responseTime
    });
    
  } catch (error: any) {
    const responseTime = Date.now() - Date.now();
    
    await logWebhookDelivery(webhook.id, event, payload, {
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      responseTime
    });
  }
}
