import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import NavigationItem from '../models/NavigationItem.js';
import Article from '../models/Article.js';

dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for data initialization');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// 初始化管理员用户
const initAdminUser = async () => {
  try {
    // 检查是否已存在管理员用户
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // 实际生产环境应该使用更强的密码
        role: 'admin',
      });
      console.log('Admin user created:', admin.email);
      return admin._id;
    } else {
      console.log('Admin user already exists');
      return adminExists._id;
    }
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    return null;
  }
};

// 初始化导航菜单
const initNavigationItems = async () => {
  try {
    // 检查是否已存在导航项
    const navCount = await NavigationItem.countDocuments();
    if (navCount === 0) {
      const navigationItems = [
        {
          title: '首页',
          path: '/',
          icon: 'home',
          order: 1,
          isActive: true,
        },
        {
          title: '博格',
          path: '/blog',
          icon: 'article',
          order: 2,
          isActive: true,
        },
        {
          title: '关于',
          path: '/about',
          icon: 'info',
          order: 3,
          isActive: true,
        },
        {
          title: '联系开发者',
          path: '/contact',
          icon: 'message',
          order: 4,
          isActive: true,
        },
      ];
      
      await NavigationItem.insertMany(navigationItems);
      console.log('Navigation items created');
    } else {
      console.log('Navigation items already exist');
    }
  } catch (error) {
    console.error('Failed to create navigation items:', error.message);
  }
};

// 初始化示例文章
const initSampleArticles = async (adminId) => {
  try {
    // 检查是否已有文章
    const articleCount = await Article.countDocuments();
    if (articleCount === 0 && adminId) {
      const articles = [
        {
            title: '欢迎来到我的博格',
            content: '<h2>这是第一篇博格文章</h2><p>欢迎访问博格网站！这里将分享技术学习心得和项目经验。</p>',
            summary: '博格开篇，介绍网站的主要内容和目的。',
            category: '公告',
            tags: ['博格', '欢迎', '介绍'],
          coverImage: '',
          author: adminId,
          isPublished: true,
        },
        {
          title: 'JavaScript基础知识回顾',
          content: '<h2>JavaScript核心概念</h2><p>本文将回顾JavaScript的一些核心概念，包括变量、数据类型、函数等基础知识。</p>',
          summary: 'JavaScript的基础知识总结，适合初学者学习。',
          category: '前端开发',
          tags: ['JavaScript', '前端', '基础知识'],
          coverImage: '',
          author: adminId,
          isPublished: true,
        },
      ];
      
      await Article.insertMany(articles);
      console.log('Sample articles created');
    } else {
      console.log('Articles already exist or admin ID not available');
    }
  } catch (error) {
    console.error('Failed to create sample articles:', error.message);
  }
};

// 主函数
const initializeData = async () => {
  try {
    await connectDB();
    const adminId = await initAdminUser();
    await initNavigationItems();
    await initSampleArticles(adminId);
    
    console.log('Data initialization completed successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Initialization failed:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

initializeData();