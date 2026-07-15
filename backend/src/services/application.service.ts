import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';

export class ApplicationService {
  /**
   * Update the status of an application
   */
  async updateApplicationStatus(jobId: string, appId: string, status: 'NEW' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED') {
    const application = await prisma.application.findFirst({
      where: { id: appId, jobId }
    });

    if (!application) {
      throw new NotFoundError('Application');
    }

    return await prisma.application.update({
      where: { id: appId },
      data: { status }
    });
  }

  /**
   * Schedule an interview for an application
   */
  async scheduleInterview(jobId: string, appId: string, data: { scheduledAt: Date; durationMinutes: number; interviewerName: string; meetingLink?: string }) {
    const application = await prisma.application.findFirst({
      where: { id: appId, jobId }
    });

    if (!application) {
      throw new NotFoundError('Application');
    }

    // Also update application status to INTERVIEWING
    await prisma.application.update({
      where: { id: appId },
      data: { status: 'INTERVIEWING' }
    });

    return await prisma.interview.create({
      data: {
        applicationId: appId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        interviewerName: data.interviewerName,
        meetingLink: data.meetingLink
      }
    });
  }

  /**
   * Submit feedback for an interview
   */
  async submitInterviewFeedback(interviewId: string, data: { rating: number; feedbackText: string; recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' }) {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId }
    });

    if (!interview) {
      throw new NotFoundError('Interview');
    }

    return await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'COMPLETED',
        rating: data.rating,
        feedbackText: data.feedbackText,
        recommendation: data.recommendation
      }
    });
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
          select: { jobId: true } // to filter out jobs they already applied for
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

      if (percentage > 50) { // arbitrary threshold
        recommendations.push({
          job,
          score: percentage
        });
      }
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5); // top 5
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
