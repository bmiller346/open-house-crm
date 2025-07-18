import { Webhook, WebhookSecret, WebhookAuditLog } from '../entities';
import { AppDataSource } from '../config/database';
import { Repository } from 'typeorm';
import crypto from 'crypto';

export interface SecretRotationOptions {
  webhookId: string;
  rotatedBy: string;
  gracePeriodHours?: number;
  customSecret?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecretRotationResult {
  success: boolean;
  newSecret?: string;
  newSecretId?: string;
  error?: string;
  gracePeriodEnds?: Date;
}

export class WebhookSecretRotationService {
  private webhookRepository: Repository<Webhook>;
  private webhookSecretRepository: Repository<WebhookSecret>;
  private auditLogRepository: Repository<WebhookAuditLog>;

  constructor() {
    this.webhookRepository = AppDataSource.getRepository(Webhook);
    this.webhookSecretRepository = AppDataSource.getRepository(WebhookSecret);
    this.auditLogRepository = AppDataSource.getRepository(WebhookAuditLog);
  }

  /**
   * Generate a new webhook secret
   */
  private generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a secret for storage
   */
  private hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  /**
   * Generate a display prefix for the secret
   */
  private generateSecretPrefix(secret: string): string {
    return `whsec_${secret.substring(0, 8)}`;
  }

  /**
   * Rotate webhook secret
   */
  async rotateSecret(options: SecretRotationOptions): Promise<SecretRotationResult> {
    try {
      // Verify webhook exists
      const webhook = await this.webhookRepository.findOne({
        where: { id: options.webhookId }
      });

      if (!webhook) {
        return {
          success: false,
          error: 'Webhook not found'
        };
      }

      // Generate new secret
      const newSecret = options.customSecret || this.generateSecret();
      const newSecretHash = this.hashSecret(newSecret);
      const newSecretPrefix = this.generateSecretPrefix(newSecret);

      // Set grace period (default 24 hours)
      const gracePeriodHours = options.gracePeriodHours || 24;
      const gracePeriodEnds = new Date();
      gracePeriodEnds.setHours(gracePeriodEnds.getHours() + gracePeriodHours);

      // Get current active secret
      const currentSecret = await this.webhookSecretRepository.findOne({
        where: { 
          webhookId: options.webhookId, 
          isActive: true 
        },
        order: { createdAt: 'DESC' }
      });

      // Create new secret
      const newSecretRecord = this.webhookSecretRepository.create({
        webhookId: options.webhookId,
        secretHash: newSecretHash,
        secretPrefix: newSecretPrefix,
        isActive: true,
        rotatedBy: options.rotatedBy,
        createdAt: new Date()
      });

      const savedSecret = await this.webhookSecretRepository.save(newSecretRecord);

      // Update current secret with expiration (grace period)
      if (currentSecret) {
        currentSecret.expiresAt = gracePeriodEnds;
        await this.webhookSecretRepository.save(currentSecret);
      }

      // Update webhook's primary secret reference
      webhook.secret = newSecretHash;
      await this.webhookRepository.save(webhook);

      // Create audit log entry
      await this.auditLogRepository.save({
        webhookId: options.webhookId,
        action: 'secret_rotated',
        changedBy: options.rotatedBy,
        changes: {
          old_secret_id: currentSecret?.id,
          new_secret_id: savedSecret.id,
          grace_period_hours: gracePeriodHours,
          grace_period_ends: gracePeriodEnds.toISOString(),
          custom_secret_provided: !!options.customSecret
        },
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        createdAt: new Date()
      });

      return {
        success: true,
        newSecret: newSecret,
        newSecretId: savedSecret.id,
        gracePeriodEnds: gracePeriodEnds
      };

    } catch (error) {
      console.error('Error rotating webhook secret:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all secrets for a webhook (active and expired)
   */
  async getWebhookSecrets(webhookId: string): Promise<WebhookSecret[]> {
    return await this.webhookSecretRepository.find({
      where: { webhookId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get active secrets for a webhook (including those in grace period)
   */
  async getActiveSecrets(webhookId: string): Promise<WebhookSecret[]> {
    const now = new Date();
    
    return await this.webhookSecretRepository.find({
      where: [
        { webhookId, isActive: true },
        { webhookId, isActive: false, expiresAt: now } // Grace period secrets
      ],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Validate a signature against all active secrets
   */
  async validateSignature(
    webhookId: string, 
    payload: string, 
    signature: string
  ): Promise<{ valid: boolean; secretId?: string; inGracePeriod?: boolean }> {
    const activeSecrets = await this.getActiveSecrets(webhookId);

    for (const secret of activeSecrets) {
      const expectedSignature = crypto
        .createHmac('sha256', secret.secretHash)
        .update(payload)
        .digest('hex');

      const calculatedSignature = `sha256=${expectedSignature}`;

      if (crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
      )) {
        return {
          valid: true,
          secretId: secret.id,
          inGracePeriod: !secret.isActive && secret.expiresAt > new Date()
        };
      }
    }

    return { valid: false };
  }

  /**
   * Revoke a secret immediately (no grace period)
   */
  async revokeSecret(
    secretId: string, 
    revokedBy: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const secret = await this.webhookSecretRepository.findOne({
        where: { id: secretId }
      });

      if (!secret) {
        return {
          success: false,
          error: 'Secret not found'
        };
      }

      // Deactivate the secret
      secret.isActive = false;
      secret.expiresAt = new Date(); // Expire immediately
      await this.webhookSecretRepository.save(secret);

      // Create audit log entry
      await this.auditLogRepository.save({
        webhookId: secret.webhookId,
        action: 'secret_revoked',
        changedBy: revokedBy,
        changes: {
          secret_id: secretId,
          reason: reason || 'Manual revocation',
          revoked_at: new Date().toISOString()
        },
        createdAt: new Date()
      });

      return { success: true };

    } catch (error) {
      console.error('Error revoking webhook secret:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up expired secrets
   */
  async cleanupExpiredSecrets(): Promise<{ cleaned: number; errors: string[] }> {
    const now = new Date();
    const errors: string[] = [];
    let cleaned = 0;

    try {
      const expiredSecrets = await this.webhookSecretRepository.find({
        where: {
          isActive: false,
          expiresAt: now // Less than now
        }
      });

      for (const secret of expiredSecrets) {
        try {
          await this.webhookSecretRepository.remove(secret);
          cleaned++;
        } catch (error) {
          errors.push(`Failed to remove secret ${secret.id}: ${error}`);
        }
      }

      return { cleaned, errors };

    } catch (error) {
      console.error('Error cleaning up expired secrets:', error);
      return { 
        cleaned: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  /**
   * Get secret rotation history for a webhook
   */
  async getRotationHistory(webhookId: string): Promise<WebhookAuditLog[]> {
    return await this.auditLogRepository.find({
      where: { 
        webhookId,
        action: 'secret_rotated'
      },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get secret usage statistics
   */
  async getSecretStats(webhookId: string): Promise<any> {
    const secrets = await this.webhookSecretRepository.find({
      where: { webhookId },
      order: { createdAt: 'DESC' }
    });

    const now = new Date();
    const activeSecrets = secrets.filter(s => s.isActive);
    const expiredSecrets = secrets.filter(s => !s.isActive && s.expiresAt && s.expiresAt <= now);
    const gracePeriodSecrets = secrets.filter(s => !s.isActive && s.expiresAt && s.expiresAt > now);

    return {
      total: secrets.length,
      active: activeSecrets.length,
      expired: expiredSecrets.length,
      inGracePeriod: gracePeriodSecrets.length,
      oldestSecret: secrets.length > 0 ? secrets[secrets.length - 1].createdAt : null,
      newestSecret: secrets.length > 0 ? secrets[0].createdAt : null,
      secrets: secrets.map(s => ({
        id: s.id,
        prefix: s.secretPrefix,
        isActive: s.isActive,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        rotatedBy: s.rotatedBy
      }))
    };
  }

  /**
   * Generate signature verification code examples
   */
  generateVerificationExamples(secret: string): any {
    return {
      nodejs: `
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = 'sha256=' + hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Usage
const isValid = verifyWebhookSignature(
  JSON.stringify(req.body),
  req.headers['x-webhook-signature'],
  '${secret}'
);
      `,
      python: `
import hashlib
import hmac
import json

def verify_webhook_signature(payload, signature, secret):
    calculated_signature = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, calculated_signature)

# Usage
is_valid = verify_webhook_signature(
    json.dumps(request.json),
    request.headers.get('X-Webhook-Signature'),
    '${secret}'
)
      `,
      php: `
<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $calculatedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $calculatedSignature);
}

// Usage
$isValid = verifyWebhookSignature(
    json_encode($_POST),
    $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'],
    '${secret}'
);
?>
      `,
      curl: `
# Example webhook endpoint test
curl -X POST https://your-endpoint.com/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: sha256=..." \\
  -d '{"event": "test", "data": {}}'
      `
    };
  }
}
