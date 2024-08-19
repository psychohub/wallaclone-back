import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from "../utils/errors";

interface AuthRequest extends Request {
  userId?: string;
}

const jwtAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return next(new UnauthorizedError('No token provided'));
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Token error'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = decoded.userId;

    next();
  } catch (error) {

    next(new UnauthorizedError('Invalid token'));
  }
};

export default jwtAuthMiddleware;