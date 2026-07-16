import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';
import { BM25 } from '../utils/bm25';

export class RankingService {
  /**
   * Calculates the cosine similarity between two vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Gets or generates an embedding for the job via the AI service.
   */
  private async getJobEmbedding(jobId: string, title: string, requirements: string | null): Promise<number[]> {
    const textToEmbed = `${title}. ${requirements || ''}`;
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/v1/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToEmbed })
      });
      if (response.ok) {
        const data = await response.json();
        return data.embedding;
      }
    } catch (err) {
      console.error('Failed to get job embedding:', err);
    }
    return [];
  }

  /**
   * Ranks candidates for a specific job using a hybrid matching system:
   *  - Groq AI evaluation score (40%) — semantic fit reasoning
   *  - Cosine embedding similarity (30%) — dense vector space match
   *  - BM25 sparse keyword score (30%) — keyword matching
   *  - Achievement priority bonus (+5 to +10 points) — prioritizing high achievers
   */
  async rankCandidatesForJob(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: { candidate: true }
        }
      }
    });

    if (!job) throw new NotFoundError('Job');

    let jobEmbedding = job.embedding;

    // Generate & cache job embedding if missing
    if (!jobEmbedding || jobEmbedding.length === 0) {
      jobEmbedding = await this.getJobEmbedding(job.id, job.title, job.requirements);
      if (jobEmbedding.length > 0) {
        await prisma.job.update({
          where: { id: job.id },
          data: { embedding: jobEmbedding }
        });
      }
    }

    // 1. Fetch candidate resumes to run BM25 and extract achievements
    const candidateIds = job.applications.map(app => app.candidateId).filter(Boolean);
    const resumes = await prisma.resume.findMany({
      where: {
        candidateId: { in: candidateIds }
      }
    });

    // Create mapping from candidateId to achievements and resume text for BM25
    const candidateResumesMap: Record<string, { rawText: string; achievements: string[] }> = {};
    const bm25Docs = [];

    for (const resume of resumes) {
      if (!resume.candidateId) continue;
      
      const parsedData = (resume.parsedData as any) || {};
      const achievements = parsedData.achievements || [];
      const rawText = resume.rawText || '';

      candidateResumesMap[resume.candidateId] = {
        rawText,
        achievements
      };

      // Combine raw resume text with parsed skills for BM25 indexing
      const skillsStr = parsedData.skills ? parsedData.skills.join(' ') : '';
      bm25Docs.push({
        id: resume.candidateId,
        text: `${rawText} ${skillsStr} ${parsedData.currentCompany || ''}`
      });
    }

    // 2. Initialize and fit BM25 model
    const bm25 = new BM25();
    bm25.fit(bm25Docs);
    const jobQuery = `${job.title} ${job.description} ${job.requirements || ''}`;
    const bm25Scores = bm25.search(jobQuery);

    const rankedApplications = [];

    for (const app of job.applications) {
      const candidate = app.candidate;
      const resumeInfo = candidateResumesMap[candidate.id] || { rawText: '', achievements: [] };

      // A. Cosine similarity score (0-100)
      let embeddingScore = 0;
      if (jobEmbedding && jobEmbedding.length > 0 && candidate.embedding && candidate.embedding.length > 0) {
        const raw = this.cosineSimilarity(jobEmbedding, candidate.embedding);
        embeddingScore = Math.max(0, Math.round(raw * 100));
      }

      // B. Groq AI score stored from when resume was processed (0-100)
      const aiScore = app.aiScore ?? 0;

      // C. BM25 Keyword score (0-100)
      const bm25Score = bm25Scores[candidate.id] || 0;

      // D. Achievement Priority Bonus (+5 points per achievement, capped at +10)
      const achievementsCount = resumeInfo.achievements.length;
      const achievementBonus = Math.min(10, achievementsCount * 5);

      // E. Hybrid Blend: 40% AI + 30% Embedding + 30% BM25 + Achievement Bonus
      let finalScore = Math.round(aiScore * 0.4 + embeddingScore * 0.3 + bm25Score * 0.3);
      finalScore = Math.min(100, finalScore + achievementBonus);

      rankedApplications.push({
        applicationId: app.id,
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          skills: candidate.skills,
          experienceYears: candidate.experienceYears,
          location: candidate.location,
        },
        aiScore,
        embeddingScore,
        bm25Score,
        achievements: resumeInfo.achievements,
        achievementBonus,
        finalScore,
        aiReasoning: app.aiReasoning || null,
        status: app.status,
      });
    }

    // Sort by finalScore descending, then add rank
    rankedApplications.sort((a, b) => b.finalScore - a.finalScore);
    const withRanks = rankedApplications.map((item, idx) => ({ ...item, rank: idx + 1 }));

    return {
      jobId: job.id,
      jobTitle: job.title,
      jobDepartment: job.department,
      totalCandidates: withRanks.length,
      rankedCandidates: withRanks,
    };
  }
}
