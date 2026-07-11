/**
 * Health Check Controller
 *
 * WHY: Every production service needs a health check endpoint.
 * Load balancers (NGINX, ALB) poll this to decide if the instance
 * is healthy enough to receive traffic. Docker Compose uses it for
 * service dependency ordering.
 *
 * WHAT it checks:
 * - Server is running (obviously — if it responds, it's running)
 * - Database connection is alive (via a SELECT 1 query)
 *
 * RETURNS: 200 if healthy, 503 if any dependency is down.
 */

import { Request, Response, NextFunction } from 'express';
import { testDatabaseConnection } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/api-response';
import { env } from '../../config/env';

export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Test database connectivity
    const dbHealthy = await testDatabaseConnection();

    const healthData = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      services: {
        server: 'running',
        database: dbHealthy ? 'connected' : 'disconnected',
      },
    };

    if (!dbHealthy) {
      sendError(
        res,
        503,
        'SERVICE_UNAVAILABLE',
        'Database connection failed',
      );
      return;
    }

    sendSuccess(res, healthData);
  } catch (error) {
    next(error);
  }
}
