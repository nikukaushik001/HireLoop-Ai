/**
 * Express Application — Main Entry Point
 *
 * This file assembles the entire Express application:
 * 1. Creates the Express instance
 * 2. Registers middleware in the correct order
 * 3. Mounts route modules
 * 4. Registers error handlers (must be LAST)
 * 5. Starts the HTTP server
 * 6. Handles graceful shutdown
 *
 * MIDDLEWARE ORDER MATTERS:
 * Security → Parsing → Logging → Routes → 404 → Error Handler
 *
 * WHY this order:
 * - Helmet/CORS before routes: responses always have security headers
 * - Rate limiter before routes: prevents abuse before any work is done
 * - Body parser before routes: req.body is available in controllers
 * - 404 handler after routes: catches unmatched paths
 * - Error handler last: catches errors thrown by any route/middleware
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './utils/logger';
import { globalErrorHandler } from './middleware/error.middleware';
import { sendError } from './utils/api-response';
import { swaggerSpec } from './config/swagger';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database';

// ── Route imports ────────────────────────────────────────────
import healthRoutes from './modules/health/health.routes';

// ── Create Express app ───────────────────────────────────────
const app = express();

// ══════════════════════════════════════════════════════════════
// MIDDLEWARE PIPELINE (order is critical)
// ══════════════════════════════════════════════════════════════

// 1. HTTP request logging (Pino)
//    Logs method, URL, status code, response time for every request
app.use(
  pinoHttp({
    logger,
    // Don't log health check requests (too noisy in production)
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health',
    },
  })
);

// 2. Security headers (Helmet)
//    Sets X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.
//    Must come before any route so ALL responses have these headers
app.use(helmet());

// 3. CORS (Cross-Origin Resource Sharing)
//    Only the frontend origin is allowed to make requests
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Allow cookies (for refresh token)
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Rate limiting
//    Prevents brute force attacks and API abuse
//    100 requests per 15 minutes per IP (configurable via env)
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
  })
);

// 5. Body parsers
//    Parse JSON bodies (limit 10MB for resume data)
app.use(express.json({ limit: '10mb' }));
//    Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ══════════════════════════════════════════════════════════════
// API DOCUMENTATION
// ══════════════════════════════════════════════════════════════

// Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HireLoop API Docs',
}));

// Raw OpenAPI spec as JSON (for code generators, Postman import, etc.)
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ══════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════

// All API routes are prefixed with /api/v1
app.use('/api/v1', healthRoutes);

// ══════════════════════════════════════════════════════════════
// ERROR HANDLING (must come AFTER all routes)
// ══════════════════════════════════════════════════════════════

// 404 handler — no route matched the request
app.use((_req, res) => {
  sendError(res, 404, 'NOT_FOUND', 'The requested endpoint does not exist');
});

// Global error handler — catches all errors from routes/middleware
app.use(globalErrorHandler);

// ══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ══════════════════════════════════════════════════════════════

async function startServer(): Promise<void> {
  // Test database connection before starting
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    logger.info('✅ Database connected successfully');
  } else {
    logger.warn('⚠️ Database connection failed — server starting without DB');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 HireLoop API running on http://localhost:${env.PORT}`);
    logger.info(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  });

  // ── Graceful Shutdown ──────────────────────────────────────
  // When the process receives SIGTERM (Docker stop) or SIGINT (Ctrl+C),
  // we close the HTTP server and database pool before exiting.
  // This prevents in-flight requests from being dropped.
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      await closeDatabaseConnection();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long (10s)
    setTimeout(() => {
      logger.error('Forced shutdown — graceful shutdown timed out');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();

export default app;
