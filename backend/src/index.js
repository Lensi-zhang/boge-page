import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import userRoutes from './routes/userRoutes.js';
import mariaArticleRoutes from './routes/mariaArticleRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';

// 加载环境变量
dotenv.config();

// 模拟数据（在没有MongoDB的情况下使用）
const mockArticles = [
  {
    _id: '1',
    title: '欢迎来到我的博客',
    content: '<h2>这是第一篇博客文章</h2><p>欢迎访问我的个人博客网站！这里将分享我的技术学习心得和项目经验。</p>',
    summary: '博客开篇，介绍网站的主要内容和目的。',
    category: '公告',
    tags: ['博客', '欢迎', '介绍'],
    coverImage: '',
    author: { username: 'admin' },
    isPublished: true,
    viewCount: 120,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    title: 'JavaScript基础知识回顾',
    content: '<h2>JavaScript核心概念</h2><p>本文将回顾JavaScript的一些核心概念，包括变量、数据类型、函数等基础知识。</p>',
    summary: 'JavaScript的基础知识总结，适合初学者学习。',
    category: '前端开发',
    tags: ['JavaScript', '前端', '基础知识'],
    coverImage: '',
    author: { username: 'admin' },
    isPublished: true,
    viewCount: 85,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockNavigation = [
  {
    _id: '1',
    title: '首页',
    path: '/',
    icon: 'home',
    order: 1,
    isActive: true,
    children: []
  },
  {
    _id: '2',
    title: '博客',
    path: '/blog',
    icon: 'article',
    order: 2,
    isActive: true,
    children: []
  },
  {
    _id: '3',
    title: '关于',
    path: '/about',
    icon: 'info',
    order: 3,
    isActive: true,
    children: []
  },
  {
    _id: '4',
    title: '联系我们',
    path: '/contact',
    icon: 'message',
    order: 4,
    isActive: true,
    children: []
  }
];

// 初始化MariaDB连接
let useMockData = false;
try {
  // 导入MariaDB配置并进行测试连接
  const { testConnection } = await import('./config/mariaDB.js');
  await testConnection();
  console.log('MariaDB connected successfully');
} catch (error) {
  console.warn('MariaDB connection failed:', error.message);
  useMockData = true;
}

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 静态文件服务
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// API路由配置（使用MariaDB版本）
app.use('/api/users', userRoutes);
app.use('/api/articles', mariaArticleRoutes);
app.use('/api/navigation', navigationRoutes);
useMockData = false; // 强制使用真实路由

// 如果需要使用模拟数据
if (useMockData) {
  console.log('Setting up mock API routes...');
  
  // 添加模拟用户数据
  const mockUsers = [
    {
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      _id: '2',
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];
  
  // 模拟API路由
  app.get('/api/articles', (req, res) => {
    res.json({ 
      articles: mockArticles, 
      pagination: { total: mockArticles.length, page: 1, pages: 1 } 
    });
  });
  
  app.get('/api/articles/:id', (req, res) => {
    const article = mockArticles.find(a => a._id === req.params.id);
    if (article) {
      // 模拟增加浏览量
      article.viewCount += 1;
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  });
  
  app.get('/api/navigation', (req, res) => {
    res.json(mockNavigation);
  });
  
  // 获取用户列表
  app.get('/api/users', (req, res) => {
    res.json({ 
      users: mockUsers, 
      pagination: { total: mockUsers.length, page: 1, pages: 1 } 
    });
  });
  
  // 获取单个用户
  app.get('/api/users/:id', (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  
  // 登录接口
  app.post('/api/users/login', (req, res) => {
    // 模拟登录验证
    if (req.body.email === 'admin@example.com' && req.body.password === 'admin123') {
      res.json({
        _id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        token: 'mock-jwt-token'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
}

// 健康检查路由（无论使用真实还是模拟数据都可用）
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: useMockData ? 'API is running with mock data' : 'API is running with real data',
    mockData: useMockData
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});