import mongoose from 'mongoose';

const NavigationItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NavigationItem',
    default: null,
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NavigationItem',
  }],
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
NavigationItemSchema.index({ order: 1 });
NavigationItemSchema.index({ isActive: 1 });

const NavigationItem = mongoose.model('NavigationItem', NavigationItemSchema);

export default NavigationItem;