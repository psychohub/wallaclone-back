import express from 'express';
import { guardarChat } from '../controllers/chatController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/', jwtAuthMiddleware, guardarChat);

export default router;