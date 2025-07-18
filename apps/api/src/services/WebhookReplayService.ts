import { WebhookLog } from '../entities/WebhookLog';
import { Webhook } from '../entities/Webhook';
import { WebhookSecret } from '../entities/WebhookSecret';
import { WebhookAuditLog } from '../entities/WebhookAuditLog';
import { AppDataSource } from '../../config/database';
import { EnhancedWebhookService } from './EnhancedWebhookService';
import { Repository } from 'typeorm';
import crypto from 'crypto';

export interface WebhookReplayOptions {
  logId: string;
  replayedBy: string;
  customPayload?: any;
  useOriginalTimestamp?: boolean;
  skipSignatureValidation?: boolean;
}

export interface WebhookReplayResult {
  success: boolean;
  newLogId?: string;
  error?: string;
  statusCode?: number;
  responseTime?: number;
  delivered?: boolean;
}

export class WebhookReplayService {
  private webhookLogRepository: Repository<WebhookLog>;
  private webhookRepository: Repository<Webhook>;
  private webhookSecretRepository: Repository<WebhookSecret>;
  private auditLogRepository: Repository<WebhookAuditLog>;
  private webhookService: EnhancedWebhookService;

  constructor() {
    this.webhookLogRepository = AppDataSource.getRepository(WebhookLog);
    this.webhookRepository = AppDataSource.getRepository(Webhook);
    this.webhookSecretRepository = AppDataSource.getRepository(WebhookSecret);
    this.auditLogRepository = AppDataSource.getRepository(WebhookAuditLog);
    this.webhookService = new EnhancedWebhookService();
  }

  /**
   * Replay a webhook delivery
   */
  async replayWebhook(options: WebhookReplayOptions): Promise<WebhookReplayResult> {
    try {
      // Get the original log entry
      const originalLog = await this.webhookLogRepository.findOne({
        where: { id: options.logId },
        relations: ['webhook']
      });

      if (!originalLog) {
        return {
          success: false,
          error: 'Webhook log not found'
        };
      }

      // Get the webhook configuration
      const webhook = await this.webhookRepository.findOne({
        where: { id: originalLog.webhook.id }
      });

      if (!webhook) {
        return {
          success: false,
          error: 'Webhook configuration not found'
        };
      }

      if (!webhook.isActive) {
        return {
          success: false,
          error: 'Webhook is not active'
        };
      }

      // Prepare payload for replay
      const payload = options.customPayload || originalLog.payload;
      
      // Add replay metadata
      const replayPayload = {
        ...payload,
        _replay: {
          original_event_id: originalLog.originalEventId,
          replayed_at: new Date().toISOString(),
          replayed_by: options.replayedBy,
          original_timestamp: originalLog.createdAt
        }
      };

      // Get current active secret
      const activeSecret = await this.webhookSecretRepository.findOne({
        where: { 
          webhookId: webhook.id, 
          isActive: true 
        },
        order: { createdAt: 'DESC' }
      });

      if (!activeSecret) {
        return {
          success: false,
          error: 'No active secret found for webhook'
        };
      }

      // Deliver the webhook
      const deliveryResult = await this.webhookService.deliverWebhook(
        webhook.url,
        originalLog.eventType,
        replayPayload,
        activeSecret.secretHash,
        {
          'X-Webhook-Replay': 'true',
          'X-Webhook-Original-Event-ID': originalLog.originalEventId || '',
          'X-Webhook-Replayed-By': options.replayedBy,
          'X-Webhook-Replayed-At': new Date().toISOString()
        }
      );

      // Create new log entry for the replay
      const newLog = this.webhookLogRepository.create({
        webhookId: webhook.id,
        eventType: originalLog.eventType,
        payload: replayPayload,
        url: webhook.url,
        method: 'POST',
        requestHeaders: deliveryResult.requestHeaders,
        statusCode: deliveryResult.statusCode,
        responseBody: deliveryResult.responseBody,
        responseHeaders: deliveryResult.responseHeaders,
        responseTime: deliveryResult.responseTime,
        delivered: deliveryResult.delivered,
        error: deliveryResult.error,
        attempt: 1,
        maxAttempts: 1, // Replays don't retry
        replayedFrom: originalLog.id,
        replayedBy: options.replayedBy,
        replayedAt: new Date(),
        originalEventId: originalLog.originalEventId,
        signature: deliveryResult.signature
      });

      const savedLog = await this.webhookLogRepository.save(newLog);

      // Create audit log entry
      await this.auditLogRepository.save({
        webhookId: webhook.id,
        action: 'replayed',
        changedBy: options.replayedBy,
        changes: {
          original_log_id: originalLog.id,
          new_log_id: savedLog.id,
          custom_payload: !!options.customPayload
        },
        createdAt: new Date()
      });

      return {
        success: deliveryResult.delivered,
        newLogId: savedLog.id,
        statusCode: deliveryResult.statusCode,
        responseTime: deliveryResult.responseTime,
        delivered: deliveryResult.delivered,
        error: deliveryResult.error
      };

    } catch (error) {
      console.error('Error replaying webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Bulk replay multiple webhook logs
   */
  async bulkReplayWebhooks(
    logIds: string[], 
    replayedBy: string,
    options: { skipFailures?: boolean } = {}
  ): Promise<{ results: WebhookReplayResult[], summary: any }> {
    const results: WebhookReplayResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const logId of logIds) {
      try {
        const result = await this.replayWebhook({ logId, replayedBy });
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (!options.skipFailures) {
            break; // Stop on first failure if not skipping
          }
        }
      } catch (error) {
        const errorResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(errorResult);
        failureCount++;
        
        if (!options.skipFailures) {
          break;
        }
      }
    }

    return {
      results,
      summary: {
        total: logIds.length,
        processed: results.length,
        successful: successCount,
        failed: failureCount,
        skipped: logIds.length - results.length
      }
    };
  }

  /**
   * Get replay history for a webhook log
   */
  async getReplayHistory(originalLogId: string): Promise<WebhookLog[]> {
    return await this.webhookLogRepository.find({
      where: { replayedFrom: originalLogId },
      order: { createdAt: 'DESC' },
      relations: ['webhook']
    });
  }

  /**
   * Get replay chain (original + all replays)
   */
  async getReplayChain(logId: string): Promise<WebhookLog[]> {
    const log = await this.webhookLogRepository.findOne({
      where: { id: logId },
      relations: ['webhook']
    });

    if (!log) {
      return [];
    }

    // If this is a replay, get the original
    const originalId = log.replayedFrom || log.id;
    
    // Get the original log
    const originalLog = await this.webhookLogRepository.findOne({
      where: { id: originalId },
      relations: ['webhook']
    });

    if (!originalLog) {
      return [];
    }

    // Get all replays
    const replays = await this.webhookLogRepository.find({
      where: { replayedFrom: originalId },
      order: { createdAt: 'ASC' },
      relations: ['webhook']
    });

    return [originalLog, ...replays];
  }

  /**
   * Check if a log can be replayed
   */
  async canReplay(logId: string): Promise<{ canReplay: boolean; reason?: string }> {
    const log = await this.webhookLogRepository.findOne({
      where: { id: logId },
      relations: ['webhook']
    });

    if (!log) {
      return { canReplay: false, reason: 'Log not found' };
    }

    if (!log.webhook.isActive) {
      return { canReplay: false, reason: 'Webhook is not active' };
    }

    // Check if webhook has active secret
    const activeSecret = await this.webhookSecretRepository.findOne({
      where: { 
        webhookId: log.webhook.id, 
        isActive: true 
      }
    });

    if (!activeSecret) {
      return { canReplay: false, reason: 'No active secret found' };
    }

    // Check if log is too old (optional business rule)
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const logAge = Date.now() - log.createdAt.getTime();
    
    if (logAge > maxAgeMs) {
      return { canReplay: false, reason: 'Log is too old to replay' };
    }

    return { canReplay: true };
  }

  /**
   * Get replay statistics for a webhook
   */
  async getReplayStats(webhookId: string): Promise<any> {
    const stats = await this.webhookLogRepository
      .createQueryBuilder('log')
      .where('log.webhook_id = :webhookId', { webhookId })
      .andWhere('log.replayed_from IS NOT NULL')
      .select([
        'COUNT(*) as total_replays',
        'COUNT(CASE WHEN log.delivered = true THEN 1 END) as successful_replays',
        'COUNT(CASE WHEN log.delivered = false THEN 1 END) as failed_replays',
        'AVG(log.response_time) as avg_response_time',
        'MIN(log.created_at) as first_replay',
        'MAX(log.created_at) as last_replay'
      ])
      .getRawOne();

    return {
      totalReplays: parseInt(stats.total_replays) || 0,
      successfulReplays: parseInt(stats.successful_replays) || 0,
      failedReplays: parseInt(stats.failed_replays) || 0,
      successRate: stats.total_replays > 0 
        ? (stats.successful_replays / stats.total_replays) * 100 
        : 0,
      avgResponseTime: parseFloat(stats.avg_response_time) || 0,
      firstReplay: stats.first_replay,
      lastReplay: stats.last_replay
    };
  }
}
