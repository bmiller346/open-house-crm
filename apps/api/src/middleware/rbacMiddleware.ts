import { Request, Response, NextFunction } from 'express';

export function rbacMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // TODO: Implement proper RBAC system with roles/permissions
    // For now, allow all authenticated users to proceed
    // const userRoles = 'roles' in req.user ? req.user.roles : [];
    // const hasRole = roles.some(role => userRoles.includes(role));
    // if (!hasRole) {
    //   return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    // }

    next();
  };
}
