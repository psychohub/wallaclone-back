import mongoose from 'mongoose';
import { LeanAnuncio } from '../controllers/anuncioController';
import Anuncio from '../models/Anuncio';
import { JwtPayload } from 'jsonwebtoken';

export const isOwner = async (anuncioId: string, userId: string | JwtPayload) => {
  try {
    const anuncio: LeanAnuncio | null = await Anuncio.findById(anuncioId);
    if (!anuncio) {
      throw new Error('Anuncio no encontrado');
    }
    return anuncio?.autor?._id.toString() === userId.toString();
  } catch (error) {
    console.error('Error verificando propietario del anuncio:', error);
    throw error;
  }
};
