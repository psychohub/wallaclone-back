import { Request, Response } from 'express';
import path from 'path';

// Función para manejar las solicitudes de imágenes
export const getImage = (req: Request, res: Response) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, '../../public/images', imageName);

  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Imagen no encontrada');
    }
  });
};
