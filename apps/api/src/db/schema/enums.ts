import { pgEnum } from 'drizzle-orm/pg-core';

// ── Users ────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'recruiter',
  'interviewer',
]);

// ── Candidates ───────────────────────────────────────────────────
export const candidateStatusEnum = pgEnum('candidate_status', [
  'new',
  'screening',
  'interviewing',
  'offered',
  'hired',
  'rejected',
  'archived',
]);

// ── Resumes ──────────────────────────────────────────────────────
export const parseStatusEnum = pgEnum('parse_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

// ── Roles ────────────────────────────────────────────────────────
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
]);

export const roleStatusEnum = pgEnum('role_status', [
  'draft',
  'open',
  'paused',
  'closed',
  'filled',
]);

// ── Applications ─────────────────────────────────────────────────
export const applicationStatusEnum = pgEnum('application_status', [
  'applied',
  'screening',
  'shortlisted',
  'interviewing',
  'offered',
  'hired',
  'rejected',
  'withdrawn',
]);

// ── Interviews ───────────────────────────────────────────────────
export const interviewTypeEnum = pgEnum('interview_type', [
  'phone',
  'video',
  'onsite',
  'technical',
  'hr',
]);

export const interviewStatusEnum = pgEnum('interview_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

export const recommendationEnum = pgEnum('recommendation_status', [
  'strong_hire',
  'hire',
  'no_hire',
  'strong_no_hire',
]);

// ── Taxonomy (Institutions & Skills) ─────────────────────────────
export const institutionTypeEnum = pgEnum('institution_type', [
  'university',
  'college',
  'bootcamp',
  'online',
  'other',
]);

export const proficiencyEnum = pgEnum('proficiency_level', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const skillSourceEnum = pgEnum('skill_source', [
  'resume',
  'manual',
  'ai',
]);
