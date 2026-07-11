import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { institutionTypeEnum } from './enums';

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  location: varchar('location', { length: 255 }),
  type: institutionTypeEnum('type').notNull().default('university'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    category: varchar('category', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_skills_category').on(table.category)]
);
