import express from 'express';
import { recoveryPass, resetPass } from '../controllers/userController';
import { deleteAccount } from '../controllers/userController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/recuperar-contrasena', recoveryPass);
router.post('/restablecer-contrasena', resetPass);
router.delete('/:id', jwtAuthMiddleware, deleteAccount);

export default router;