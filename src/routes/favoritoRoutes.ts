import express from 'express';
import { agregarFavorito, eliminarFavorito, listarFavoritos } from '../controllers/favoritoController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/', jwtAuthMiddleware, agregarFavorito);
router.delete('/:anuncioId', jwtAuthMiddleware, eliminarFavorito);
router.get('/', jwtAuthMiddleware, listarFavoritos);

export default router;