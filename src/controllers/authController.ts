import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { sendEmail } from '../config/email';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET debe definirse en variables de entorno');
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre, email, contraseña } = req.body;

    if (!/^[a-zA-Z0-9_-]+$/.test(nombre)) {
      throw new BadRequestError('Nombre de usuario inválido');
    }

    if (contraseña.length < 6) {
      throw new BadRequestError('La contraseña debe tener al menos 6 caracteres');
    }

    const usuarioExistente = await Usuario.findOne({ $or: [{ email }, { nombre }] });
    if (usuarioExistente) {
      throw new ConflictError('El email o nombre de usuario ya está en uso');
    }

    const nuevoUsuario = new Usuario({ nombre, email, contraseña });
    await nuevoUsuario.save();
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: nuevoUsuario._id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email
    });

    const emailOptions = {
      to: nuevoUsuario.email,
      subject: 'Registro de usuario exitoso',
      text: `Hola, ${nuevoUsuario.nombre}. Has sido registrado exitosamente en Wallaclone. Inicia sesión visitando ${process.env.FRONTEND_URL}/login`,
      html: `<p>Hola, <b>${nuevoUsuario.nombre}</b>:</p><p>Has sido registrado exitosamente en Wallaclone.</p><p>Inicia sesión haciendo <a href="${process.env.FRONTEND_URL}/login">click aquí</a></p>.`
    };
    sendEmail(emailOptions);

  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre, contraseña } = req.body;

    // Validar que se proporcionaron nombre y contraseña
    if (!nombre || !contraseña) {
      throw new BadRequestError('Nombre de usuario y contraseña son requeridos');
    }

    // Buscar el usuario por nombre
    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar la contraseña
    const esContraseñaValida = await usuario.compararContraseña(contraseña);
    if (!esContraseñaValida) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: usuario._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Enviar respuesta
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

