/**
 * Standardized API Response Builders
 *
 * WHY: Every API response must have the same shape:
 *   Success → { success: true, data, meta? }
 *   Error   → { success: false, error: { code, message, details? } }
 *
 * Without these builders, developers will inevitably use different shapes
 * in different controllers. The frontend team shouldn't have to guess.
 *
 * HOW: Controller calls sendSuccess() or sendError() — these functions
 * set the status code and JSON body in one call. Impossible to forget
 * the response shape.
 */

import { Response } from 'express';

/** Pagination metadata for list endpoints */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Full response metadata */
interface ResponseMeta extends Partial<PaginationMeta> {
  timestamp?: string;
  [key: string]: unknown;
}

/** Error detail for validation errors */
interface ErrorDetail {
  field?: string;
  message: string;
}

/**
 * Send a success response.
 *
 * @param res     - Express Response object
 * @param data    - Response payload (object, array, null)
 * @param statusCode - HTTP status (default 200)
 * @param meta    - Optional metadata (pagination, timestamps)
 *
 * Usage:
 *   sendSuccess(res, { id: '123', name: 'Jane' });
 *   sendSuccess(res, candidates, 200, { page: 1, limit: 20, total: 150, totalPages: 8 });
 *   sendSuccess(res, null, 201); // Created, no body needed
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ResponseMeta
): void {
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

/**
 * Send an error response.
 *
 * @param res        - Express Response object
 * @param statusCode - HTTP status (400, 401, 404, 500, etc.)
 * @param code       - Machine-readable error code (e.g., 'VALIDATION_ERROR')
 * @param message    - Human-readable error message
 * @param details    - Optional array of field-level errors
 *
 * Usage:
 *   sendError(res, 404, 'NOT_FOUND', 'Candidate not found');
 *   sendError(res, 422, 'VALIDATION_ERROR', 'Invalid input', [
 *     { field: 'email', message: 'Invalid email format' }
 *   ]);
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ErrorDetail[]
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 && { details }),
    },
  });
}

/**
 * Send a 204 No Content response (for DELETE operations).
 * No body is sent — this is the HTTP standard for successful deletions.
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
