import express from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { protect, editorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// 公开路由
router.get('/', getArticles);
router.get('/:id', getArticle);

// 需要认证的路由
router.post('/', protect, editorOrAdmin, createArticle);
router.put('/:id', protect, editorOrAdmin, updateArticle);
router.delete('/:id', protect, editorOrAdmin, deleteArticle);

export default router;