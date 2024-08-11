import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from "../utils/errors";

const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const JWT_SECRET = process.env.JWT_SECRET;
  const tokenJWT = req.get('Authorization');

  if (!tokenJWT || !JWT_SECRET) {
    next(new UnauthorizedError('No token provided'));
    return;
  }
	
  jwt.verify(tokenJWT, JWT_SECRET, (err, payload: any) => {
    if (err) {
      next(new UnauthorizedError('Invalid token'));
      return;
    }

    req.userId = payload ? payload.userId : undefined;
    next();
  });
};

export default jwtAuthMiddleware;
