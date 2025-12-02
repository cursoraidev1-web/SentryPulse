import { createClient } from 'redis';
import { config } from './env';

let client: ReturnType<typeof createClient>;

export const getRedisClient = async () => {
  if (!client) {
    client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
};
