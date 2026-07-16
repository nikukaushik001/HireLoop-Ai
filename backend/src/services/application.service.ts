import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';
import { EmailService } from './email.service';

export class ApplicationService {
  private emailService = new EmailService();

  /**
   * Fetch all interviews with full candidate + job + feedback context
   */
  async getAllInterviews() {
    return await prisma.interview.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        application: {
          include: {
            candidate: {
              select: { id: true, name: true, email: true }
            },
            job: {
              select: { id: true, title: true, department: true }
            }
          }
        }
      }
    });
  }

  /**
   * Update the status of an application
   */
  async updateApplicationStatus(jobId: string, appId: string, status: 'NEW' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED') {
    const application = await prisma.application.findFirst({
      where: { id: appId, jobId },
      include: { candidate: true, job: true }
    });

    if (!application) {
      throw new NotFoundError('Application');
    }

    const updated = await prisma.application.update({
      where: { id: appId },
      data: { status }
    });

    // If status changed to SHORTLISTED, trigger shortlist notification email
    if (status === 'SHORTLISTED' && application.candidate) {
      this.emailService.sendCandidateShortlistNotification(
        application.candidate.email,
        application.candidate.name,
        application.job.title
      ).catch(err => console.error('Failed to send shortlist email on status update:', err));
    }

    return updated;
  }

  /**
   * Send bulk shortlist emails to selected candidates and update their status to SHORTLISTED.
   */
  async notifyShortlistedCandidates(jobId: string, candidateIds: string[]) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError('Job');

    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } }
    });

    for (const candidate of candidates) {
      // 1. Send the email
      this.emailService.sendCandidateShortlistNotification(
        candidate.email,
        candidate.name,
        job.title
      ).catch(err => console.error(`Failed to send shortlist email to ${candidate.email}:`, err));

      // 2. Update status to SHORTLISTED in database
      await prisma.application.update({
        where: {
          candidateId_jobId: { jobId, candidateId: candidate.id }
        },
        data: { status: 'SHORTLISTED' }
      }).catch(err => console.error(`Failed to update application status for ${candidate.name}:`, err));
    }

    return { success: true, count: candidates.length };
  }

  /**
   * Schedule an interview for an application
   */
  async scheduleInterview(jobId: string, appId: string, data: { scheduledAt: Date; durationMinutes: number; interviewerName: string; meetingLink?: string }) {
    const application = await prisma.application.findFirst({
      where: { id: appId, jobId },
      include: { candidate: true, job: true }
    });

    if (!application) {
      throw new NotFoundError('Application');
    }

    // Also update application status to INTERVIEWING
    await prisma.application.update({
      where: { id: appId },
      data: { status: 'INTERVIEWING' }
    });

    const interview = await prisma.interview.create({
      data: {
        applicationId: appId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        interviewerName: data.interviewerName,
        meetingLink: data.meetingLink
      }
    });

    // Send interview email invitation
    if (application.candidate) {
      this.emailService.sendInterviewScheduled(
        application.candidate.email,
        application.candidate.name,
        application.job.title,
        data.scheduledAt,
        data.meetingLink,
        data.interviewerName
      ).catch(err => console.error('Failed to send interview invitation email:', err));
    }

    return interview;
  }

  /**
   * Submit feedback for an interview
   */
  async submitInterviewFeedback(interviewId: string, data: { rating: number; feedbackText: string; recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' }) {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: { candidate: true, job: true }
        }
      }
    });

    if (!interview) {
      throw new NotFoundError('Interview');
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'COMPLETED',
        rating: data.rating,
        feedbackText: data.feedbackText,
        recommendation: data.recommendation
      }
    });

    // Send interview feedback email update to the candidate
    const app = interview.application;
    if (app && app.candidate) {
      // Human friendly status representation based on recommendation
      const statusText = data.recommendation === 'STRONG_HIRE' || data.recommendation === 'HIRE' 
        ? 'COMPLETED (Positive recommendation)' 
        : 'COMPLETED (Under review)';

      this.emailService.sendInterviewFeedbackNotification(
        app.candidate.email,
        app.candidate.name,
        app.job.title,
        statusText
      ).catch(err => console.error('Failed to send interview feedback email:', err));
    }

    return updatedInterview;
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    const totalJobs = await prisma.job.count();
    const totalCandidates = await prisma.candidate.count();
    const totalResumes = await prisma.resume.count();
    const upcomingInterviews = await prisma.interview.count({
      where: { status: 'SCHEDULED' }
    });

    return {
      totalJobs,
      totalCandidates,
      totalResumes,
      upcomingInterviews
    };
  }

  /**
   * Get future role recommendations for a candidate based on embeddings
   */
  async getRecommendedJobs(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        applications: {
          select: { jobId: true }
        }
      }
    });

    if (!candidate || !candidate.embedding || candidate.embedding.length === 0) {
        return [];
    }

    const allJobs = await prisma.job.findMany({
      where: { status: 'OPEN' }
    });

    const appliedJobIds = new Set(candidate.applications.map(app => app.jobId));
    const recommendations = [];

    for (const job of allJobs) {
      if (appliedJobIds.has(job.id)) continue;
      if (!job.embedding || job.embedding.length === 0) continue;

      const score = this.cosineSimilarity(candidate.embedding, job.embedding);
      const percentage = Math.max(0, Math.round(score * 100));

      if (percentage > 50) { 
        recommendations.push({
          job,
          score: percentage
        });
      }
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
