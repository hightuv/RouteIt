import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

const createRedisClient = (url: string, name: string) => {
  const client = new Redis(url);
  client.on('connect', () => console.log(`Redis ${name} connected`));
  client.on('error', (e) => console.error(`Redis ${name} error`, e));
  return client;
};

export const redisTokenProvider: Provider = {
  provide: 'REDIS_TOKEN_CLIENT',
  useFactory: () => {
    const url = process.env.REDIS_TOKEN_URL;
    if (!url) throw new Error('REDIS_TOKEN_URL not set');
    return createRedisClient(url, 'Token');
  },
};

export const redisPlaceProvider: Provider = {
  provide: 'REDIS_PLACE_CLIENT',
  useFactory: () => {
    const url = process.env.REDIS_PLACE_URL;
    if (!url) throw new Error('REDIS_PLACE_URL not set');
    return createRedisClient(url, 'Place');
  },
};
