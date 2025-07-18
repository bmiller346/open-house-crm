"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBHOOK_EVENTS = void 0;
// Webhook event types
exports.WEBHOOK_EVENTS = {
    // Contact events
    CONTACT_CREATED: 'contact.created',
    CONTACT_UPDATED: 'contact.updated',
    CONTACT_DELETED: 'contact.deleted',
    // Transaction events
    TRANSACTION_CREATED: 'transaction.created',
    TRANSACTION_UPDATED: 'transaction.updated',
    TRANSACTION_DELETED: 'transaction.deleted',
    // Property events
    PROPERTY_CREATED: 'property.created',
    PROPERTY_UPDATED: 'property.updated',
    PROPERTY_DELETED: 'property.deleted',
    // Campaign events
    CAMPAIGN_CREATED: 'campaign.created',
    CAMPAIGN_UPDATED: 'campaign.updated',
    CAMPAIGN_DELETED: 'campaign.deleted',
    // Pipeline events
    PIPELINE_CREATED: 'pipeline.created',
    PIPELINE_UPDATED: 'pipeline.updated',
    PIPELINE_DELETED: 'pipeline.deleted',
    // Appointment events
    APPOINTMENT_CREATED: 'appointment.created',
    APPOINTMENT_UPDATED: 'appointment.updated',
    APPOINTMENT_COMPLETED: 'appointment.completed',
    APPOINTMENT_CANCELLED: 'appointment.cancelled',
    // Deal events
    DEAL_CREATED: 'deal.created',
    DEAL_UPDATED: 'deal.updated',
    DEAL_WON: 'deal.won',
    DEAL_LOST: 'deal.lost',
    // User events
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted'
};
// Export all types
__exportStar(require("./types"), exports);
