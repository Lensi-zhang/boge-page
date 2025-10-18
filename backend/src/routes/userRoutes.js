import express from 'express';
import { registerUser, loginUser, getMe, updateUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// 公开路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 需要认证的路由
router.get('/me', protect, getMe);
router.put('/me', protect, updateUser);

export default router;