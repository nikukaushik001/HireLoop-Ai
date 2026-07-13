import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';

export interface CreateJobDTO {
  title: string;
  description: string;
  requirements?: string;
  department?: string;
}

export class JobService {
  async createJob(userId: string, data: CreateJobDTO) {
    return await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        department: data.department,
        createdBy: userId,
        embedding: [], // Placeholder until AI pipeline generates embeddings
      },
    });
  }

  async getAllJobs() {
    return await prisma.job.findMany({
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
