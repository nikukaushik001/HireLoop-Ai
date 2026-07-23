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

  // Handle Multer upload errors
  if (err.message === 'Only PDF files are allowed' || (err as any).code === 'LIMIT_FILE_SIZE') {
    const msg = (err as any).code === 'LIMIT_FILE_SIZE' 
      ? 'The uploaded files are too large. Please ensure each PDF is under the 10MB limit.' 
      : 'Wrong file type. Only PDF files are allowed.';
    sendError(res, 400, 'BAD_REQUEST', msg);
    return;
  }

  // Handle unexpected errors
  console.error('🔥 Unexpected Error:', err);
  require('fs').appendFileSync('error.log', new Date().toISOString() + '\\n' + err.stack + '\\n\\n');
  sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on our end');
};
