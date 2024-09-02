import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat, { IChat } from '../models/Chat';
import Anuncio from '../models/Anuncio';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export const guardarChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anuncioId, contenido } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new ForbiddenError('Usuario no autenticado');
    }

    if (!anuncioId || !contenido) {
      throw new BadRequestError('Faltan campos requeridos');
    }

    // Convertir anuncioId y userId a ObjectId
    const anuncioObjectId = new mongoose.Types.ObjectId(anuncioId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verificar si el anuncio existe
    const anuncio = await Anuncio.findById(anuncioObjectId);
    if (!anuncio) {
      throw new NotFoundError('Anuncio no encontrado');
    }

    // Verificar si ya existe un chat para este anuncio y usuario
    let chat = await Chat.findOne({ anuncio: anuncioObjectId, participantes: userObjectId });

    if (chat) {
      // Si el chat existe, añadir el nuevo mensaje
      chat.mensajes.push({
        emisor: userObjectId,
        contenido,
        fechaEnvio: new Date()
      });
    } else {
      // Si no existe, crear un nuevo chat
      chat = new Chat({
        anuncio: anuncioObjectId,
        participantes: [userObjectId, anuncio.autor],
        mensajes: [{
          emisor: userObjectId,
          contenido,
          fechaEnvio: new Date()
        }],
      });
    }

    await chat.save();

    res.status(201).json({
      message: 'Mensaje guardado exitosamente',
      chat,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error instanceof BadRequestError ? 400 : 500).json({
        message: 'Error al guardar el mensaje',
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: 'Error desconocido al guardar el mensaje',
      });
    }
  }
};