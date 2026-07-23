import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { resumeQueue } from '../queues/resume.queue';

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

export const revokeUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: false }
    });
    res.status(200).json({ success: true, data: { id: user.id, isApproved: user.isApproved } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to revoke user access' } });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({
      where: { id }
    });
    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to delete user' } });
  }
};

export const getQueueHealth = async (req: Request, res: Response) => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      resumeQueue.getWaitingCount(),
      resumeQueue.getActiveCount(),
      resumeQueue.getCompletedCount(),
      resumeQueue.getFailedCount(),
      resumeQueue.getDelayedCount(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        waiting,
        active,
        completed,
        failed,
        delayed
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to get queue health' } });
  }
};

export const retryFailedJobs = async (req: Request, res: Response) => {
  try {
    const failedJobs = await resumeQueue.getFailed();
    await Promise.all(failedJobs.map(job => job.retry()));
    res.status(200).json({ success: true, message: `Retrying ${failedJobs.length} failed jobs.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to retry jobs' } });
  }
};

export const cleanQueue = async (req: Request, res: Response) => {
  try {
    const gracePeriod = 3600000; // 1 hour
    await resumeQueue.clean(gracePeriod, 1000, 'completed');
    await resumeQueue.clean(gracePeriod, 1000, 'failed');
    res.status(200).json({ success: true, message: 'Queue cleaned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Failed to clean queue' } });
  }
};

