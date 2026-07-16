import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';

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
   * Ranks candidates for a specific job using a weighted blend of:
   *  - Groq AI evaluation score (70%) — semantic JD vs resume match
   *  - Cosine embedding similarity (30%) — vector space match
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

    const rankedApplications = [];

    for (const app of job.applications) {
      const candidate = app.candidate;

      // Cosine similarity score (0-100)
      let embeddingScore = 0;
      if (jobEmbedding && jobEmbedding.length > 0 && candidate.embedding && candidate.embedding.length > 0) {
        const raw = this.cosineSimilarity(jobEmbedding, candidate.embedding);
        embeddingScore = Math.max(0, Math.round(raw * 100));
      }

      // Groq AI score stored from when resume was processed (0-100)
      const aiScore = app.aiScore ?? 0;

      // Weighted final score: 70% AI (semantic JD match) + 30% embedding similarity
      const finalScore = Math.round(aiScore * 0.7 + embeddingScore * 0.3);

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
