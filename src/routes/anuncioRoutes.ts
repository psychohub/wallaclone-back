
import express from 'express';
import {
  getAnuncios,
  getAnunciosUsuario,
	getAnuncio,
  deleteAnuncio,
  createAnuncio,
} from '../controllers/anuncioController';
import multer from 'multer';
import jwtAuthMiddleware from '../middleware/jwtAuth';
import { uploadImages } from '../middleware/upload';
import upload from '../middleware/multerConfig';

const router = express.Router();


router.get('/', getAnuncios);
router.get('/user/:nombreUsuario', getAnunciosUsuario);
router.get('/item/:slug', getAnuncio);
router.delete('/delete/:anuncioId', jwtAuthMiddleware, deleteAnuncio);
router.post('/item', jwtAuthMiddleware, upload.single('imagen'), createAnuncio);

export default router;
