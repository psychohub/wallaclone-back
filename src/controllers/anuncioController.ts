import { Request, Response } from 'express';
import Anuncio from '../models/Anuncio';
import sharp from 'sharp';
import { createClient } from 'redis';
import mongoose from 'mongoose';
import { BadRequestError, AppError } from '../utils/errors';

// Configurar Redis
const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

const getAnuncios = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const { nombre, minPrecio, maxPrecio, tag, tipoAnuncio } = req.query;
    console.log(`Fetching anuncios with page: ${page}, limit: ${limit}`);

    const searchCriteria: any = {};

    if (nombre) {
      searchCriteria.nombre = { $regex: nombre, $options: 'i' };
    }

    if (minPrecio) {
      searchCriteria.precio = { $gte: Number(minPrecio) };
    }

    if (maxPrecio) {
      searchCriteria.precio = { ...searchCriteria.precio, $lte: Number(maxPrecio) };
    }

    if (tag) {
      searchCriteria.tags = { $regex: tag, $options: 'i' };
    }

    if (tipoAnuncio) {
      searchCriteria.tipoAnuncio = tipoAnuncio;
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: searchCriteria },
      {
        $facet: {
          paginatedResults: [
            { $sort: { fechaPublicacion: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: 'usuarios',
                localField: 'autor',
                foreignField: '_id',
                as: 'autor',
              },
            },
            { $unwind: '$autor' },
          ],
          totalCount: [
            { $count: 'total' },
          ],
        },
      },
      {
        $project: {
          paginatedResults: 1,
          total: { $arrayElemAt: ['$totalCount.total', 0] },
        },
      },
    ];

    const result = await Anuncio.aggregate(pipeline).exec();
    const { paginatedResults, total } = result[0];

    console.log(`Fetched ${paginatedResults.length} anuncios out of ${total}`);

    res.status(200).json({
      anuncios: paginatedResults,
      total: total || 0,
      page,
      totalPages: total ? Math.ceil(total / limit) : 0,
    });
  } catch (error) {
    console.error('Error al obtener los anuncios:', error);
    res.status(500).json({ message: 'Error en el servidor' });
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
