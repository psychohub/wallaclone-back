import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => {
	console.error('Redis client error', err);
}).connect();

export default redisClient;
