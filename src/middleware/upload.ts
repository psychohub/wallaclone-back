import { Request, Response } from 'express';
import sharp from 'sharp';
import { BadRequestError } from '../utils/errors';
import redisClient from '../config/redis';
import path from 'path';

const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('No se ha subido una imagen');
    }
    
    const filePath = path.join('public/images', req.file.filename);
    
    await sharp(req.file.path)
      .resize(800, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(filePath);
    
    redisClient.set(filePath, JSON.stringify(req.file.buffer));
    
    res.status(201).json({ imageUrl: `/images/${req.file.filename}` });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export { uploadImages };