import express from 'express';
import {
  getAnuncios,
  uploadImages,
  getAnunciosUsuario,
	getAnuncio,
  deleteAnuncio,
  changeStatusAnuncio,
} from '../controllers/anuncioController';
import multer from 'multer';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAnuncios);
router.get('/user/:nombreUsuario', getAnunciosUsuario);
router.get('/item/:slug', getAnuncio);
router.delete('/delete/:anuncioId', jwtAuthMiddleware, deleteAnuncio);
router.post('/upload', upload.array('imagenes'), uploadImages);
router.put('/status/:anuncioId', jwtAuthMiddleware, changeStatusAnuncio);

export default router;
