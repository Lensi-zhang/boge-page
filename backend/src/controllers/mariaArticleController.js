import { query } from '../config/mariaDB.js';

// 获取文章列表
export const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const offset = (page - 1) * pageSize;
    
    console.log('获取文章列表请求参数:', { page, pageSize, offset });
    
    // 使用更直接的方式查询已发布文章数量
    const countQuery = await query('SELECT COUNT(*) as count FROM articles WHERE status = "published"');
    const total = countQuery[0]?.count || 0;
    console.log('已发布文章总数:', total);
    
    // 查询文章，使用简单的查询语句
    let articles = await query(
      'SELECT * FROM articles WHERE status = "published" ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    console.log('原始查询结果类型:', Array.isArray(articles) ? '数组' : typeof articles);
    console.log('原始查询结果长度:', articles.length);
    
    // 处理嵌套数组的情况（某些数据库驱动可能返回嵌套数组）
    if (Array.isArray(articles) && articles.length > 0 && Array.isArray(articles[0])) {
      console.log('检测到嵌套数组格式，进行转换');
      // 如果是嵌套数组，取第一个元素作为实际的文章数组
      articles = articles[0];
    }
    
    console.log('处理后文章数量:', articles.length);
    if (articles.length > 0) {
      console.log('文章数据字段名:', Object.keys(articles[0]));
      console.log('文章数据示例:', JSON.stringify(articles[0], null, 2));
    }
    
    // 使用正确的字段名映射，确保直接使用数据库返回的字段
    const processedArticles = articles.map(article => {
      // 确保所有必要的字段都存在
      const safeArticle = {
        id: article.id || article.ID || null,
        title: article.title || article.Title || article.TITLE || '无标题',
        content: article.content || article.Content || article.CONTENT || '',
        category: article.category || article.Category || article.CATEGORY || '未分类',
        tags: article.tags ? JSON.parse(article.tags) : [],
        cover: article.cover || article.Cover || article.COVER || '',
        status: article.status || article.Status || article.STATUS || 'published',
        createdAt: article.createdAt || article.CreatedAt || article.CREATEDAT || new Date().toISOString(),
        viewCount: article.viewCount || article.ViewCount || article.VIEWCOUNT || 0
      };
      
      return {
        ...safeArticle,
        summary: safeArticle.content ? safeArticle.content.substring(0, 100) + '...' : '暂无内容',
        date: safeArticle.createdAt ? new Date(safeArticle.createdAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
        author: { username: '未知作者' }
      };
    });
    
    console.log('处理后的文章数据:', JSON.stringify({
      articles: processedArticles.length > 0 ? processedArticles.slice(0, 1) : [],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize)
      }
    }, null, 2));
    
    res.json({
      articles: processedArticles,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: '获取文章列表失败', error: error.message });
  }
};

// 获取文章详情
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取文章详情
    const articles = await query(
      `SELECT a.*, u.name as authorName 
       FROM articles a 
       LEFT JOIN users u ON a.authorId = u.id 
       WHERE a.id = ? AND a.status = "published"`,
      [id]
    );
    
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    const article = articles[0];
    
    // 更新浏览量
    await query('UPDATE articles SET viewCount = viewCount + 1 WHERE id = ?', [id]);
    
    // 处理返回数据
    res.json({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      author: { username: article.authorName || '未知作者' }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: '获取文章详情失败', error: error.message });
  }
};

// 创建文章（管理员功能）
export const createArticle = async (req, res) => {
  try {
    const { title, content, summary, category, tags, status = "published" } = req.body;
    const authorId = req.user?.id || 1; // 默认使用管理员ID
    
    const result = await query(
      `INSERT INTO articles (title, content, category, tags, authorId, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, category, JSON.stringify(tags || []), authorId, status]
    );
    
    res.status(201).json({ message: '文章创建成功', articleId: result.insertId });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: '创建文章失败', error: error.message });
  }
};

// 更新文章（管理员功能）
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, category, tags, status } = req.body;
    
    // 检查文章是否存在
    const existingArticle = await query('SELECT * FROM articles WHERE id = ?', [id]);
    if (existingArticle.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    // 更新文章
    await query(
      `UPDATE articles 
       SET title = ?, content = ?, summary = ?, category = ?, tags = ?, status = ? 
       WHERE id = ?`,
      [title, content, summary, category, JSON.stringify(tags || []), status, id]
    );
    
    res.json({ message: '文章更新成功' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: '更新文章失败', error: error.message });
  }
};

// 删除文章（管理员功能）
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查文章是否存在
    const existingArticle = await query('SELECT * FROM articles WHERE id = ?', [id]);
    if (existingArticle.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    // 删除文章
    await query('DELETE FROM articles WHERE id = ?', [id]);
    
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: '删除文章失败', error: error.message });
  }
};