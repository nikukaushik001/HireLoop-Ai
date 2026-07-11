import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  integer,
  jsonb,
  primaryKey,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';
import { skills } from './taxonomy';
import { candidateStatusEnum, proficiencyEnum, skillSourceEnum } from './enums';

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 384})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

export const candidates = pgTable(
  'candidates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    linkedinUrl: text('linkedin_url'),
    githubUrl: text('github_url'),
    portfolioUrl: text('portfolio_url'),
    currentCompany: varchar('current_company', { length: 255 }),
    currentTitle: varchar('current_title', { length: 255 }),
    experienceYears: integer('experience_years'),
    location: varchar('location', { length: 255 }),
    summary: text('summary'),
    status: candidateStatusEnum('status').notNull().default('new'),
    source: varchar('source', { length: 100 }),
    embedding: vector('embedding', { dimensions: 384 }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_candidates_org_id').on(table.organizationId),
    index('idx_candidates_status').on(table.status),
    // IVFFlat index for vector search would be added via raw SQL in migration
    // since Drizzle currently has limited support for specialized index types
  ]
);

export const candidateTimeline = pgTable(
  'candidate_timeline',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    metadata: jsonb('metadata'),
    performedBy: uuid('performed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_timeline_candidate_id').on(table.candidateId),
    index('idx_timeline_event_type').on(table.eventType),
  ]
);

export const candidateSkills = pgTable(
  'candidate_skills',
  {
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    proficiency: proficiencyEnum('proficiency'),
    yearsOfExperience: integer('years_of_experience'),
    source: skillSourceEnum('source').notNull().default('ai'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.candidateId, table.skillId] })]
);
