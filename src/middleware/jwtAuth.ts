import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from "../utils/errors";



const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const authorizationHeader = req.get('Authorization');

  if (!authorizationHeader || !JWT_SECRET) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const tokenJWT = authorizationHeader.split(' ')[1];
  
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
