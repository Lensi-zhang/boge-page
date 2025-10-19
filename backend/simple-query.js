// 简单的数据库查询脚本
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function simpleQuery() {
  try {
    console.log('开始连接数据库...');
    
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.MARIA_HOST || 'localhost',
      user: process.env.MARIA_USER || 'root',
      password: process.env.MARIA_PASSWORD || '',
      database: process.env.MARIA_DATABASE || 'boge_blog',
      port: process.env.MARIA_PORT || 3306
    });
    
    console.log('数据库连接成功!');
    
    // 查询表中的文章数量
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM articles');
    console.log('\n文章总数:', countResult[0].count);
    
    // 查询已发布的文章数量
    const [publishedResult] = await connection.query('SELECT COUNT(*) as count FROM articles WHERE status = "published"');
    console.log('已发布文章数:', publishedResult[0].count);
    
    // 查询草稿数量
    const [draftResult] = await connection.query('SELECT COUNT(*) as count FROM articles WHERE status = "draft"');
    console.log('草稿数量:', draftResult[0].count);
    
    // 查询最新的几篇文章标题
    console.log('\n最新的5篇文章:');
    const [articles] = await connection.query(
      'SELECT id, title, status, createdAt FROM articles ORDER BY createdAt DESC LIMIT 5'
    );
    
    if (articles.length === 0) {
      console.log('暂无文章');
    } else {
      articles.forEach(article => {
        console.log(`${article.id}: ${article.title} (${article.status}) - ${article.createdAt}`);
      });
    }
    
    await connection.end();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('数据库操作失败:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    process.exit();
  }
}

simpleQuery();