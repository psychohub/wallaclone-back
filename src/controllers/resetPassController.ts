import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/Usuario';
import { BadRequestError } from '../utils/errors';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET debe definirse en variables de entorno');
}

export const resetPass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.query.token;
  const newPassword = req.body.contraseña;

  try {
    if (newPassword.length < 6) {
      throw new BadRequestError('La contraseña debe tener al menos 6 caracteres');
    }
    if (typeof token === 'string') {
      const decoded = jwt.verify(token, JWT_SECRET);
      await Usuario.findOneAndUpdate(
        { decoded },
        { $set: { contraseña: newPassword } },
        { new: true, runValidators: true },
      );
    } else {
      res.status(400).send('Parametro invalido');
    }
  } catch (error) {
    next(error);
  }
};
