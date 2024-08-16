import express from 'express';
import {
  getAnuncios,
  uploadImages,
  getAnunciosUsuario,
	getAnuncio,
  deleteAnuncio,
  editAnuncio,
} from '../controllers/anuncioController';
import multer from 'multer';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAnuncios);
router.get('/user/:nombreUsuario', getAnunciosUsuario);
router.post('/item/:slug', getAnuncio);
router.delete('/delete/:anuncioId', jwtAuthMiddleware, deleteAnuncio);
router.put('/item/:id', jwtAuthMiddleware, editAnuncio);
router.post('/upload', upload.array('imagenes'), uploadImages);

export default router;
