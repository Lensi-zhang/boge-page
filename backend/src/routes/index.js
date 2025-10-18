import express from 'express';
import userRoutes from './userRoutes.js';
import articleRoutes from './articleRoutes.js';
import navigationRoutes from './navigationRoutes.js';

const router = express.Router();

// 注册各模块路由
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/navigation', navigationRoutes);

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

export default router;