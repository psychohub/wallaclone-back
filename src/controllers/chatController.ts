import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import Chat from '../models/Chat';
import Anuncio, { IAnuncio } from '../models/Anuncio';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

function isIAnuncio(anuncio: any): anuncio is IAnuncio {
  return (anuncio as IAnuncio).nombre !== undefined;
}

export const guardarChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chatId, contenido } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new ForbiddenError('Usuario no autenticado');
    }

    if (!chatId || !contenido) {
      console.error('Faltan campos requeridos:', { chatId, contenido });
      throw new BadRequestError('Faltan campos requeridos');
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.error(`ID de chat inválido: ${chatId}`);
      throw new BadRequestError('ID de chat inválido');
    }

    const chat = await Chat.findOne({ _id: chatId, participantes: userId });

    if (!chat) {
      console.log(`Chat no encontrado con ID: ${chatId}`);
      throw new NotFoundError('Chat no encontrado');
    }


    const newMessage = {
      emisor: new Types.ObjectId(userId),
      contenido,
      fechaEnvio: new Date(),
      leido: false,
    };

    chat.mensajes.push(newMessage);

    await chat.save();
    await chat.populate('participantes', 'nombre');

    console.log('Chat guardado exitosamente');

    res.status(201).json({
      message: 'Mensaje guardado exitosamente',
      chat,
      newMessage, 
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
      const { chatId } = req.params;
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
          console.error(`ID de chat inválido: ${chatId}`);
          throw new BadRequestError('ID de chat inválido');
      }
 
      const chat = await Chat.findOne({ _id: chatId, participantes: userId })
          .populate('anuncio')
          .populate('participantes', '_id nombre')
          .select('mensajes participantes anuncio');

      if (!chat) {
          console.error(`Chat no encontrado con ID: ${chatId}`);
          throw new NotFoundError('Chat no encontrado');
      }

      if (!isIAnuncio(chat.anuncio)) {
          console.error(`Anuncio no válido en chat con ID: ${chatId}`);
          throw new BadRequestError('Anuncio no válido');
      }

      const totalMessages = chat.mensajes.length;
      const totalPages = Math.ceil(totalMessages / limit);
      const skip = (page - 1) * limit;

      const messages = chat.mensajes
          .sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
          .slice(skip, skip + limit)
          .sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime())
          .map(m => ({
              id: m._id,
              emisor: m.emisor,
              contenido: m.contenido,
              fechaEnvio: m.fechaEnvio
          }));

      res.status(200).json({
          anuncio: chat.anuncio,
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
      console.error('Error en getChatMessages:', error);
      if (error instanceof AppError) {
          res.status(error.status).json({ message: error.message });
      } else {
          next(error);
      }
  }
};




  export const getUserConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.userId;  

        if (!userId) {
            throw new ForbiddenError('Usuario no autenticado');
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestError('ID de usuario inválido');
        }

        const userObjectId = new Types.ObjectId(userId); 


        const conversations = await Chat.find({ participantes: userObjectId })
            .populate('anuncio', 'nombre')
            .populate('participantes', 'nombre email')
            .exec();

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error en getUserConversations:', error);
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


export const getChatIdByAdvertId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { advertId } = req.params;

    if (!advertId) {
      throw new BadRequestError('advertId es requerido');
    }

    const chat = await Chat.findOne({ anuncio: advertId });

    if (!chat) {
      throw new NotFoundError('Chat no encontrado');
    }

    res.status(200).json({ chatId: chat._id });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { advertId } = req.body;  
    const userId = req.userId;      

    if (!advertId || !userId) {
      throw new BadRequestError('AdvertId y UserId son requeridos');
    }


    const advert = await Anuncio.findById(advertId);
    if (!advert) {
      throw new NotFoundError('Anuncio no encontrado');
    }


    let chat = await Chat.findOne({ anuncio: advertId, participantes: userId });

    if (!chat) {

      chat = new Chat({
        anuncio: advertId,
        participantes: [userId, advert.autor],  
        mensajes: [],
      });

      await chat.save();
    }

    res.status(201).json({
      message: 'Chat creado exitosamente',
      chatId: chat._id,
    });
  } catch (error) {
    next(error);
  }
};