import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 检查Authorization头
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 提取token
      token = req.headers.authorization.split(' ')[1];
      
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 获取用户信息但不包含密码
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  // 如果没有token
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 管理员权限中间件
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// 编辑器或管理员权限中间件
export const editorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as editor or admin' });
  }
};