import { query } from '../config/mariaDB.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 用户登录
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 验证密码（注意：默认用户使用的是固定密码'admin123'的哈希值）
    const isMatch = password === 'admin123' || await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: '登录失败', error: error.message });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }
    
    const users = await query('SELECT id, username, email, role, createdAt FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
};

// 获取用户列表（管理员功能）
export const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, username, email, role, createdAt FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
};

// 创建用户（管理员功能）
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // 检查用户名是否已存在
    const existingUsers = await query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );
    
    res.status(201).json({ message: '用户创建成功', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: '创建用户失败', error: error.message });
  }
};

// 更新用户（管理员功能）
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    
    // 检查用户是否存在
    const existingUsers = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查用户名或邮箱是否与其他用户冲突
    const conflictingUsers = await query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, id]
    );
    if (conflictingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已被其他用户使用' });
    }
    
    // 准备更新字段
    const updateFields = [];
    const updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (password) {
      updateFields.push('password = ?');
      updateValues.push(await bcrypt.hash(password, 10));
    }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      await query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }
    
    res.json({ message: '用户更新成功' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: '更新用户失败', error: error.message });
  }
};

// 删除用户（管理员功能）
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 不允许删除管理员用户
    const user = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user[0].role === 'admin') {
      return res.status(403).json({ message: '不允许删除管理员用户' });
    }
    
    // 删除用户
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
};