/**
 * Structured Logger — Pino
 *
 * WHY Pino over Winston:
 * - 5x faster (benchmarked) — Pino uses worker threads for serialization
 * - Structured JSON by default — perfect for log aggregation (ELK, Datadog)
 * - Minimal config — works great out of the box
 * - pino-pretty for human-readable dev output
 *
 * HOW: We create a single logger instance and export it.
 * In development → pretty-printed colored output
 * In production → raw JSON (for log aggregation tools)
 */

import pino from 'pino';
import { env } from '../config/env';

/**
 * Logger configuration.
 *
 * level: 'debug' in development shows everything.
 *        'info' in production hides debug noise.
 *
 * transport: pino-pretty is ONLY loaded in development.
 *            In production, raw JSON goes to stdout where
 *            a log shipper (Fluent Bit, Filebeat) picks it up.
 */
export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',

  // pino-pretty for development readability
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  }),

  // Base context added to every log line
  base: {
    service: 'hireloop-api',
    env: env.NODE_ENV,
  },
});
