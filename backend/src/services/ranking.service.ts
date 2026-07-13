import { prisma } from '../config/db';
import { AppError, NotFoundError } from '../utils/api-error';

export class RankingService {
  /**
   * Calculates the cosine similarity between two vectors.
   */
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

  /**
   * Generates embedding for a job by calling the AI service
   */
  private async getJobEmbedding(jobId: string, title: string, requirements: string | null): Promise<number[]> {
    const textToEmbed = `${title}. ${requirements || ''}`;
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    // We would need a new endpoint on the AI service to just get an embedding
    // For now, let's pretend we have one, or just return an empty array if it fails.
    // Actually, let's implement a simple fetch.
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
    
    // Return empty if fails
    return [];
  }

  /**
   * Ranks candidates for a specific job based on embedding similarity.
   */
  async rankCandidatesForJob(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: { include: { candidate: true } } }
    });

    if (!job) throw new NotFoundError('Job');

    let jobEmbedding = job.embedding;

    // If the job has no embedding, we must generate it (or just return 0s for now)
    // To make it fully functional, we should generate it when the job is created.
    if (!jobEmbedding || jobEmbedding.length === 0) {
      jobEmbedding = await this.getJobEmbedding(job.id, job.title, job.requirements);
      // Save it back to the job
      if (jobEmbedding.length > 0) {
        await prisma.job.update({
            where: { id: job.id },
            data: { embedding: jobEmbedding }
        });
      }
    }

    if (!jobEmbedding || jobEmbedding.length === 0) {
        throw new AppError('Job embedding not available for ranking.', 400, 'NO_EMBEDDING');
    }

    // Now calculate similarity for all candidates who applied
    const rankedApplications = [];
    
    for (const app of job.applications) {
        const candidate = app.candidate;
        
        if (!candidate.embedding || candidate.embedding.length === 0) {
            rankedApplications.push({
                applicationId: app.id,
                candidate: {
                    id: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    skills: candidate.skills,
                },
                score: 0,
                status: app.status
            });
            continue;
        }

        const score = this.cosineSimilarity(jobEmbedding, candidate.embedding);
        
        // Convert to percentage (0-100)
        // Cosine similarity is between -1 and 1, but for text embeddings usually 0 to 1
        const percentageScore = Math.max(0, Math.round(score * 100));

        // Update the application with the new score
        await prisma.application.update({
            where: { id: app.id },
            data: { aiScore: percentageScore }
        });

        rankedApplications.push({
            applicationId: app.id,
            candidate: {
                id: candidate.id,
                name: candidate.name,
                email: candidate.email,
                skills: candidate.skills,
            },
            score: percentageScore,
            status: app.status
        });
    }

    // Sort by highest score first
    rankedApplications.sort((a, b) => b.score - a.score);

    return {
        jobId: job.id,
        jobTitle: job.title,
        rankedCandidates: rankedApplications
    };
  }
}
