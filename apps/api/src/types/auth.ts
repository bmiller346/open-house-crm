import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  workspaceId: string;
  roles?: string[];
  userId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
