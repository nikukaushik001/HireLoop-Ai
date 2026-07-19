import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/api-error';

const authService = new AuthService();

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = authService.verifyToken(token, env.JWT_ACCESS_SECRET);
    req.user = decoded; // Attached to request for use in controllers
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
  requireAuth(req, _res, (err?: any) => {
    if (err) return next(err);
    
    if (req.user?.role !== 'SUPERADMIN') {
      return next(new UnauthorizedError('Superadmin access required'));
    }
    next();
  });
};
