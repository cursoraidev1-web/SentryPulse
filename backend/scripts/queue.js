import Bull from 'bull';
import Redis from 'ioredis';
import { MonitoringService } from '../src/services/MonitoringService.js';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || null
});

const checkMonitorQueue = new Bull('monitor-checks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || null
  }
});

const monitoringService = new MonitoringService();

// Process monitor check jobs
checkMonitorQueue.process(async (job) => {
  const { monitorId } = job.data;
  console.log(`Processing check for monitor ${monitorId}`);
  
  try {
    // Fetch monitor from database
    const { MonitorRepository } = await import('../src/repositories/MonitorRepository.js');
    const monitorRepository = new MonitorRepository();
    const monitor = await monitorRepository.findById(monitorId);
    
    if (!monitor) {
      throw new Error(`Monitor ${monitorId} not found`);
    }
    
    if (!monitor.is_enabled) {
      console.log(`Monitor ${monitorId} is disabled, skipping check`);
      return { skipped: true, reason: 'disabled' };
    }
    
    // Check the monitor
    const result = await monitoringService.checkMonitor(monitor.toArray ? monitor.toArray() : monitor);
    console.log(`Monitor ${monitorId} check completed: ${result.monitor_status}`);
    return result;
  } catch (error) {
    console.error(`Error checking monitor ${monitorId}:`, error);
    throw error;
  }
});

console.log('Queue worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down queue worker...');
  await checkMonitorQueue.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down queue worker...');
  await checkMonitorQueue.close();
  await redis.quit();
  process.exit(0);
});





