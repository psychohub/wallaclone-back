import mongoose from 'mongoose';
import { LeanAnuncio } from '../controllers/anuncioController';
import Anuncio from '../models/Anuncio';

export const isOwner = async (anuncioId: string, userId: any) => {
  try {
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(anuncioId)) {
      throw new Error('Formato de ID inválido');
    }

    const anuncio: LeanAnuncio | null = await Anuncio.findById(
      new mongoose.Types.ObjectId(anuncioId),
    );

    if (!anuncio) {
      throw new Error('Anuncio no encontrado');
    }

    // Verificar si el autor y el userId existen
    if (!anuncio.autor || !userId) {
      throw new Error('Autor no encontrado o userId indefinido');
    }

    return anuncio.autor._id.toString() === userId.toString();
  } catch (error) {
    console.error('Error verificando propietario del anuncio:', error);
    throw error;
  }
};