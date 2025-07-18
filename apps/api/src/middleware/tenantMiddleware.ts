import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce tenant context via workspace ID.
 * It checks for an 'X-Workspace-ID' header and attaches it to the request object.
 * This ensures that all subsequent operations are scoped to the correct workspace.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const workspaceId = req.headers['x-workspace-id'] as string;

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required header: X-Workspace-ID',
      message: 'All requests must be scoped to a workspace.',
    });
  }

  // Attach workspaceId to the request object for use in subsequent middleware/handlers
  (req as any).workspaceId = workspaceId;
  
  // Also, let's ensure it's on the user object for consistency with other parts of the app
  if ((req as any).user) {
    (req as any).user.workspaceId = workspaceId;
  }

  console.log(`✅ Tenant context set for Workspace ID: ${workspaceId}`);
  next();
}
