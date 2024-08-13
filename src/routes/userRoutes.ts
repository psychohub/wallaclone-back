import express from 'express';
import { recoveryPass, resetPass } from '../controllers/userController';

const router = express.Router();

router.post('/recuperar-contrasena', recoveryPass);
router.post('/restablecer-contrasena', resetPass);

export default router;