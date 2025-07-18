import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Using any for user attachment to avoid TypeScript conflicts

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('🔍 Auth middleware - token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  // Demo mode: accept demo token for development
  if (token === 'demo-jwt-token-12345') {
    (req as any).user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440000',
      workspaceId: '9e40238f-af1c-4ec0-bd4f-f7968a694599', // Using existing demo workspace
      roles: ['admin', 'read:contacts', 'create:contacts', 'update:contacts', 'delete:contacts']
    };
    console.log('🔍 Demo user set:', req.user);
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as any;
    // Attach user payload
    (req as any).user = decoded;
    // If workspaceId not explicitly provided, use first workspace from workspaces array
    if (!(req as any).user.workspaceId && Array.isArray(decoded.workspaces) && decoded.workspaces.length > 0) {
      (req as any).user.workspaceId = decoded.workspaces[0];
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
