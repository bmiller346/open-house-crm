import cron from 'node-cron';
import { WebhookService } from '../services/WebhookService';

/**
 * Webhook Scheduler
 * Handles scheduled maintenance tasks for the webhook system
 */
export class WebhookScheduler {
  private webhookService: WebhookService;
  private isRunning = false;

  constructor() {
    this.webhookService = new WebhookService();
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Webhook scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🕐 Starting webhook scheduler...');

    // Clean up old webhook logs daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Starting webhook logs cleanup...');
      try {
        await this.webhookService.cleanupOldLogs(30); // Keep logs for 30 days
        console.log('✅ Webhook logs cleanup completed');
      } catch (error) {
        console.error('❌ Error during webhook logs cleanup:', error);
      }
    });

    // Check for failed webhooks every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('🔍 Checking for failed webhooks...');
      try {
        await this.webhookService.checkAndDisableFailedWebhooks();
        console.log('✅ Failed webhooks check completed');
      } catch (error) {
        console.error('❌ Error during failed webhooks check:', error);
      }
    });

    console.log('✅ Webhook scheduler started successfully');
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Webhook scheduler is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('🛑 Webhook scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    activeTasks: number;
  } {
    return {
      isRunning: this.isRunning,
      activeTasks: cron.getTasks().size
    };
  }
}

// Export singleton instance
export const webhookScheduler = new WebhookScheduler();
