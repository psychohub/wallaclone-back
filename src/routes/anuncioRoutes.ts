import express from 'express';
import {
  getAnuncios,
  getAnunciosUsuario,
	getAnuncio,
  deleteAnuncio,
  createAnuncio,
  editAnuncio,
  changeStatusAnuncio,
  getStatusAnuncio,
} from '../controllers/anuncioController';
import jwtAuthMiddleware from '../middleware/jwtAuth';
import upload from '../middleware/multerConfig';

const router = express.Router();

router.get('/', getAnuncios);
router.get('/user/:nombreUsuario', getAnunciosUsuario);
router.get('/item/:slug', getAnuncio);
router.post('/item', jwtAuthMiddleware, upload.single('imagen'), createAnuncio);
router.put('/item/:id', jwtAuthMiddleware, upload.single('imagen'), editAnuncio);
router.delete('/delete/:anuncioId', jwtAuthMiddleware, deleteAnuncio);
router.put('/status/:anuncioId', jwtAuthMiddleware, changeStatusAnuncio);
router.get('/status', jwtAuthMiddleware, getStatusAnuncio);

export default router;