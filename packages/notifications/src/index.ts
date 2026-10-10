import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notifications', { connection });

export interface NotificationPayload {
  userId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  content: string;
  recipient: string;
}

export class NotificationService {
  async sendNotification(payload: NotificationPayload) {
    await notificationQueue.add('send', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}

// Start worker to process background jobs
export function startNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job: Job<NotificationPayload>) => {
      const { type, content, recipient } = job.data;
      console.log(`Processing notification job ${job.id}: Sending ${type} to ${recipient}`);
      
      // Integrate message sending API/library here
      switch (type) {
        case 'EMAIL':
          // mock email sending
          break;
        case 'SMS':
          // mock SMS sending
          break;
        case 'PUSH':
          // mock Push notification
          break;
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}
