import { Queue } from 'bullmq';
import { connection } from './connection';

export const resumeQueue = new Queue('resume-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
