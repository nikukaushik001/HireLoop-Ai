import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';
import { candidates, candidateTimeline, candidateSkills } from './candidates';
import { resumes } from './resumes';
import { roles } from './roles';
import { applications } from './applications';
import { interviews, interviewFeedback } from './interviews';
import { skills } from './taxonomy';

// ── Organizations ────────────────────────────────────────────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  candidates: many(candidates),
  roles: many(roles),
}));

// ── Users ────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  createdCandidates: many(candidates),
  createdRoles: many(roles),
  conductedInterviews: many(interviews),
  submittedFeedback: many(interviewFeedback),
}));

// ── Candidates ───────────────────────────────────────────────────
export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [candidates.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [candidates.createdBy],
    references: [users.id],
  }),
  resumes: many(resumes),
  timeline: many(candidateTimeline),
  skills: many(candidateSkills),
  applications: many(applications),
}));

export const candidateTimelineRelations = relations(
  candidateTimeline,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidateTimeline.candidateId],
      references: [candidates.id],
    }),
    performedBy: one(users, {
      fields: [candidateTimeline.performedBy],
      references: [users.id],
    }),
  })
);

export const candidateSkillsRelations = relations(
  candidateSkills,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidateSkills.candidateId],
      references: [candidates.id],
    }),
    skill: one(skills, {
      fields: [candidateSkills.skillId],
      references: [skills.id],
    }),
  })
);

// ── Skills ───────────────────────────────────────────────────────
export const skillsRelations = relations(skills, ({ many }) => ({
  candidates: many(candidateSkills),
}));

// ── Resumes ──────────────────────────────────────────────────────
export const resumesRelations = relations(resumes, ({ one }) => ({
  candidate: one(candidates, {
    fields: [resumes.candidateId],
    references: [candidates.id],
  }),
  uploadedBy: one(users, {
    fields: [resumes.uploadedBy],
    references: [users.id],
  }),
}));

// ── Roles ────────────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [roles.createdBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

// ── Applications ─────────────────────────────────────────────────
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  role: one(roles, {
    fields: [applications.roleId],
    references: [roles.id],
  }),
  interviews: many(interviews),
}));

// ── Interviews ───────────────────────────────────────────────────
export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
  feedback: many(interviewFeedback),
}));

export const interviewFeedbackRelations = relations(
  interviewFeedback,
  ({ one }) => ({
    interview: one(interviews, {
      fields: [interviewFeedback.interviewId],
      references: [interviews.id],
    }),
    interviewer: one(users, {
      fields: [interviewFeedback.interviewerId],
      references: [users.id],
    }),
  })
);
