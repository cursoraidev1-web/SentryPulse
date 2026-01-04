import { MonitoringService } from '../src/services/MonitoringService.js';
import dotenv from 'dotenv';

dotenv.config();

const monitoringService = new MonitoringService();

async function runChecks() {
  console.log('Running all monitor checks...');
  
  try {
    const results = await monitoringService.runAllChecks();
    console.log(`Completed ${Object.keys(results).length} checks`);
    
    for (const [monitorId, result] of Object.entries(results)) {
      console.log(`Monitor ${monitorId}: ${result.monitor_status}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running checks:', error);
    process.exit(1);
  }
}

runChecks();





