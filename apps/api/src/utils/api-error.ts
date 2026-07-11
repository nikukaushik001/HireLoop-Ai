/**
 * Custom Error Classes — Error Hierarchy
 *
 * WHY custom errors:
 * - Standard Error has no HTTP status code — we need it for the error middleware
 * - We want to distinguish "expected" errors (validation, not found) from
 *   "unexpected" errors (null pointer, DB crash)
 * - Custom errors carry structured data (code, statusCode, details) that
 *   the global error handler serializes into consistent JSON responses
 *
 * HIERARCHY:
 *   AppError (base)
 *     ├── ValidationError (400/422)
 *     ├── UnauthorizedError (401)
 *     ├── ForbiddenError (403)
 *     ├── NotFoundError (404)
 *     ├── ConflictError (409)
 *     └── RateLimitError (429)
 *
 * HOW: Any service/controller throws these. The global error handler catches
 * them, checks `instanceof AppError`, and returns the right HTTP response.
 * Unknown errors get 500.
 */

/**
 * Base application error.
 *
 * isOperational: true = expected error (bad input, not found)
 *                false = programmer error (should crash and restart)
 *
 * This distinction matters in production:
 * - Operational errors → return error response, keep server running
 * - Programmer errors → log, alert, potentially restart process
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown[];

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace in V8 (removes constructor from trace)
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly (required for instanceof to work with TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — Malformed request syntax */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown[]) {
    super(message, 400, 'BAD_REQUEST', true, details);
  }
}

/** 422 — Request is well-formed but contains invalid data */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown[]) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
  }
}

/** 401 — Missing or invalid authentication credentials */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 — Valid credentials but insufficient permissions */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 — Resource does not exist */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/** 409 — Resource already exists (e.g., duplicate email) */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/** 429 — Too many requests */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}
