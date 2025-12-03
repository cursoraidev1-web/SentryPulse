import { logger } from '../utils/logger';

// Simple queue worker placeholder
// In production, use Bull queue system

async function worker() {
  logger.info('Queue worker started');

  setInterval(() => {
    logger.info('Queue worker heartbeat');
  }, 60000);
}

worker().catch((error) => {
  logger.error('Queue worker error:', error);
  process.exit(1);
});
