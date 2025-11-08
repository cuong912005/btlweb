import redis from 'redis';


const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

await redisClient.connect();

export default redisClient;

