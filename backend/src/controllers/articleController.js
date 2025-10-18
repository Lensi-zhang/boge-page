import Article from '../models/Article.js';

// 获取所有文章
export const getArticles = async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // 添加过滤条件
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$text = { $search: search };
    }
    
    // 默认只获取已发布的文章（非管理员）
    if (!req.user || req.user.role !== 'admin') {
      query.isPublished = true;
    }
    
    // 计算跳过的记录数
    const skip = (page - 1) * limit;
    
    // 查询文章总数
    const total = await Article.countDocuments(query);
    
    // 查询文章列表
    const articles = await Article.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单篇文章
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username email');
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // 非管理员只能查看已发布的文章
    if (!req.user && !article.isPublished) {
      return res.status(403).json({ message: 'This article is not published' });
    }
    
    // 增加浏览量
    article.viewCount += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建文章
export const createArticle = async (req, res) => {
  try {
    const { title, content, summary, category, tags, coverImage, isPublished } = req.body;
    
    const article = await Article.create({
      title,
      content,
      summary,
      category,
      tags,
      coverImage,
      author: req.user._id,
      isPublished,
    });
    
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新文章
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // 检查权限（只能编辑自己的文章，或管理员可编辑所有文章）
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }
    
    // 更新文章
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除文章
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // 检查权限（只能删除自己的文章，或管理员可删除所有文章）
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }
    
    await article.remove();
    res.json({ message: 'Article removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};