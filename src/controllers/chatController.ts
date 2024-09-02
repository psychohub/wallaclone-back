import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import Chat, { IChat } from '../models/Chat';
import Anuncio, { IAnuncio } from '../models/Anuncio';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export const guardarChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { anuncioId, contenido } = req.body;
        const userId = req.userId;

        if (!userId) {
            throw new ForbiddenError('Usuario no autenticado');
        }

        if (!anuncioId || !contenido) {
            throw new BadRequestError('Faltan campos requeridos');
        }

        const anuncioObjectId = new Types.ObjectId(anuncioId);
        const userObjectId = new Types.ObjectId(userId);

        // Usar exec() para obtener una promesa tipada
        const anuncio = await Anuncio.findById(anuncioObjectId).exec();
        if (!anuncio) {
            console.log(`Anuncio no encontrado con ID: ${anuncioId}`);
            throw new NotFoundError('Anuncio no encontrado');
        }

        let chat = await Chat.findOne({ anuncio: anuncioObjectId, participantes: userObjectId });

        if (chat) {
            chat.mensajes.push({
                emisor: userObjectId,
                contenido,
                fechaEnvio: new Date(),
                leido: false
            });
        } else {
            const otherParticipant = anuncio.autor.toString() !== userId
                ? anuncio.autor
                : userObjectId;

            chat = new Chat({
                anuncio: anuncioObjectId,
                participantes: [userObjectId, otherParticipant],
                mensajes: [{
                    emisor: userObjectId,
                    contenido,
                    fechaEnvio: new Date(),
                    leido: false
                }],
            });
        }

        await chat.save();
        await chat.populate('participantes', 'nombre');
        console.log('Chat guardado exitosamente');

        res.status(201).json({
            message: 'Mensaje guardado exitosamente',
            chat,
        });
    } catch (error) {
        console.error('Error en guardarChat:', error);
        if (error instanceof AppError) {
            res.status(error.status).json({
                message: error.message,
                error: true,
            });
        } else {
            next(error);
        }
    }
};


export const getChatMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { anuncioId } = req.params;
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      if (!userId) {
        throw new ForbiddenError('Usuario no autenticado');
      }
  
      if (!mongoose.Types.ObjectId.isValid(anuncioId)) {
        throw new BadRequestError('ID de anuncio inválido');
      }
  
      const anuncio = await Anuncio.findById(anuncioId).select('_id titulo');
      if (!anuncio) {
        throw new NotFoundError('Anuncio no encontrado');
      }
  
      const chat = await Chat.findOne({ anuncio: anuncioId, participantes: userId })
  .populate('participantes', '_id nombre')
  .populate('anuncio', '_id nombre')
  .select('mensajes participantes anuncio');
  
      if (!chat) {
        throw new NotFoundError('Chat no encontrado');
      }
  
      const totalMessages = chat.mensajes.length;
      const totalPages = Math.ceil(totalMessages / limit);
      const skip = (page - 1) * limit;
  
      const messages = chat.mensajes
        .sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
        .slice(skip, skip + limit)
        .map(m => ({
          id: m._id,
          emisor: m.emisor,
          contenido: m.contenido,
          fechaEnvio: m.fechaEnvio
        }));
  
      res.status(200).json({
        anuncio: {
          id: anuncio._id,
          titulo: anuncio.nombre 
        },
        participantes: chat.participantes,
        mensajes: messages,
        metadata: {
          totalMensajes: totalMessages,
          paginaActual: page,
          totalPaginas: totalPages,
          mensajesPorPagina: limit
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.status).json({
          message: error.message
        });
      } else {
        next(error); 
      }
    }
  };