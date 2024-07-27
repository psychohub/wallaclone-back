import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

const cache = async (req: Request, res: Response, next: NextFunction) => {
  const { url } = req;
  try {
    const data = await redisClient.get(url);
    if (data) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  } catch (err) {
    console.error('Redis get error', err);
    next();
  }
};

export default cache;
