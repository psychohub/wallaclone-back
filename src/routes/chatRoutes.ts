import express from 'express';
import { guardarChat, getChatMessages, getUserConversations, getChatIdByAdvertId   } from '../controllers/chatController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/', jwtAuthMiddleware, guardarChat); 
router.get('/:chatId', jwtAuthMiddleware, getChatMessages); 
router.get('/', jwtAuthMiddleware, getUserConversations);
router.get('/adverts/:advertId', jwtAuthMiddleware, getChatIdByAdvertId);


export default router;