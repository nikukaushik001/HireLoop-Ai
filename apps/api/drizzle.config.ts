/**
 * Drizzle Kit Configuration
 *
 * Used by the drizzle-kit CLI for:
 * - `db:generate` — Generate SQL migration files from schema changes
 * - `db:migrate`  — Apply migrations to the database
 * - `db:studio`   — Open Drizzle Studio (visual DB browser)
 *
 * Points to:
 * - schema: All table definitions in src/db/schema/
 * - out: Generated migrations go to src/db/migrations/
 * - dbCredentials: Uses DATABASE_URL from .env
 */

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
