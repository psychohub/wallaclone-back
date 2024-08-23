import express from 'express';
import {
  deleteAccount,
  recoveryPass,
  resetPass,
  updatePass,
  updateUserProfile,
} from '../controllers/userController';
import jwtAuthMiddleware from '../middleware/jwtAuth';

const router = express.Router();

router.post('/recuperar-contrasena', recoveryPass);
router.post('/restablecer-contrasena', resetPass);
router.put('/actualizar-contrasena', jwtAuthMiddleware, updatePass);
router.put('/actualizar-datos', jwtAuthMiddleware, updateUserProfile);
router.delete('/:id', jwtAuthMiddleware, deleteAccount);

export default router;
