import { query } from '../config/mariaDB.js';

// 获取导航列表
export const getNavigationItems = async (req, res) => {
  try {
    // 获取所有激活的导航项
    const navItems = await query(
      'SELECT * FROM navigation_items WHERE isActive = true ORDER BY orderNum ASC'
    );
    
    // 构建树形结构
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          _id: item.id.toString(), // 转换为字符串以匹配前端期望
          children: buildTree(items, item.id)
        }));
    };
    
    const navigationTree = buildTree(navItems);
    res.json(navigationTree);
  } catch (error) {
    console.error('Error fetching navigation items:', error);
    res.status(500).json({ message: '获取导航列表失败', error: error.message });
  }
};

// 获取单个导航项
export const getNavigationItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const items = await query('SELECT * FROM navigation_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ message: '导航项不存在' });
    }
    
    const item = items[0];
    res.json({
      ...item,
      _id: item.id.toString()
    });
  } catch (error) {
    console.error('Error fetching navigation item:', error);
    res.status(500).json({ message: '获取导航项失败', error: error.message });
  }
};

// 创建导航项（管理员功能）
export const createNavigationItem = async (req, res) => {
  try {
    const { title, path, icon, orderNum, isActive, parentId } = req.body;
    
    const result = await query(
      'INSERT INTO navigation_items (title, path, icon, orderNum, isActive, parentId) VALUES (?, ?, ?, ?, ?, ?)',
      [title, path, icon || null, orderNum || 0, isActive !== false, parentId || null]
    );
    
    res.status(201).json({ 
      message: '导航项创建成功', 
      navigationItemId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating navigation item:', error);
    res.status(500).json({ message: '创建导航项失败', error: error.message });
  }
};

// 更新导航项（管理员功能）
export const updateNavigationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, path, icon, orderNum, isActive, parentId } = req.body;
    
    // 检查导航项是否存在
    const existingItems = await query('SELECT * FROM navigation_items WHERE id = ?', [id]);
    if (existingItems.length === 0) {
      return res.status(404).json({ message: '导航项不存在' });
    }
    
    // 不允许将自身或子项设置为父项
    if (parentId && parseInt(parentId) === parseInt(id)) {
      return res.status(400).json({ message: '不能将自身设置为父项' });
    }
    
    // 检查是否会形成循环引用
    if (parentId) {
      const hasChildReference = await query(
        `WITH RECURSIVE cte AS (
          SELECT id FROM navigation_items WHERE id = ?
          UNION ALL
          SELECT ni.id FROM navigation_items ni
          JOIN cte ON ni.parentId = cte.id
        )
        SELECT * FROM cte WHERE id = ?`,
        [id, parentId]
      );
      
      if (hasChildReference.length > 0) {
        return res.status(400).json({ message: '不能形成循环引用' });
      }
    }
    
    // 更新导航项
    await query(
      `UPDATE navigation_items 
       SET title = ?, path = ?, icon = ?, orderNum = ?, isActive = ?, parentId = ? 
       WHERE id = ?`,
      [title, path, icon, orderNum, isActive !== false, parentId || null, id]
    );
    
    res.json({ message: '导航项更新成功' });
  } catch (error) {
    console.error('Error updating navigation item:', error);
    res.status(500).json({ message: '更新导航项失败', error: error.message });
  }
};

// 删除导航项（管理员功能）
export const deleteNavigationItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查导航项是否存在
    const existingItems = await query('SELECT * FROM navigation_items WHERE id = ?', [id]);
    if (existingItems.length === 0) {
      return res.status(404).json({ message: '导航项不存在' });
    }
    
    // 删除导航项（会级联删除子项）
    await query('DELETE FROM navigation_items WHERE id = ?', [id]);
    
    res.json({ message: '导航项删除成功' });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    res.status(500).json({ message: '删除导航项失败', error: error.message });
  }
};

// 获取所有导航项（包括非激活的，用于管理界面）
export const getAllNavigationItems = async (req, res) => {
  try {
    const navItems = await query('SELECT * FROM navigation_items ORDER BY orderNum ASC');
    
    res.json(navItems.map(item => ({
      ...item,
      _id: item.id.toString()
    })));
  } catch (error) {
    console.error('Error fetching all navigation items:', error);
    res.status(500).json({ message: '获取所有导航项失败', error: error.message });
  }
};