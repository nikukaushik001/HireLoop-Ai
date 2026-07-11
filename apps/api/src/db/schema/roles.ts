import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  integer,
  jsonb,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';
import { employmentTypeEnum, roleStatusEnum } from './enums';

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 384})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    requirements: jsonb('requirements'),
    department: varchar('department', { length: 100 }),
    location: varchar('location', { length: 255 }),
    employmentType: employmentTypeEnum('employment_type')
      .notNull()
      .default('full_time'),
    experienceMin: integer('experience_min'),
    experienceMax: integer('experience_max'),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    status: roleStatusEnum('status').notNull().default('draft'),
    embedding: vector('embedding', { dimensions: 384 }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_roles_org_id').on(table.organizationId),
    index('idx_roles_status').on(table.status),
  ]
);
