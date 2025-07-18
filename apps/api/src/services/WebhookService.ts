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

export class WebhookService {
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s
  private readonly timeoutMs = 30000; // 30 seconds

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
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status < 500
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
      const payload = JSON.stringify({
        type: 'webhook.verification',
        challenge,
        timestamp: new Date().toISOString()
      });

      const signature = this.generateSignature(payload, webhook.secret);
      
      const response = await axios.post(webhook.url, JSON.parse(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': 'webhook.verification',
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
        const payload = JSON.stringify({
          id: event.id,
          type: event.type,
          workspaceId: event.workspaceId,
          data: event.data,
          timestamp: event.timestamp,
          source: event.source
        });

        const signature = this.generateSignature(payload, webhook.secret);
        
        const response = await axios.post(webhook.url, JSON.parse(payload), {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Event': event.type,
            'X-Webhook-Delivery': event.id,
            'User-Agent': 'OpenHouseCRM-Webhook/1.0'
          },
          timeout: this.timeoutMs
        });

        const responseTime = Date.now() - startTime;
        
        // Log successful delivery
        await this.logWebhookDelivery(webhook.id, event, {
          success: true,
          statusCode: response.status,
          responseTime,
          attempt: attempt + 1,
          response: JSON.stringify(response.data).slice(0, 1000) // Limit response size
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
        webhook.events.includes(event.type)
      );

      if (matchingWebhooks.length === 0) {
        console.log(`No webhooks found for event type: ${event.type}`);
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
    averageResponseTime: number;
    lastDelivery: Date | null;
  }> {
    try {
      const logRepository = AppDataSource.getRepository(WebhookLog);
      
      const [stats] = await logRepository.query(`
        SELECT 
          COUNT(*) as "totalDeliveries",
          SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as "successfulDeliveries",
          SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as "failedDeliveries",
          AVG(response_time) as "averageResponseTime",
          MAX(created_at) as "lastDelivery"
        FROM webhook_logs 
        WHERE webhook_id = $1
      `, [webhookId]);

      return {
        totalDeliveries: parseInt(stats.totalDeliveries) || 0,
        successfulDeliveries: parseInt(stats.successfulDeliveries) || 0,
        failedDeliveries: parseInt(stats.failedDeliveries) || 0,
        averageResponseTime: parseFloat(stats.averageResponseTime) || 0,
        lastDelivery: stats.lastDelivery ? new Date(stats.lastDelivery) : null
      };
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageResponseTime: 0,
        lastDelivery: null
      };
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

      console.log(`Cleaned up ${result.affected} old webhook logs`);
    } catch (error) {
      console.error('Error cleaning up webhook logs:', error);
    }
  }

  /**
   * Disable webhook after consecutive failures
   */
  async checkAndDisableFailedWebhooks(): Promise<void> {
    try {
      const logRepository = AppDataSource.getRepository(WebhookLog);
      const webhookRepository = AppDataSource.getRepository(Webhook);

      // Find webhooks with 10+ consecutive failures in the last 24 hours
      const failedWebhooks = await logRepository.query(`
        SELECT 
          webhook_id,
          COUNT(*) as consecutive_failures
        FROM webhook_logs 
        WHERE 
          created_at > NOW() - INTERVAL '24 hours'
          AND success = false
          AND webhook_id NOT IN (
            SELECT DISTINCT webhook_id 
            FROM webhook_logs 
            WHERE 
              created_at > NOW() - INTERVAL '24 hours'
              AND success = true
          )
        GROUP BY webhook_id
        HAVING COUNT(*) >= 10
      `);

      for (const failed of failedWebhooks) {
        await webhookRepository.update(failed.webhook_id, { isActive: false });
        console.log(`Disabled webhook ${failed.webhook_id} due to consecutive failures`);
      }
    } catch (error) {
      console.error('Error checking failed webhooks:', error);
    }
  }
}
