import express from 'express';
import { generateAgoraToken } from '../controllers/agoraController';
import authorizeRoles from '../middleware/authenMiddleware';

const router = express.Router();

router.post('/token',
    authorizeRoles(['Member', 'Consultant', 'Admin']),
    generateAgoraToken
);

export default router;