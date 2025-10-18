import NavigationItem from '../models/NavigationItem.js';

// 获取所有导航项
export const getNavigationItems = async (req, res) => {
  try {
    // 默认只获取激活的导航项（非管理员）
    const query = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    
    const navigationItems = await NavigationItem.find(query)
      .sort({ order: 1 })
      .populate('children');
    
    // 构建树形结构
    const buildTree = (items) => {
      const rootItems = items.filter(item => !item.parentId);
      
      const addChildren = (parent) => {
        parent.children = items
          .filter(item => item.parentId && item.parentId.toString() === parent._id.toString())
          .map(child => {
            addChildren(child);
            return child;
          });
        return parent;
      };
      
      return rootItems.map(addChildren);
    };
    
    const navigationTree = buildTree(navigationItems);
    res.json(navigationTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个导航项
export const getNavigationItem = async (req, res) => {
  try {
    const item = await NavigationItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Navigation item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建导航项
export const createNavigationItem = async (req, res) => {
  try {
    const { title, path, icon, order, isActive, parentId } = req.body;
    
    const newItem = await NavigationItem.create({
      title,
      path,
      icon,
      order,
      isActive,
      parentId,
    });
    
    // 如果有父项，更新父项的children数组
    if (parentId) {
      await NavigationItem.findByIdAndUpdate(
        parentId,
        { $push: { children: newItem._id } }
      );
    }
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新导航项
export const updateNavigationItem = async (req, res) => {
  try {
    const item = await NavigationItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Navigation item not found' });
    }
    
    // 处理父项变更
    const { parentId } = req.body;
    if (parentId !== undefined && parentId !== item.parentId) {
      // 移除旧父项的引用
      if (item.parentId) {
        await NavigationItem.findByIdAndUpdate(
          item.parentId,
          { $pull: { children: item._id } }
        );
      }
      
      // 添加新父项的引用
      if (parentId) {
        await NavigationItem.findByIdAndUpdate(
          parentId,
          { $push: { children: item._id } }
        );
      }
    }
    
    // 更新导航项
    const updatedItem = await NavigationItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除导航项
export const deleteNavigationItem = async (req, res) => {
  try {
    const item = await NavigationItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Navigation item not found' });
    }
    
    // 递归删除子项
    const deleteRecursively = async (itemId) => {
      const currentItem = await NavigationItem.findById(itemId);
      
      // 先删除所有子项
      if (currentItem.children && currentItem.children.length > 0) {
        for (const childId of currentItem.children) {
          await deleteRecursively(childId);
        }
      }
      
      // 从父项中移除引用
      if (currentItem.parentId) {
        await NavigationItem.findByIdAndUpdate(
          currentItem.parentId,
          { $pull: { children: currentItem._id } }
        );
      }
      
      // 删除当前项
      await currentItem.remove();
    };
    
    await deleteRecursively(req.params.id);
    res.json({ message: 'Navigation item and its children removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};