import express from 'express';
import { resetPass } from '../controllers/resetPassController';

const router = express.Router();

router.post('/', resetPass);

export default router;
