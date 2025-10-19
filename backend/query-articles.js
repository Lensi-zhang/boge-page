import { query } from './src/config/mariaDB.js';

// 查询文章数据
async function checkArticles() {
  try {
    console.log('正在查询数据库中的文章...');
    
    // 查询所有文章
    const result = await query(
      'SELECT id, title, status, category, createdAt FROM articles ORDER BY createdAt DESC'
    );
    
    console.log('\n查询结果类型:', typeof result);
    console.log('查询结果:', JSON.stringify(result, null, 2));
    
    const articles = Array.isArray(result) ? result : [];
    
    console.log('\n数据库中的文章列表:');
    console.log('------------------------------------------');
    console.log('ID  | 标题                       | 状态      | 分类      | 创建时间');
    console.log('------------------------------------------');
    
    if (articles.length === 0) {
      console.log('暂无文章');
    } else {
      articles.forEach(article => {
        if (article && article.id !== undefined) {
          console.log(
            `${String(article.id).padEnd(3)} | ` +
            `${(article.title || '无标题').substring(0, 25).padEnd(25)} | ` +
            `${(article.status || '未知').padEnd(8)} | ` +
            `${(article.category || '无分类').substring(0, 10).padEnd(10)} | ` +
            `${new Date(article.createdAt || Date.now()).toLocaleString('zh-CN')}`
          );
        }
      });
    }
    
    console.log('------------------------------------------');
    console.log(`总共找到 ${articles.length} 篇文章`);
    
    // 检查文章数量统计
    const publishedCount = articles.filter(a => a && a.status === 'published').length;
    const draftCount = articles.filter(a => a && a.status === 'draft').length;
    
    console.log(`\n已发布文章: ${publishedCount} 篇`);
    console.log(`草稿文章: ${draftCount} 篇`);
    
  } catch (error) {
    console.error('查询文章失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    process.exit();
  }
}

// 执行查询
checkArticles();