import express from 'express';
import { recoveryPass } from '../controllers/recoveryPassController';

const router = express.Router();

router.post('/recuperar-contraseña', recoveryPass);

export default router;