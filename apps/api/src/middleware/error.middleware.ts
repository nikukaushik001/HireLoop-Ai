/**
 * Global Error Handler Middleware
 *
 * WHY: Without a global error handler, Express returns HTML error pages
 * or crashes on unhandled errors. This middleware:
 * 1. Catches ALL errors from any route/middleware
 * 2. Returns consistent JSON error responses
 * 3. Distinguishes operational errors from programmer errors
 * 4. Logs errors with full context for debugging
 *
 * HOW: Express identifies error-handling middleware by its 4-parameter
 * signature: (err, req, res, next). This must be the LAST middleware
 * registered — after all routes.
 *
 * IMPORTANT: The unused `next` parameter MUST stay in the signature.
 * Express uses the parameter count to identify this as an error handler.
 * Removing it would make Express treat it as a regular middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/api-error';
import { sendError } from '../utils/api-response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Global error handler.
 *
 * Flow:
 * 1. Check if it's an AppError (our custom error hierarchy)
 *    → Return the error's statusCode, code, and message
 * 2. Check for known third-party errors (Zod, JSON parse, etc.)
 *    → Map them to appropriate HTTP status codes
 * 3. Unknown error → 500 Internal Server Error
 *    → In development: include stack trace
 *    → In production: generic message (don't leak internals)
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Our custom AppError hierarchy ──────────────────────────
  if (err instanceof AppError) {
    logger.warn(
      {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    sendError(
      res,
      err.statusCode,
      err.code,
      err.message,
      err.details as Array<{ field?: string; message: string }>
    );
    return;
  }

  // ── JSON syntax error (malformed request body) ─────────────
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn({ path: req.path }, 'Malformed JSON in request body');
    sendError(res, 400, 'BAD_REQUEST', 'Malformed JSON in request body');
    return;
  }

  // ── Unknown / unexpected error ─────────────────────────────
  // This is a programmer error — log the full stack trace
  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      body: req.body,
    },
    'Unhandled error'
  );

  // In production, NEVER leak error details to the client
  const message =
    env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred';

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message);
}
