import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { applications } from './applications';
import { users } from './users';
import { interviewTypeEnum, interviewStatusEnum, recommendationEnum } from './enums';

export const interviews = pgTable(
  'interviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    applicationId: uuid('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    interviewerId: uuid('interviewer_id')
      .notNull()
      .references(() => users.id),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(60),
    type: interviewTypeEnum('type').notNull().default('video'),
    location: text('location'),
    meetingLink: text('meeting_link'),
    status: interviewStatusEnum('status').notNull().default('scheduled'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_interviews_app_id').on(table.applicationId),
    index('idx_interviews_interviewer_id').on(table.interviewerId),
    index('idx_interviews_scheduled_at').on(table.scheduledAt),
    index('idx_interviews_status').on(table.status),
  ]
);

export const interviewFeedback = pgTable(
  'interview_feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    interviewId: uuid('interview_id')
      .notNull()
      .references(() => interviews.id, { onDelete: 'cascade' }),
    interviewerId: uuid('interviewer_id')
      .notNull()
      .references(() => users.id),
    overallScore: integer('overall_score').notNull(),
    technicalScore: integer('technical_score'),
    communicationScore: integer('communication_score'),
    cultureFitScore: integer('culture_fit_score'),
    strengths: text('strengths'),
    weaknesses: text('weaknesses'),
    notes: text('notes'),
    recommendation: recommendationEnum('recommendation').notNull(),
    aiSummary: text('ai_summary'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_feedback_interview_id').on(table.interviewId),
    index('idx_feedback_interviewer_id').on(table.interviewerId),
    unique('uq_interview_interviewer').on(table.interviewId, table.interviewerId),
  ]
);
