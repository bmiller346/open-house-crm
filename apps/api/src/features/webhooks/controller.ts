import { Request, Response } from 'express';
import { 
  createWebhook,
  getWebhooksByWorkspace,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookLogs,
  getWebhookStats
} from './service';

// Helper function to extract user data from request
function getUserData(req: Request) {
  const user = (req as any).user;
  if (!user) {
    throw new Error('User not found');
  }
  
  // Handle both demo user format and User entity
  const userId = user.userId || user.id;
  const workspaceId = user.workspaceId;
  
  return {
    userId,
    workspaceId
  };
}

export async function registerWebhookHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const { url, events, secret, description } = req.body;
    
    if (!url || !events || !events.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and events are required' 
      });
    }
    
    const webhook = await createWebhook({
      workspaceId,
      url,
      events,
      secret,
      description,
      createdBy: userId
    });
    
    res.status(201).json({ success: true, data: webhook });
  } catch (error: any) {
    console.error('Register webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to register webhook' });
  }
}

export async function getWebhooksHandler(req: Request, res: Response) {
  try {
    const { workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const webhooks = await getWebhooksByWorkspace(workspaceId);
    res.json({ success: true, data: webhooks });
  } catch (error: any) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch webhooks' });
  }
}

export async function updateWebhookHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { webhookId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const webhook = await updateWebhook(webhookId, workspaceId, req.body);
    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook not found' });
    }
    
    res.json({ success: true, data: webhook });
  } catch (error: any) {
    console.error('Update webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to update webhook' });
  }
}

export async function deleteWebhookHandler(req: Request, res: Response) {
  try {
    const { workspaceId } = getUserData(req);
    const { webhookId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    await deleteWebhook(webhookId, workspaceId);
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    console.error('Delete webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete webhook' });
  }
}

export async function testWebhookHandler(req: Request, res: Response) {
  try {
    const { workspaceId } = getUserData(req);
    const { webhookId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const result = await testWebhook(webhookId, workspaceId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to test webhook' });
  }
}

export async function getWebhookLogsHandler(req: Request, res: Response) {
  try {
    const { workspaceId } = getUserData(req);
    const { webhookId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const logs = await getWebhookLogs(
      webhookId, 
      workspaceId, 
      parseInt(page as string), 
      parseInt(limit as string)
    );
    
    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch webhook logs' });
  }
}

export async function getWebhookStatsHandler(req: Request, res: Response) {
  try {
    const { workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const stats = await getWebhookStats(workspaceId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Get webhook stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch webhook stats' });
  }
}
