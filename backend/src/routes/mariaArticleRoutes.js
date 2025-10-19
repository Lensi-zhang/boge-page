import express from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/mariaArticleController.js';

const router = express.Router();

// 公开路由
router.get('/', getArticles);
router.get('/:id', getArticleById);

// 文章操作路由（暂时移除权限验证以便测试）
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;