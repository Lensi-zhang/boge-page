import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.MARIA_HOST || 'localhost',
  user: process.env.MARIA_USER || 'root',
  password: process.env.MARIA_PASSWORD || '',
  database: process.env.MARIA_DATABASE || 'boge_blog',
  port: process.env.MARIA_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接并初始化数据库
const initMariaDB = async () => {
  try {
    console.log('Attempting to connect to MariaDB with config:', {
      host: process.env.MARIA_HOST || 'localhost',
      user: process.env.MARIA_USER || 'root',
      password: '********', // 不显示密码
      database: process.env.MARIA_DATABASE || 'boge_blog',
      port: process.env.MARIA_PORT || 3306
    });
    const connection = await pool.getConnection();
    console.log('MariaDB connected successfully');
    
    // 检查数据库是否存在，如果不存在则创建
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MARIA_DATABASE || 'boge_blog'}`);
    
    // 选择数据库
    await connection.query(`USE ${process.env.MARIA_DATABASE || 'boge_blog'}`);
    
    // 创建articles表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        category VARCHAR(100),
        tags JSON,
        cover VARCHAR(255),
        status VARCHAR(20) DEFAULT 'draft',
        viewCount INT DEFAULT 0,
        authorId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);
    
    // 创建users表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建navigation_items表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS navigation_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        orderNum INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        parentId INT,
        FOREIGN KEY (parentId) REFERENCES navigation_items(id) ON DELETE CASCADE
      )
    `);
    
    // 插入默认用户
    const [users] = await connection.query('SELECT * FROM users WHERE name = ?', ['admin']);
    if (users.length === 0) {
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@example.com', '$2a$10$eJ7wXaBxQZ5vUY8hJ9k98e0C9rF8n7m6l5j4i3h2g1f0e9d8c7b6a5', 'admin']
      );
      console.log('Default admin user created');
    }
    
    // 插入默认导航项
    const [navItems] = await connection.query('SELECT * FROM navigation_items');
    if (navItems.length === 0) {
      const defaultNavItems = [
        { title: '首页', path: '/', icon: 'home', orderNum: 1, isActive: true },
        { title: '博格', path: '/blog', icon: 'article', orderNum: 2, isActive: true },
        { title: '关于', path: '/about', icon: 'info', orderNum: 3, isActive: true },
        { title: '联系开发者', path: '/contact', icon: 'message', orderNum: 4, isActive: true }
      ];
      
      for (const item of defaultNavItems) {
        await connection.query(
          'INSERT INTO navigation_items (title, path, icon, orderNum, isActive) VALUES (?, ?, ?, ?, ?)',
          [item.title, item.path, item.icon, item.orderNum, item.isActive]
        );
      }
      console.log('Default navigation items created');
    }
    
    // 插入示例文章
    const [articles] = await connection.query('SELECT * FROM articles');
    if (articles.length === 0) {
      await connection.query(
        'INSERT INTO articles (title, content, category, tags, cover, status, viewCount, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          '欢迎来到我的博格',
          '<h2>这是第一篇博格文章</h2><p>欢迎访问博格网站！这里将分享技术学习心得和项目经验。</p>',
          '公告',
          JSON.stringify(['博格', '欢迎', '介绍']),
          '',
          'published',
          120,
          1
        ]
      );
      console.log('Sample article created');
    }
    
    connection.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to MariaDB:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    throw error;
  }
};

// 查询方法封装
const query = async (sql, params) => {
  const connection = await pool.getConnection();
  try {
    const results = await connection.query(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

// 测试连接函数
export const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('MariaDB connection successful');
    return true;
  } catch (error) {
    console.error('MariaDB connection error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export { initMariaDB, query };
export default pool;