import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 添加索引以优化查询
ArticleSchema.index({ title: 'text', content: 'text', summary: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ isPublished: 1, createdAt: -1 });

const Article = mongoose.model('Article', ArticleSchema);

export default Article;