import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  integer,
  jsonb,
  boolean,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { candidates } from './candidates';
import { users } from './users';
import { parseStatusEnum } from './enums';

export const resumes = pgTable(
  'resumes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 50 }).notNull().default('application/pdf'),
    rawText: text('raw_text'),
    parsedData: jsonb('parsed_data'),
    aiScore: decimal('ai_score', { precision: 3, scale: 2 }),
    parseStatus: parseStatusEnum('parse_status')
      .notNull()
      .default('pending'),
    parsedAt: timestamp('parsed_at', { withTimezone: true }),
    isPrimary: boolean('is_primary').notNull().default(false),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_resumes_candidate_id').on(table.candidateId),
    index('idx_resumes_parse_status').on(table.parseStatus),
  ]
);
