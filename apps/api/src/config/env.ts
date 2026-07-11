/**
 * Environment Configuration — Validated at Startup
 *
 * WHY: Every env var is validated via Zod BEFORE the server starts.
 * If any variable is missing or invalid, the process crashes immediately
 * with a clear error message. This prevents silent runtime failures.
 *
 * HOW: We define a Zod schema that mirrors .env, parse process.env through it,
 * and export the typed result. Every other file imports `env` from here
 * instead of reading process.env directly.
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env file from the api directory
// In production, env vars are injected by the platform (Docker, EC2, etc.)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Zod schema for environment variables.
 *
 * Every variable has:
 * - A type (string, number, enum)
 * - A default value (for optional vars)
 * - A transform (e.g., string → number via coerce)
 *
 * Zod's .coerce handles the fact that ALL env vars arrive as strings.
 */
const envSchema = z.object({
  // ── Server ──────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),

  // ── Database ────────────────────────────────
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // ── JWT ─────────────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // ── CORS ────────────────────────────────────
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // ── AI Engine ───────────────────────────────
  AI_ENGINE_URL: z.string().url().default('http://localhost:8000'),
  AI_ENGINE_API_KEY: z.string().min(1, 'AI_ENGINE_API_KEY is required'),

  // ── Rate Limiting ───────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

/**
 * Parse and validate environment variables.
 *
 * safeParse returns { success, data, error } instead of throwing.
 * This lets us log a human-readable error before crashing.
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Exported typed environment object.
 *
 * Usage: import { env } from '@config/env';
 *        const port = env.PORT; // number, fully typed
 */
export const env = parsed.data;
