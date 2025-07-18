import crypto from 'crypto';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ApiKey } from '../entities/ApiKey';

// Simple hash function to avoid bcryptjs dependency
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function verifyKey(key: string, hash: string): boolean {
  return hashKey(key) === hash;
}

export class ApiKeyService {
  private readonly keyPrefix = 'ohc_';
  private readonly keyLength = 64;

  /**
   * Generate a new API key
   */
  generateApiKey(): { key: string; hash: string; prefix: string } {
    const randomBytes = crypto.randomBytes(this.keyLength);
    const key = this.keyPrefix + randomBytes.toString('hex');
    const hash = hashKey(key);
    const prefix = key.substring(0, 12) + '...';

    return { key, hash, prefix };
  }

  /**
   * Verify an API key
   */
  async verifyApiKey(providedKey: string): Promise<ApiKey | null> {
    try {
      if (!providedKey.startsWith(this.keyPrefix)) {
        return null;
      }

      const keyPrefix = providedKey.substring(0, 12) + '...';
      const apiKeyRepository = AppDataSource.getRepository(ApiKey);
      
      const apiKey = await apiKeyRepository.findOne({
        where: { keyPrefix, isActive: true },
        relations: ['workspace']
      });

      if (!apiKey) {
        return null;
      }

      // Check if key is expired
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return null;
      }

      // Verify the key hash
      const isValid = verifyKey(providedKey, apiKey.keyHash);
      if (!isValid) {
        return null;
      }

      // Update last used timestamp
      apiKey.lastUsedAt = new Date();
      await apiKeyRepository.save(apiKey);

      return apiKey;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return null;
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(data: {
    workspaceId: string;
    name: string;
    description?: string;
    permissions: string[];
    ipWhitelist?: string[];
    expiresAt?: Date;
    createdBy: string;
  }): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const { key, hash, prefix } = this.generateApiKey();
    
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const apiKey = apiKeyRepository.create({
      ...data,
      keyHash: hash,
      keyPrefix: prefix
    });

    const savedApiKey = await apiKeyRepository.save(apiKey);
    
    return {
      apiKey: savedApiKey,
      plainKey: key
    };
  }

  /**
   * List API keys for a workspace
   */
  async listApiKeys(workspaceId: string): Promise<ApiKey[]> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    return apiKeyRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get API key by ID
   */
  async getApiKey(id: string, workspaceId: string): Promise<ApiKey | null> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    return apiKeyRepository.findOne({
      where: { id, workspaceId }
    });
  }

  /**
   * Update API key
   */
  async updateApiKey(
    id: string,
    workspaceId: string,
    updates: {
      name?: string;
      description?: string;
      permissions?: string[];
      ipWhitelist?: string[];
      isActive?: boolean;
      expiresAt?: Date;
      updatedBy: string;
    }
  ): Promise<ApiKey | null> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const apiKey = await apiKeyRepository.findOne({
      where: { id, workspaceId }
    });

    if (!apiKey) {
      return null;
    }

    Object.assign(apiKey, updates);
    return apiKeyRepository.save(apiKey);
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id: string, workspaceId: string): Promise<boolean> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const result = await apiKeyRepository.delete({ id, workspaceId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(id: string, workspaceId: string, updatedBy: string): Promise<{ apiKey: ApiKey; plainKey: string } | null> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const apiKey = await apiKeyRepository.findOne({
      where: { id, workspaceId }
    });

    if (!apiKey) {
      return null;
    }

    const { key, hash, prefix } = this.generateApiKey();
    
    apiKey.keyHash = hash;
    apiKey.keyPrefix = prefix;
    apiKey.updatedBy = updatedBy;
    apiKey.lastUsedAt = undefined; // Reset usage tracking

    const savedApiKey = await apiKeyRepository.save(apiKey);
    
    return {
      apiKey: savedApiKey,
      plainKey: key
    };
  }

  /**
   * Check if API key has permission
   */
  hasPermission(apiKey: ApiKey, requiredPermission: string): boolean {
    // Check for wildcard permissions
    if (apiKey.permissions.includes('*')) {
      return true;
    }

    // Check for exact permission match
    if (apiKey.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check for namespace wildcard (e.g., 'read:*' matches 'read:contacts')
    const [action, resource] = requiredPermission.split(':');
    if (apiKey.permissions.includes(`${action}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * Validate IP address against whitelist
   */
  isIpAllowed(apiKey: ApiKey, clientIp: string): boolean {
    if (!apiKey.ipWhitelist || apiKey.ipWhitelist.length === 0) {
      return true; // No restrictions
    }

    return apiKey.ipWhitelist.includes(clientIp);
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(apiKeyId: string): Promise<{
    totalRequests: number;
    requestsLast30Days: number;
    lastUsedAt: Date | null;
    createdAt: Date;
  }> {
    // This would integrate with your API logging system
    // For now, returning basic info from the ApiKey entity
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const apiKey = await apiKeyRepository.findOne({
      where: { id: apiKeyId }
    });

    if (!apiKey) {
      return {
        totalRequests: 0,
        requestsLast30Days: 0,
        lastUsedAt: null,
        createdAt: new Date()
      };
    }

    return {
      totalRequests: 0, // Would be populated from API logs
      requestsLast30Days: 0, // Would be populated from API logs
      lastUsedAt: apiKey.lastUsedAt || null,
      createdAt: apiKey.createdAt
    };
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredKeys(): Promise<void> {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const now = new Date();

    const result = await apiKeyRepository.delete({
      expiresAt: LessThan(now)
    });

    console.log(`Cleaned up ${result.affected ?? 0} expired API keys`);
  }
}
