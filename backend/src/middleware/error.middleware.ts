import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/api-error';
import { sendError } from '../utils/api-response';

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Handle unexpected errors
  console.error('🔥 Unexpected Error:', err);
  sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on our end');
};
