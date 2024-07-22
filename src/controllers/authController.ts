import { Request, Response, NextFunction } from 'express';
import Usuario from '../models/Usuario';
import jwt from 'jsonwebtoken';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';

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
  } catch (error) {
    next(error);
  }
};
