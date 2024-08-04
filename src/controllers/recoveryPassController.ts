import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/Usuario';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/email';

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

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
      const token = jwt.sign({ email: email }, JWT_SECRET, {
        mutatePayload: true,
        expiresIn: '5m',
      });

      const emailOptions = {
        to: email,
        subject: 'Recuperacion de Contraseña',
        text: `URL para reestablecer su contraseña:${FRONTEND_URL + '/restablecer-contrasena?token=' + token}`,
        html: `<h5>Hola</h5>
              <p>URL para reestablecer su contraseña:${FRONTEND_URL + '/restablecer-contrasena?token=' + token}</p>.`,
      };
      sendEmail(emailOptions);
    }
    res
      .status(200)
      .send({ message: 'Se le enviara un email con la url para recuperar su contraseña' });
  } catch (error) {
    next(error);
  }
};
