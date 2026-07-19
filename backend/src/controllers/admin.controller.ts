import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'RECRUITER' } });
    const totalJobs = await prisma.job.count();
    const totalCandidates = await prisma.candidate.count();
    const totalResumes = await prisma.resume.count();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalCandidates,
        totalResumes
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getSystemUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    });
    res.status(200).json({ success: true, data: { id: user.id, isApproved: user.isApproved } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to approve user' } });
  }
};

export const upgradeUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.update({
      where: { id },
      data: { role: 'SUPERADMIN' }
    });
    res.status(200).json({ success: true, data: { id: user.id, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to upgrade user' } });
  }
};
