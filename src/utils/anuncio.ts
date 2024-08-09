import mongoose from 'mongoose';
import { LeanAnuncio } from '../controllers/anuncioController';
import Anuncio from '../models/Anuncio';

export const isOwner = async (anuncioId: string, userId: any) => {
  try {
    const anuncio: LeanAnuncio | null = await Anuncio.findById(
      new mongoose.Types.ObjectId(anuncioId),
    );
    if (!anuncio) {
      throw new Error('Anuncio no encontrado');
    }
    return anuncio.autor?._id.toString() === userId.userId.toString();
  } catch (error) {
    console.error('Error verificando propietario del anuncio:', error);
    throw error;
  }
};
