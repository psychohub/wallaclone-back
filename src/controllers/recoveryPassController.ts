import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/Usuario';
import jwt from 'jsonwebtoken';
import { SendRecoveryPassUrl } from '../services/email/recoveryPassEmail';
import { NotFoundError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET debe definirse en variables de entorno');
}

export const recoveryPass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    const usuarioExistente = await Usuario.findOne({ $or: [{ email }] });
    if (usuarioExistente) {
      const token = jwt.sign({}, JWT_SECRET, { mutatePayload: true, expiresIn: '5m' });

      const url = '/restablecer-contrasena/' + token;
      SendRecoveryPassUrl(url);
    }
  } catch (error) {
    next(error);
  }
};
