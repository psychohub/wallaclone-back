import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario';
import Anuncio from '../models/Anuncio';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export const agregarFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anuncioId } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const anuncio = await Anuncio.findById(anuncioId);
    if (!anuncio) {
      throw new NotFoundError('Anuncio no encontrado');
    }

    // Convertir anuncioId a ObjectId
    const anuncioObjectId = new mongoose.Types.ObjectId(anuncioId);

    await usuario.agregarFavorito(anuncioObjectId);

    res.status(200).json({ message: 'Anuncio agregado a favoritos exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error instanceof BadRequestError || error instanceof NotFoundError ? 400 : 500).json({
        message: 'Error al agregar el anuncio a favoritos',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Error desconocido al agregar el anuncio a favoritos'
      });
    }
  }
};

export const eliminarFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anuncioId } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

 
    const anuncioObjectId = new mongoose.Types.ObjectId(anuncioId);

    await usuario.eliminarFavorito(anuncioObjectId);

    res.status(200).json({ message: 'Anuncio eliminado de favoritos exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error instanceof BadRequestError || error instanceof NotFoundError ? 400 : 500).json({
        message: 'Error al eliminar el anuncio de favoritos',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Error desconocido al eliminar el anuncio de favoritos'
      });
    }
  }
};

export const listarFavoritos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const usuario = await Usuario.findById(userId).populate('anunciosFavoritos.anuncio');
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const favoritos = usuario.listarFavoritos();

    res.status(200).json({ favoritos });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error instanceof NotFoundError ? 404 : 500).json({
        message: 'Error al obtener los anuncios favoritos',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Error desconocido al obtener los anuncios favoritos'
      });
    }
  }
};