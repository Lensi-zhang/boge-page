import express from 'express';
// 使用MariaDB路由替代MongoDB路由
import mariaRoutes from './mariaRoutes.js';

const router = express.Router();

// 使用MariaDB路由
router.use('/', mariaRoutes);

export default router;