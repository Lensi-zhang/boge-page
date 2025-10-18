import express from 'express';
import {
  getNavigationItems,
  getNavigationItem,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
} from '../controllers/navigationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// 公开路由（获取激活的导航项）
router.get('/', getNavigationItems);

// 需要管理员权限的路由
router.get('/:id', protect, admin, getNavigationItem);
router.post('/', protect, admin, createNavigationItem);
router.put('/:id', protect, admin, updateNavigationItem);
router.delete('/:id', protect, admin, deleteNavigationItem);

export default router;