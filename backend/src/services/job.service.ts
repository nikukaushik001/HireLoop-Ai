import { prisma } from '../config/db';
import { NotFoundError, AppError } from '../utils/api-error';
import { env } from '../config/env';

export interface CreateJobDTO {
  title: string;
  description: string;
  requirements?: string;
  department?: string;
}

export class JobService {
  async createJob(userId: string, data: CreateJobDTO) {
    // Prevent duplicate job titles for the same recruiter
    const existingJob = await prisma.job.findFirst({
      where: {
        title: data.title,
        createdBy: userId,
        status: 'OPEN'
      }
    });

    if (existingJob) {
      throw new AppError('You already have an active job posting with this exact title.', 400);
    }

    let embedding: number[] = [];
    try {
      const textToEmbed = `${data.title} ${data.department || ''} ${data.description} ${data.requirements || ''}`;
      const res = await fetch(`${env.AI_SERVICE_URL}/api/v1/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToEmbed })
      });
      if (res.ok) {
        const aiData = await res.json();
        if (aiData.success && aiData.embedding) {
          embedding = aiData.embedding;
        }
      }
    } catch (err) {
      console.error('Failed to generate job embedding:', err);
    }

    return await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        department: data.department,
        createdBy: userId,
        embedding: embedding,
      },
    });
  }

  async getAllJobs(userId?: string, role?: string) {
    const where: any = {};
    if (role === 'RECRUITER' && userId) {
      where.createdBy = userId;
    }

    return await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        applications: {
          include: {
            candidate: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundError('Job');
    }

    return job;
  }

  async closeJob(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundError('Job');
    }

    return await prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' }
    });
  }

  async updateJob(id: string, data: Partial<CreateJobDTO>) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundError('Job');
    }

    return await prisma.job.update({
      where: { id },
      data,
    });
  }

  async deleteJob(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundError('Job');
    }

    await prisma.job.delete({ where: { id } });
    return { success: true };
  }
}
