import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service';
import { env } from '../config/env';
import { AppError, UnauthorizedError } from '../utils/api-error';

/**
 * Middleware to protect routes by requiring a valid JWT Access Token.
 * 
 * If valid, the decoded user payload is attached to `req.user`.
 * If missing, invalid, or expired, throws a 401 Unauthorized error.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  // 1. Extract token from Authorization header (e.g., "Bearer eyJhbGci...")
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using the access secret
    const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);
    
    // 3. Attach the payload to the Request object
    // (TypeScript is happy because we augmented Express.Request in types/express/index.d.ts)
    req.user = decoded;
    
    // 4. Proceed to the next middleware/controller
    next();
  } catch (error) {
    // verifyToken already throws an AppError if invalid, but we catch it just in case
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

