import express from 'express';
import { getArticles, getArticleById, createArticle, updateArticle, deleteArticle } from '../controllers/mariaArticleController.js';
import { login, getCurrentUser, getUsers, createUser, updateUser, deleteUser } from '../controllers/mariaUserController.js';
import { getNavigationItems, getNavigationItemById, createNavigationItem, updateNavigationItem, deleteNavigationItem, getAllNavigationItems } from '../controllers/mariaNavigationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 文章路由
router.get('/articles', getArticles);
router.get('/articles/:id', getArticleById);
router.post('/articles', protect, createArticle);
router.put('/articles/:id', protect, updateArticle);
router.delete('/articles/:id', protect, deleteArticle);

// 用户路由
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, getUsers);
router.post('/users', protect, createUser);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);

// 导航路由
router.get('/navigation', getNavigationItems);
router.get('/navigation/admin', protect, getAllNavigationItems);
router.get('/navigation/:id', getNavigationItemById);
router.post('/navigation', protect, createNavigationItem);
router.put('/navigation/:id', protect, updateNavigationItem);
router.delete('/navigation/:id', protect, deleteNavigationItem);

export default router;