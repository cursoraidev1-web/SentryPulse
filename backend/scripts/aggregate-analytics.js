import { AnalyticsService } from '../src/services/AnalyticsService.js';
import dotenv from 'dotenv';

dotenv.config();

const analyticsService = new AnalyticsService();

async function aggregate() {
  try {
    console.log('Starting analytics aggregation...');
    
    // Aggregate yesterday's data (run this daily)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD

    await analyticsService.aggregateDailyStats(dateStr);
    
    console.log(`✓ Aggregated analytics for ${dateStr}`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Aggregation error:', error);
    process.exit(1);
  }
}

aggregate();

