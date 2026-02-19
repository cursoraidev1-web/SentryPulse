import cron from 'node-cron';
import { MonitoringService } from './MonitoringService';

export const startScheduler = () => {
  console.log('🕒 Monitoring Scheduler Started...');

  // Run first round immediately so new monitors get a check right away
  (async () => {
    const monitoringService = new MonitoringService();
    try {
      await monitoringService.runAllChecks();
    } catch (error) {
      console.error('Scheduler Error (initial run):', error);
    }
  })();

  // Then run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    const monitoringService = new MonitoringService();
    try {
      await monitoringService.runAllChecks();
    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};

// Started from index.ts when server listens (not when imported for tests)
