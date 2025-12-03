import { MonitoringService } from '../services/MonitoringService';
import { logger } from '../utils/logger';

async function main() {
  try {
    logger.info('Running monitor checks...');

    const monitoringService = new MonitoringService();
    const results = await monitoringService.runAllChecks();

    const count = Object.keys(results).length;
    logger.info(`Checked ${count} monitors`);

    const failures = Object.values(results).filter((r: any) => r.status !== 'success');
    if (failures.length > 0) {
      logger.warn(`${failures.length} monitors failed`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Monitor run failed:', error);
    process.exit(1);
  }
}

main();
