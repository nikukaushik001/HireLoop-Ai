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
    require('fs').appendFileSync('app_error.log', new Date().toISOString() + '\\nAppError: ' + err.statusCode + ' - ' + err.message + '\\n\\n');
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Handle unexpected errors
  console.error('🔥 Unexpected Error:', err);
  require('fs').appendFileSync('error.log', new Date().toISOString() + '\\n' + err.stack + '\\n\\n');
  sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on our end');
};
