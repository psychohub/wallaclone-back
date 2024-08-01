import express from 'express';
import { getAnuncios, uploadImages, getAnunciosUsuario } from '../controllers/anuncioController';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/anuncios', getAnuncios);
router.get('/perfil/:nombreUsuario/anuncios', getAnunciosUsuario);
router.post('/anuncios/upload', upload.array('imagenes'), uploadImages);

export default router;
