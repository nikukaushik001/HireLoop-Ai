import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/api-error';
import { env } from '../config/env';

export interface CreateJobDTO {
  title: string;
  description: string;
  requirements?: string;
  department?: string;
}

export class JobService {
  async createJob(userId: string, data: CreateJobDTO) {
    // Validate that title and department contain only alphabetical characters and spaces
    const alphaRegex = /^[A-Za-z\s]+$/;
    if (!alphaRegex.test(data.title.trim())) {
      throw new BadRequestError('Job title must only contain alphabetical characters and spaces.');
    }
    if (data.department && !alphaRegex.test(data.department.trim())) {
      throw new BadRequestError('Department must only contain alphabetical characters and spaces.');
    }

    if (data.description && !alphaRegex.test(data.description.trim())) {
      throw new BadRequestError('Description must only contain alphabetical characters and spaces.');
    }

    const titleToSave = data.title.trim();

    // Prevent duplicate job titles across the platform (case-insensitive)
    const existingJob = await prisma.job.findFirst({
      where: {
        title: {
          equals: titleToSave,
          mode: 'insensitive'
        },
        status: 'OPEN'
      }
    });

    if (existingJob) {
      throw new BadRequestError('You already have an active job posting with this exact title.');
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
        title: titleToSave,
        description: data.description.trim(),
        requirements: data.requirements,
        department: data.department ? data.department.trim() : undefined,
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
    if (data.title) {
      const alphaRegex = /^[A-Za-z\s]+$/;
      if (!alphaRegex.test(data.title.trim())) {
        throw new BadRequestError('Job title must only contain alphabetical characters and spaces.');
      }
    }
    if (data.department) {
      const alphaRegex = /^[A-Za-z\s]+$/;
      if (!alphaRegex.test(data.department.trim())) {
        throw new BadRequestError('Department must only contain alphabetical characters and spaces.');
      }
    }

    if (data.description !== undefined) {
      const alphaRegex = /^[A-Za-z\s]+$/;
      if (!alphaRegex.test(data.description.trim())) {
        throw new BadRequestError('Description must only contain alphabetical characters and spaces.');
      }
    }

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
