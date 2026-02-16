import cron from 'node-cron';
import { MonitoringService } from './MonitoringService';

export const startScheduler = () => {
  console.log('🕒 Monitoring Scheduler Started...');

  // Run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    const monitoringService = new MonitoringService();
    
    try {
      await monitoringService.runAllChecks();
    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};

// 👇 THIS IS THE MISSING KEY!
startScheduler();
