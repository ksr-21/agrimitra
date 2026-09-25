import { Request, Response, NextFunction } from 'express';

/**
 * Creates a middleware that restricts access to specific roles.
 * Usage: roleGuard('FARMER', 'ADMIN') — only farmers and admins can proceed.
 */
export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
