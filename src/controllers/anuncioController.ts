import { Request, Response } from 'express';
import Anuncio from '../models/Anuncio';
import { IAnuncio } from '../models/Anuncio';
import { IUsuario } from '../models/Usuario';
import sharp from 'sharp';
import { BadRequestError, AppError } from '../utils/errors';
import mongoose from 'mongoose';
import redisClient from '../config/redis';

// Definir el tipo de respuesta con la población del autor
interface AnuncioPopulated extends Omit<IAnuncio, 'autor'> {
  autor: IUsuario | null;
}

const getAnuncios = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const nombre = req.query.nombre as string || '';
    const tag = req.query.tag as string || '';
    const minPrecio = req.query.minPrecio;
    const maxPrecio = req.query.maxPrecio;
    const precioMin = minPrecio ? parseFloat(minPrecio as string) : undefined;
    const precioMax = maxPrecio ? parseFloat(maxPrecio as string) : undefined;
    const tipoAnuncio = req.query.tipoAnuncio as 'venta' | 'búsqueda' | undefined;

    console.log(`Fetching anuncios with page: ${page}, limit: ${limit}, nombre: ${nombre}, tag: ${tag}, precioMin: ${precioMin}, precioMax: ${precioMax}, tipoAnuncio: ${tipoAnuncio}`);

    const searchCriteria: any = {};

    // Búsqueda por texto en nombre y descripción
    if (nombre) {
      searchCriteria.$or = [
        { nombre: { $regex: nombre, $options: 'i' } },
        { descripcion: { $regex: nombre, $options: 'i' } }
      ];
    }

    // Filtro por tag
    if (tag) {
      searchCriteria.tags = { $regex: tag, $options: 'i' };
    }

    // Filtro por rango de precio
    if (precioMin !== undefined || precioMax !== undefined) {
      searchCriteria.precio = {};
      if (precioMin !== undefined) {
        searchCriteria.precio.$gte = precioMin;
        console.log('Adding min price to search criteria:', precioMin);
      }
      if (precioMax !== undefined) {
        searchCriteria.precio.$lte = precioMax;
        console.log('Adding max price to search criteria:', precioMax);
      }
    }

    // Filtro por tipo de anuncio
    if (tipoAnuncio) {
      searchCriteria.tipoAnuncio = tipoAnuncio;
    }

    console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

    const totalAnuncios = await Anuncio.countDocuments(searchCriteria);

    const anuncios = await Anuncio.find(searchCriteria)
      .sort({ fechaPublicacion: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('autor', 'nombre email')
      .lean<AnuncioPopulated[]>()
      .exec();

    const processedAnuncios = anuncios.map((anuncio) => ({
      _id: (anuncio._id as mongoose.Types.ObjectId).toString(),
      nombre: anuncio.nombre,
      imagen: anuncio.imagen,
      descripcion: anuncio.descripcion,
      precio: anuncio.precio,
      tipoAnuncio: anuncio.tipoAnuncio,
      tags: anuncio.tags,
      autor: anuncio.autor ? {
        _id: (anuncio.autor._id as mongoose.Types.ObjectId).toString(),
        nombre: anuncio.autor.nombre,
        email: anuncio.autor.email
      } : null,
      fechaPublicacion: anuncio.fechaPublicacion,
    }));

    res.status(200).json({
      anuncios: processedAnuncios,
      total: totalAnuncios,
      page,
      totalPages: Math.ceil(totalAnuncios / limit),
    });
  } catch (error: unknown) {
    console.error('Error al obtener los anuncios:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message,
        stack: error.stack 
      });
    } else {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: 'An unknown error occurred' 
      });
    }
  }
};

// Controlador para manejar la carga y compresión de imágenes
const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      throw new BadRequestError('No se han subido imágenes');
    }

    const imagenes: string[] = [];
    for (const file of req.files) {
      const compressedImagePath = `uploads/${file.filename}`;
      await sharp(file.buffer)
        .resize(800, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(compressedImagePath);
      imagenes.push(compressedImagePath);

      // Almacenar en caché usando Redis
      redisClient.set(compressedImagePath, JSON.stringify(file.buffer));
    }

    res.status(201).json({ imagenes });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error al subir las imágenes:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

export { getAnuncios, uploadImages };
