/**
 * Database Connection — Drizzle ORM + PostgreSQL
 *
 * WHY Drizzle:
 * - No code generation step (unlike Prisma's `prisma generate`)
 * - SQL-like query builder — easier to debug, closer to actual SQL
 * - Excellent TypeScript inference from schema definitions
 * - ~35KB runtime vs Prisma's ~2MB
 *
 * HOW: We create a connection pool via node-postgres (`pg`),
 * then wrap it with Drizzle for type-safe queries.
 * The pool handles connection reuse automatically.
 *
 * POOL vs SINGLE CONNECTION:
 * A pool maintains multiple connections (default 10) and reuses them.
 * Without a pool, every query opens a new TCP connection → massive overhead.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool.
 *
 * max: 20 — good for a single Express instance.
 *   Rule of thumb: (2 * CPU cores) + disk spindles
 *   For most EC2 instances, 20 is a safe default.
 *
 * idleTimeoutMillis: 30s — connections sitting idle for 30s are released.
 *   Prevents holding connections that aren't being used.
 *
 * connectionTimeoutMillis: 5s — if a connection can't be established in 5s,
 *   something is wrong (DB down, network issue). Fail fast.
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Log pool errors.
 * Pool-level errors are rare but critical — usually means the DB crashed
 * or the connection string is wrong. We log but don't crash the process
 * because the pool will retry automatically.
 */
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

/**
 * Drizzle ORM instance.
 *
 * This is what you import in repositories to run queries:
 *   import { db } from '@config/database';
 *   const users = await db.select().from(usersTable);
 *
 * The `logger: true` option logs all SQL queries in development.
 */
export const db = drizzle(pool, {
  logger: env.NODE_ENV === 'development',
});

/**
 * Test the database connection.
 *
 * Called during server startup and by the health check endpoint.
 * Returns true if we can execute a simple query, false otherwise.
 *
 * Uses pool.query() directly (not Drizzle) because we need this
 * to work even before any schemas are defined.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection test failed');
    return false;
  }
}

/** Graceful shutdown — drain the pool when the process exits */
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}
