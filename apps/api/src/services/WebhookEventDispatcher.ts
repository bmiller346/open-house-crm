import { WebhookService } from '../services/WebhookService';
import { WebhookEvent } from '../../../../packages/core/src/types';

/**
 * Webhook Event Dispatcher
 * Handles dispatching webhook events to registered webhooks
 */
export class WebhookEventDispatcher {
  private webhookService: WebhookService;

  constructor() {
    this.webhookService = new WebhookService();
  }

  /**
   * Dispatch a webhook event to all matching webhooks
   */
  async dispatch(workspaceId: string, eventType: string, data: any): Promise<void> {
    try {
      const event: WebhookEvent = {
        id: this.generateEventId(),
        type: eventType,
        workspaceId,
        data,
        timestamp: new Date(),
        source: 'openhousecrm'
      };

      await this.webhookService.dispatchWebhookEvent(workspaceId, event);
    } catch (error) {
      console.error('Error dispatching webhook event:', error);
    }
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Contact Events
  async dispatchContactCreated(workspaceId: string, contact: any): Promise<void> {
    await this.dispatch(workspaceId, 'contact.created', contact);
  }

  async dispatchContactUpdated(workspaceId: string, contact: any): Promise<void> {
    await this.dispatch(workspaceId, 'contact.updated', contact);
  }

  async dispatchContactDeleted(workspaceId: string, contactId: string): Promise<void> {
    await this.dispatch(workspaceId, 'contact.deleted', { id: contactId });
  }

  // Transaction Events
  async dispatchTransactionCreated(workspaceId: string, transaction: any): Promise<void> {
    await this.dispatch(workspaceId, 'transaction.created', transaction);
  }

  async dispatchTransactionUpdated(workspaceId: string, transaction: any): Promise<void> {
    await this.dispatch(workspaceId, 'transaction.updated', transaction);
  }

  async dispatchTransactionDeleted(workspaceId: string, transactionId: string): Promise<void> {
    await this.dispatch(workspaceId, 'transaction.deleted', { id: transactionId });
  }

  // Property Events
  async dispatchPropertyCreated(workspaceId: string, property: any): Promise<void> {
    await this.dispatch(workspaceId, 'property.created', property);
  }

  async dispatchPropertyUpdated(workspaceId: string, property: any): Promise<void> {
    await this.dispatch(workspaceId, 'property.updated', property);
  }

  async dispatchPropertyDeleted(workspaceId: string, propertyId: string): Promise<void> {
    await this.dispatch(workspaceId, 'property.deleted', { id: propertyId });
  }

  // Campaign Events
  async dispatchCampaignCreated(workspaceId: string, campaign: any): Promise<void> {
    await this.dispatch(workspaceId, 'campaign.created', campaign);
  }

  async dispatchCampaignUpdated(workspaceId: string, campaign: any): Promise<void> {
    await this.dispatch(workspaceId, 'campaign.updated', campaign);
  }

  async dispatchCampaignDeleted(workspaceId: string, campaignId: string): Promise<void> {
    await this.dispatch(workspaceId, 'campaign.deleted', { id: campaignId });
  }

  // Pipeline Events
  async dispatchPipelineCreated(workspaceId: string, pipeline: any): Promise<void> {
    await this.dispatch(workspaceId, 'pipeline.created', pipeline);
  }

  async dispatchPipelineUpdated(workspaceId: string, pipeline: any): Promise<void> {
    await this.dispatch(workspaceId, 'pipeline.updated', pipeline);
  }

  async dispatchPipelineDeleted(workspaceId: string, pipelineId: string): Promise<void> {
    await this.dispatch(workspaceId, 'pipeline.deleted', { id: pipelineId });
  }

  // Deal Events
  async dispatchDealCreated(workspaceId: string, deal: any): Promise<void> {
    await this.dispatch(workspaceId, 'deal.created', deal);
  }

  async dispatchDealUpdated(workspaceId: string, deal: any): Promise<void> {
    await this.dispatch(workspaceId, 'deal.updated', deal);
  }

  async dispatchDealDeleted(workspaceId: string, dealId: string): Promise<void> {
    await this.dispatch(workspaceId, 'deal.deleted', { id: dealId });
  }

  // Appointment Events
  async dispatchAppointmentCreated(workspaceId: string, appointment: any): Promise<void> {
    await this.dispatch(workspaceId, 'appointment.created', appointment);
  }

  async dispatchAppointmentUpdated(workspaceId: string, appointment: any): Promise<void> {
    await this.dispatch(workspaceId, 'appointment.updated', appointment);
  }

  async dispatchAppointmentDeleted(workspaceId: string, appointmentId: string): Promise<void> {
    await this.dispatch(workspaceId, 'appointment.deleted', { id: appointmentId });
  }

  // User Events
  async dispatchUserCreated(workspaceId: string, user: any): Promise<void> {
    await this.dispatch(workspaceId, 'user.created', user);
  }

  async dispatchUserUpdated(workspaceId: string, user: any): Promise<void> {
    await this.dispatch(workspaceId, 'user.updated', user);
  }

  async dispatchUserDeleted(workspaceId: string, userId: string): Promise<void> {
    await this.dispatch(workspaceId, 'user.deleted', { id: userId });
  }
}

// Export singleton instance
export const webhookEventDispatcher = new WebhookEventDispatcher();
