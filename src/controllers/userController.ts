import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/Usuario';
import Anuncio from '../models/Anuncio';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/email';
import { BadRequestError, NotFoundError } from '../utils/errors';

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
        subject: 'Recuperación de Contraseña',
        text: `URL para restablecer su contraseña:${FRONTEND_URL + '/restablecer-contrasena?token=' + token}`,
        html: `<h5>Hola</h5>
              <p>URL para restablecer su contraseña:${FRONTEND_URL + '/restablecer-contrasena?token=' + token}</p>.`,
      };
      sendEmail(emailOptions);
    }
    res
      .status(200)
      .send({ message: 'Se le enviará un email con la url para recuperar su contraseña' });
  } catch (error) {
    next(error);
  }
};

export const resetPass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;

  try {
    if (newPassword.length < 6) {
      throw new BadRequestError('La contraseña debe tener al menos 6 caracteres');
    }
    
		const decoded = jwt.verify(token, JWT_SECRET);
		
		const user = await Usuario.findOne({ email: (decoded as any).email });
		if (!user) {
			throw new NotFoundError('No existe el usuario');
		}

		user.contraseña = newPassword;
		user.save();
		
    res
			.status(200)
			.send({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;

    // Verificar si el usuario existe
    const user = await Usuario.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Eliminar anuncios asociados al usuario
    await Anuncio.deleteMany({ autor: userId });

    // Eliminar el usuario
    await Usuario.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Cuenta de usuario eliminada con éxito' });
  } catch (error) {
    next(error);
  }
};
