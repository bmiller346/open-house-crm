import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/ApiKeyService';

const apiKeyService = new ApiKeyService();

export interface ApiKeyRequest extends Request {
  apiKey?: {
    id: string;
    workspaceId: string;
    permissions: string[];
    name: string;
  };
}

/**
 * Middleware to authenticate API key requests
 */
export const apiKeyAuth = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Extract API key from Authorization header
    const apiKey = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key format'
      });
    }

    // Verify the API key
    const validatedKey = await apiKeyService.verifyApiKey(apiKey);
    
    if (!validatedKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key'
      });
    }

    // Check IP whitelist if configured
    const clientIp = req.ip || req.connection.remoteAddress || '';
    if (!apiKeyService.isIpAllowed(validatedKey, clientIp)) {
      return res.status(403).json({
        success: false,
        message: 'IP address not allowed'
      });
    }

    // Attach API key info to request
    req.apiKey = {
      id: validatedKey.id,
      workspaceId: validatedKey.workspaceId,
      permissions: validatedKey.permissions,
      name: validatedKey.name
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check API key permissions
 */
export const requireApiPermission = (requiredPermission: string) => {
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const hasPermission = apiKeyService.hasPermission(
      { permissions: req.apiKey.permissions } as any,
      requiredPermission
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${requiredPermission}`
      });
    }

    next();
  };
};

/**
 * Combined middleware for API key authentication and permission checking
 */
export const apiKeyAuthWithPermission = (permission: string) => {
  return [apiKeyAuth, requireApiPermission(permission)];
};
