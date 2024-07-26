import express from 'express';
import { recoveryPass } from '../controllers/recoveryPassController';

const router = express.Router();

router.post('/', recoveryPass);

export default router;
