import express from 'express';
import {
  getAnuncios,
  uploadImages,
  getAnunciosUsuario,
  deleteAnuncio,
} from '../controllers/anuncioController';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/anuncios', getAnuncios);
router.get('/perfil/:nombreUsuario/anuncios', getAnunciosUsuario);
router.post('/anuncios/upload', upload.array('imagenes'), uploadImages);
router.delete('/anuncios/:anuncioId', deleteAnuncio);

export default router;
