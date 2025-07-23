import express from 'express';
import { getMe } from '../controllers/userController';

const router = express.Router();

router.get('/me', getMe);

export default router;