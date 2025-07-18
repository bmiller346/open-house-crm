import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Webhook } from '../entities/Webhook';
import { WebhookLog } from '../entities/WebhookLog';
import { WebhookEvent } from '../../../../packages/core/src/types';

interface WebhookDeliveryResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  attempt: number;
  error?: string;
}

export class EnhancedWebhookService {
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s
  private readonly timeoutMs = 30000; // 30 seconds
  private readonly maxFailedAttempts = 10;

  /**
   * Generate a secure secret for webhook signing
   */
  generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Validate webhook URL accessibility
   */
  async validateWebhookUrl(url: string): Promise<boolean> {
    try {
      // Check URL format
      const urlObj = new URL(url);
      
      // Enforce HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        return false;
      }

      // Prevent localhost/internal IP access in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') || 
            hostname.startsWith('10.') || 
            hostname.startsWith('172.')) {
          return false;
        }
      }

      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
        headers: {
          'User-Agent': 'OpenHouseCRM-Webhook/1.0'
        }
      });
      
      return true;
    } catch (error) {
      console.error('Webhook URL validation failed:', error);
      return false;
    }
  }

  /**
   * Send verification challenge to webhook URL
   */
  async sendVerificationChallenge(webhook: Webhook): Promise<boolean> {
    try {
      const challenge = crypto.randomBytes(16).toString('hex');
      const timestamp = new Date().toISOString();
      const payload = JSON.stringify({
        type: 'webhook.verification',
        challenge,
        timestamp,
        workspaceId: webhook.workspaceId
      });

      const signature = this.generateSignature(payload, webhook.secret);
      
      const response = await axios.post(webhook.url, JSON.parse(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-OpenHouse-Signature': `sha256=${signature}`,
          'X-OpenHouse-Event': 'webhook.verification',
          'X-OpenHouse-Delivery': `verify_${Date.now()}`,
          'User-Agent': 'OpenHouseCRM-Webhook/1.0'
        },
        timeout: this.timeoutMs
      });

      return response.status === 200 && response.data.challenge === challenge;
    } catch (error) {
      console.error('Verification challenge failed:', error);
      return false;
    }
  }

  /**
   * Send webhook event to a specific webhook
   */
  async sendWebhookEvent(webhook: Webhook, event: WebhookEvent): Promise<WebhookDeliveryResult> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        const timestamp = new Date().toISOString();
        const payload = JSON.stringify({
          id: event.id,
          type: event.type,
          workspaceId: event.workspaceId,
          data: event.data,
          timestamp,
          source: event.source,
          version: '1.0'
        });

        const signature = this.generateSignature(payload, webhook.secret);
        
        const response = await axios.post(webhook.url, JSON.parse(payload), {
          headers: {
            'Content-Type': 'application/json',
            'X-OpenHouse-Signature': `sha256=${signature}`,
            'X-OpenHouse-Event': event.type,
            'X-OpenHouse-Delivery': event.id,
            'X-OpenHouse-Timestamp': timestamp,
            'X-OpenHouse-Workspace': event.workspaceId,
            'User-Agent': 'OpenHouseCRM-Webhook/1.0'
          },
          timeout: this.timeoutMs
        });

        const responseTime = Date.now() - startTime;
        
        // Update webhook success stats
        await this.updateWebhookStats(webhook.id, true, responseTime);
        
        // Log successful delivery
        await this.logWebhookDelivery(webhook.id, event, {
          success: true,
          statusCode: response.status,
          responseTime,
          attempt: attempt + 1,
          response: JSON.stringify(response.data).slice(0, 1000)
        });

        return {
          success: true,
          statusCode: response.status,
          responseTime,
          attempt: attempt + 1
        };

      } catch (error) {
        attempt++;
        const responseTime = Date.now() - startTime;
        const isLastAttempt = attempt >= this.maxRetries;

        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as any)?.message || axiosError.message || 'Unknown error';
        const statusCode = axiosError.response?.status || 0;

        // Update webhook failure stats
        await this.updateWebhookStats(webhook.id, false, responseTime);

        // Log failed delivery
        await this.logWebhookDelivery(webhook.id, event, {
          success: false,
          statusCode,
          responseTime,
          attempt,
          error: errorMessage,
          response: axiosError.response?.data ? JSON.stringify(axiosError.response.data).slice(0, 1000) : undefined
        });

        if (isLastAttempt) {
          return {
            success: false,
            statusCode,
            responseTime,
            attempt,
            error: errorMessage
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelays[attempt - 1] || 15000));
      }
    }

    return {
      success: false,
      statusCode: 0,
      responseTime: Date.now() - startTime,
      attempt: this.maxRetries,
      error: 'Max retries exceeded'
    };
  }

  /**
   * Dispatch webhook event to all matching webhooks
   */
  async dispatchWebhookEvent(workspaceId: string, event: WebhookEvent): Promise<void> {
    try {
      const webhookRepository = AppDataSource.getRepository(Webhook);
      const webhooks = await webhookRepository.find({
        where: {
          workspaceId,
          isActive: true
        }
      });

      // Filter webhooks that are subscribed to this event type
      const matchingWebhooks = webhooks.filter(webhook => 
        webhook.events.includes(event.type) || 
        webhook.events.includes('*') ||
        webhook.events.some(e => e.endsWith('.*') && event.type.startsWith(e.slice(0, -2)))
      );

      if (matchingWebhooks.length === 0) {
        console.log(`No active webhooks found for event type: ${event.type}`);
        return;
      }

      // Send to all matching webhooks in parallel
      const deliveryPromises = matchingWebhooks.map(webhook => 
        this.sendWebhookEvent(webhook, event)
      );

      await Promise.all(deliveryPromises);
      
      console.log(`Webhook event ${event.type} dispatched to ${matchingWebhooks.length} webhooks`);
    } catch (error) {
      console.error('Error dispatching webhook event:', error);
    }
  }

  /**
   * Update webhook statistics
   */
  private async updateWebhookStats(webhookId: string, success: boolean, responseTime: number): Promise<void> {
    try {
      const webhookRepository = AppDataSource.getRepository(Webhook);
      const webhook = await webhookRepository.findOne({ where: { id: webhookId } });
      
      if (!webhook) return;

      webhook.deliveryAttempts++;
      webhook.lastDeliveryAt = new Date();

      if (success) {
        webhook.lastSuccessAt = new Date();
        webhook.failedAttempts = 0; // Reset failed attempts on success
        webhook.lastError = undefined;
      } else {
        webhook.failedAttempts++;
        webhook.lastFailureAt = new Date();
        
        // Auto-disable webhook if it has too many consecutive failures
        if (webhook.failedAttempts >= this.maxFailedAttempts) {
          webhook.isActive = false;
          webhook.lastError = `Auto-disabled after ${this.maxFailedAttempts} consecutive failures`;
          console.log(`Webhook ${webhookId} auto-disabled due to consecutive failures`);
        }
      }

      await webhookRepository.save(webhook);
    } catch (error) {
      console.error('Error updating webhook stats:', error);
    }
  }

  /**
   * Log webhook delivery attempt
   */
  private async logWebhookDelivery(
    webhookId: string,
    event: WebhookEvent,
    result: {
      success: boolean;
      statusCode: number;
      responseTime: number;
      attempt: number;
      error?: string;
      response?: string;
    }
  ): Promise<void> {
    try {
      const logRepository = AppDataSource.getRepository(WebhookLog);
      const log = logRepository.create({
        webhookId,
        event: event.type,
        payload: event.data,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        error: result.error
      });

      await logRepository.save(log);
    } catch (error) {
      console.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * Get webhook delivery statistics
   */
  async getWebhookStats(webhookId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    averageResponseTime: number;
    lastDelivery: Date | null;
    lastSuccess: Date | null;
    lastFailure: Date | null;
    consecutiveFailures: number;
    isHealthy: boolean;
  }> {
    try {
      const webhookRepository = AppDataSource.getRepository(Webhook);
      const webhook = await webhookRepository.findOne({ where: { id: webhookId } });
      
      if (!webhook) {
        return {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0,
          averageResponseTime: 0,
          lastDelivery: null,
          lastSuccess: null,
          lastFailure: null,
          consecutiveFailures: 0,
          isHealthy: false
        };
      }

      const logRepository = AppDataSource.getRepository(WebhookLog);
      const [stats] = await logRepository.query(`
        SELECT 
          COUNT(*) as "totalDeliveries",
          SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as "successfulDeliveries",
          SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as "failedDeliveries",
          AVG(response_time) as "averageResponseTime"
        FROM webhook_logs 
        WHERE webhook_id = $1
      `, [webhookId]);

      const totalDeliveries = parseInt(stats.totalDeliveries) || 0;
      const successfulDeliveries = parseInt(stats.successfulDeliveries) || 0;
      const failedDeliveries = parseInt(stats.failedDeliveries) || 0;
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
      const isHealthy = webhook.isActive && webhook.failedAttempts < 5 && successRate > 80;

      return {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate,
        averageResponseTime: parseFloat(stats.averageResponseTime) || 0,
        lastDelivery: webhook.lastDeliveryAt,
        lastSuccess: webhook.lastSuccessAt,
        lastFailure: webhook.lastFailureAt,
        consecutiveFailures: webhook.failedAttempts,
        isHealthy
      };
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        successRate: 0,
        averageResponseTime: 0,
        lastDelivery: null,
        lastSuccess: null,
        lastFailure: null,
        consecutiveFailures: 0,
        isHealthy: false
      };
    }
  }

  /**
   * Retry failed webhook delivery
   */
  async retryWebhookDelivery(webhookId: string, eventId: string): Promise<boolean> {
    try {
      const webhookRepository = AppDataSource.getRepository(Webhook);
      const webhook = await webhookRepository.findOne({ where: { id: webhookId } });
      
      if (!webhook) {
        return false;
      }

      // Create a retry event (you'd need to store the original event data)
      const retryEvent: WebhookEvent = {
        id: `retry_${eventId}_${Date.now()}`,
        type: 'webhook.retry',
        workspaceId: webhook.workspaceId,
        data: { originalEventId: eventId },
        timestamp: new Date(),
        source: 'openhousecrm'
      };

      const result = await this.sendWebhookEvent(webhook, retryEvent);
      return result.success;
    } catch (error) {
      console.error('Error retrying webhook delivery:', error);
      return false;
    }
  }

  /**
   * Clean up old webhook logs
   */
  async cleanupOldLogs(retentionDays: number = 30): Promise<void> {
    try {
      const logRepository = AppDataSource.getRepository(WebhookLog);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await logRepository.delete({
        createdAt: LessThan(cutoffDate)
      });

      console.log(`Cleaned up ${result.affected ?? 0} old webhook logs`);
    } catch (error) {
      console.error('Error cleaning up webhook logs:', error);
    }
  }

  /**
   * Get webhook health report
   */
  async getWebhookHealthReport(workspaceId: string): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    healthyWebhooks: number;
    failingWebhooks: number;
    totalDeliveries: number;
    successRate: number;
    averageResponseTime: number;
  }> {
    try {
      const webhookRepository = AppDataSource.getRepository(Webhook);
      const webhooks = await webhookRepository.find({
        where: { workspaceId }
      });

      const totalWebhooks = webhooks.length;
      const activeWebhooks = webhooks.filter(w => w.isActive).length;
      
      let healthyWebhooks = 0;
      let failingWebhooks = 0;
      let totalDeliveries = 0;
      let totalSuccessfulDeliveries = 0;
      let totalResponseTime = 0;

      for (const webhook of webhooks) {
        const stats = await this.getWebhookStats(webhook.id);
        
        if (stats.isHealthy) {
          healthyWebhooks++;
        } else {
          failingWebhooks++;
        }
        
        totalDeliveries += stats.totalDeliveries;
        totalSuccessfulDeliveries += stats.successfulDeliveries;
        totalResponseTime += stats.averageResponseTime;
      }

      const successRate = totalDeliveries > 0 ? (totalSuccessfulDeliveries / totalDeliveries) * 100 : 0;
      const averageResponseTime = totalWebhooks > 0 ? totalResponseTime / totalWebhooks : 0;

      return {
        totalWebhooks,
        activeWebhooks,
        healthyWebhooks,
        failingWebhooks,
        totalDeliveries,
        successRate,
        averageResponseTime
      };
    } catch (error) {
      console.error('Error generating webhook health report:', error);
      return {
        totalWebhooks: 0,
        activeWebhooks: 0,
        healthyWebhooks: 0,
        failingWebhooks: 0,
        totalDeliveries: 0,
        successRate: 0,
        averageResponseTime: 0
      };
    }
  }
}
