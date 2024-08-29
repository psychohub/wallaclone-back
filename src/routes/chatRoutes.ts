import express from 'express';
import { guardarChat, getChatMessages  } from '../controllers/chatController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/', jwtAuthMiddleware, guardarChat);
router.get('/:anuncioId', jwtAuthMiddleware, getChatMessages);

export default router;