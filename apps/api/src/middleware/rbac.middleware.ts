import { Request, Response, NextFunction } from 'express';
import { AppError, ForbiddenError } from '../utils/api-error';

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 * MUST be used AFTER `requireAuth` middleware, since it relies on `req.user`.
 * 
 * @param allowedRoles - Array of roles permitted to access the route
 * 
 * @example
 * router.delete('/candidates/:id', requireAuth, requireRole(['admin', 'recruiter']), deleteCandidate);
 */
export const requireRole = (allowedRoles: ('admin' | 'recruiter' | 'interviewer')[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // 1. Ensure req.user exists (fail-safe if developer forgot requireAuth)
    if (!req.user) {
      return next(new AppError('requireRole must be used after requireAuth', 500, 'INTERNAL_ERROR', false));
    }

    // 2. Check if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    // 3. Proceed if authorized
    next();
  };
};
