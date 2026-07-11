import {
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { candidates } from './candidates';
import { roles } from './roles';
import { applicationStatusEnum } from './enums';

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    status: applicationStatusEnum('status').notNull().default('applied'),
    matchScore: decimal('match_score', { precision: 3, scale: 2 }),
    aiReasoning: text('ai_reasoning'),
    notes: text('notes'),
    appliedAt: timestamp('applied_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_applications_candidate_id').on(table.candidateId),
    index('idx_applications_role_id').on(table.roleId),
    index('idx_applications_status').on(table.status),
    unique('uq_candidate_role').on(table.candidateId, table.roleId),
  ]
);
