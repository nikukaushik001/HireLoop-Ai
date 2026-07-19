import { prisma } from '../config/db';
import { NotFoundError } from '../utils/api-error';

export interface CreateCandidateDTO {
  email: string;
  name: string;
  userId: string;
  phone?: string;
  skills?: string[];
  experienceYears?: number;
  currentCompany?: string;
  location?: string;
}

export interface UpdateCandidateDTO extends Partial<CreateCandidateDTO> { }

export class CandidateService {
  async getAllCandidates(hrId: string) {
    return await prisma.candidate.findMany({
      where: { userId: hrId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  async getCandidateById(id: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        resumes: {
          select: {
            id: true,
            fileName: true,
            parseStatus: true,
            createdAt: true
          }
        },
        applications: {
          include: {
            job: {
              select: { title: true, department: true }
            },
            interviews: true,
            resume: {
              select: { version: true }
            }
          }
        }
      }
    });

    if (!candidate) {
      throw new NotFoundError('Candidate');
    }

    return candidate;
  }

  async createCandidate(data: CreateCandidateDTO) {
    return await prisma.candidate.create({
      data: {
        ...data,
        embedding: [], // Placeholder until AI pipeline generates embeddings
      },
    });
  }

  async updateCandidate(id: string, data: UpdateCandidateDTO) {
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      throw new NotFoundError('Candidate');
    }

    return await prisma.candidate.update({
      where: { id },
      data
    });
  }

  async deleteCandidate(id: string) {
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      throw new NotFoundError('Candidate');
    }

    await prisma.candidate.delete({ where: { id } });
    return { success: true, message: 'Candidate deleted successfully' };
  }
}
