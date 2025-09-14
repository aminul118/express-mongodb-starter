/* eslint-disable no-console */
import { createClient } from 'redis';
import envVars from './env';

const redisClient = createClient({
  username: envVars.REDIS.REDIS_USERNAME,
  password: envVars.REDIS.REDIS_PASSWORD,
  socket: {
    host: envVars.REDIS.REDIS_HOST,
    port: envVars.REDIS.REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis Connected');
  }
};

export { redisClient, connectRedis };

//  await redisClient.set('foo', 'bar');
//     const result = await redisClient.get('foo');
//     console.log(result); // >>> bar
