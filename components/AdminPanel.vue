<template>
  <div class="admin-panel">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <div class="logo-container">
          <span class="logo-icon">⚙️</span>
          <h1>网站控制中心</h1>
        </div>
      </div>
      <div class="header-right">
        <div class="admin-info">
          <span class="admin-welcome">欢迎回来，管理员</span>
        </div>
        <button class="logout-button" @click="handleLogout" :title="'退出登录'">
          <span class="button-icon">🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="admin-content">
      <!-- 侧边栏导航 -->
      <div class="sidebar">
        <ul class="nav-menu">
          <li :class="{ active: activeTab === 'navigation' }" @click="activeTab = 'navigation'">
            <span class="nav-icon">📋</span>
            <span>导航管理</span>
          </li>
          <li :class="{ active: activeTab === 'articles' }" @click="activeTab = 'articles'">
            <span class="nav-icon">📝</span>
            <span>文章管理</span>
          </li>
        </ul>
      </div>
      
      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 导航管理 -->
        <div v-if="activeTab === 'navigation'" class="tab-content">
          <div class="section-header">
            <h2>导航栏配置</h2>
            <p>管理网站导航栏中显示的各个模块</p>
          </div>
          
          <div class="navigation-settings">
            <div v-for="item in navigationItems" :key="item.id" class="nav-item-config">
              <div class="nav-item-info">
                <div class="nav-item-details">
                  <span class="nav-item-name">{{ item.name }}</span>
                  <span class="nav-item-id">ID: {{ item.id }}</span>
                </div>
                <label class="switch">
                  <input 
                    type="checkbox" 
                    :checked="item.visible" 
                    @change="toggleNavItemVisibility(item.id)"
                    :aria-label="`切换${item.name}可见性`"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="save-button" @click="saveNavigationSettings" :disabled="isSaving">
                <span v-if="!isSaving" class="button-icon">💾</span>
                <span v-else class="button-icon loading-icon">⏳</span>
                {{ isSaving ? '保存中...' : '保存配置' }}
              </button>
            </div>
            
            <transition name="fade">
              <div v-if="saveMessage" :class="['save-message', saveMessageType]">
                <span v-if="saveMessageType === 'success'" class="message-icon">✅</span>
                <span v-else class="message-icon">❌</span>
                {{ saveMessage }}
              </div>
            </transition>
          </div>
        </div>
        
        <!-- 文章管理 -->
        <div v-if="activeTab === 'articles'" class="tab-content">
          <div class="section-header">
            <h2>文章管理</h2>
            <p>上传、编辑和管理您的网站文章</p>
          </div>
          
          <!-- 文章上传表单 -->
          <div class="article-upload card">
            <div class="card-header">
              <h3>上传新文章</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleArticleSubmit">
                <div class="form-row">
                  <div class="form-group">
                    <label for="articleTitle">标题</label>
                    <input 
                      type="text" 
                      id="articleTitle" 
                      v-model="newArticle.title" 
                      placeholder="输入文章标题" 
                      required
                      class="form-control"
                    >
                  </div>
                  <div class="form-group">
                    <label for="articleCategory">分类</label>
                    <select 
                      id="articleCategory" 
                      v-model="newArticle.category" 
                      required
                      class="form-control"
                    >
                      <option value="">选择分类</option>
                      <option value="技术">技术</option>
                      <option value="生活">生活</option>
                      <option value="分享">分享</option>
                      <option value="教程">教程</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="articleSummary">摘要</label>
                  <textarea 
                    id="articleSummary" 
                    v-model="newArticle.summary" 
                    placeholder="输入文章摘要" 
                    rows="3" 
                    required
                    class="form-control"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label for="articleContent">内容</label>
                  <textarea 
                    id="articleContent" 
                    v-model="newArticle.content" 
                    placeholder="输入文章内容" 
                    rows="10" 
                    required
                    class="form-control"
                  ></textarea>
                </div>
                
                <div class="action-buttons">
                  <button type="submit" class="submit-button" :disabled="isSubmitting">
                    <span v-if="!isSubmitting" class="button-icon">📤</span>
                    <span v-else class="button-icon loading-icon">⏳</span>
                    {{ isSubmitting ? '提交中...' : '上传文章' }}
                  </button>
                </div>
              </form>
              
              <transition name="fade">
                <div v-if="articleMessage" :class="['article-message', articleMessageType]">
                  <span v-if="articleMessageType === 'success'" class="message-icon">✅</span>
                  <span v-else class="message-icon">❌</span>
                  {{ articleMessage }}
                </div>
              </transition>
            </div>
          </div>
          
          <!-- 已上传文章列表 -->
          <div class="article-list card">
            <div class="card-header">
              <h3>已上传文章</h3>
            </div>
            <div class="card-body">
              <div class="search-box">
                <div class="search-icon">🔍</div>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="搜索文章标题、分类或摘要..."
                  class="search-input"
                >
              </div>
              
              <div v-if="isLoadingArticles" class="loading">
                <div class="loading-spinner"></div>
                <span>加载中...</span>
              </div>
              
              <div v-else-if="filteredArticles.length === 0" class="no-articles">
                <div class="empty-icon">📝</div>
                <p>暂无文章</p>
                <small>上传一篇新文章开始管理</small>
              </div>
              
              <div v-else class="table-container">
                <table class="articles-table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>分类</th>
                      <th>发布时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="article in filteredArticles" :key="article.id" class="table-row">
                      <td class="article-title">{{ article.title }}</td>
                      <td>
                        <span class="category-badge">{{ article.category }}</span>
                      </td>
                      <td class="article-date">{{ formatDate(article.createdAt) }}</td>
                      <td class="action-buttons">
                        <button class="edit-button" @click="editArticle(article)" title="编辑文章">
                          <span class="button-icon">✏️</span>
                          <span>编辑</span>
                        </button>
                        <button class="delete-button" @click="deleteArticle(article.id)" title="删除文章">
                          <span class="button-icon">🗑️</span>
                          <span>删除</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPanel',
  data() {
    return {
      activeTab: 'navigation',
      isLoadingArticles: false,
      isSaving: false,
      isSubmitting: false,
      saveMessage: '',
      saveMessageType: 'success',
      articleMessage: '',
      articleMessageType: 'success',
      searchQuery: '',
      navigationItems: [
        { id: 'hero', name: '首页横幅', visible: true },
        { id: 'about', name: '关于我们', visible: true },
        { id: 'blogIntro', name: '博客介绍', visible: true },
        { id: 'articles', name: '文章列表', visible: true },
        { id: 'articleForm', name: '发布文章', visible: true },
        { id: 'contact', name: '联系我们', visible: true }
      ],
      newArticle: {
        title: '',
        category: '',
        summary: '',
        content: ''
      },
      articles: [] // 从后端获取的文章列表
    }
  },
  computed: {
    filteredArticles() {
      if (!this.searchQuery) return this.articles;
      return this.articles.filter(article => 
        article.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  mounted() {
    this.loadNavigationSettings();
    this.fetchArticles();
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('adminLoggedIn');
      this.$emit('logout');
    },
    
    async loadNavigationSettings() {
      try {
        // 实际项目中应该从后端API获取配置
        // 这里从localStorage加载配置
        const savedSettings = localStorage.getItem('navigationSettings');
        if (savedSettings) {
          this.navigationItems = JSON.parse(savedSettings);
        }
      } catch (error) {
        console.error('加载导航设置失败:', error);
      }
    },
    
    async saveNavigationSettings() {
      this.isSaving = true;
      this.saveMessage = '';
      
      try {
        // 实际项目中应该调用后端API保存配置
        // 这里保存到localStorage
        localStorage.setItem('navigationSettings', JSON.stringify(this.navigationItems));
        
        this.saveMessage = '导航配置保存成功';
        this.saveMessageType = 'success';
        
        // 触发配置更新事件，让主应用更新导航显示
        this.$emit('navigation-updated', this.navigationItems);
      } catch (error) {
        this.saveMessage = '保存失败，请重试';
        this.saveMessageType = 'error';
        console.error('保存导航设置失败:', error);
      } finally {
        setTimeout(() => {
          this.isSaving = false;
          this.saveMessage = '';
        }, 2000);
      }
    },
    
    toggleNavItemVisibility(itemId) {
      const item = this.navigationItems.find(i => i.id === itemId);
      if (item) {
        item.visible = !item.visible;
      }
    },
    
    async fetchArticles() {
      this.isLoadingArticles = true;
      try {
        // 实际项目中应该调用后端API获取文章列表
        // 这里使用模拟数据
        // const response = await fetch('/api/articles');
        // if (!response.ok) throw new Error('获取文章失败');
        // this.articles = await response.json();
        
        // 模拟数据
        this.articles = [
          {
            id: 1,
            title: 'Vue 3 新特性介绍',
            category: '技术',
            summary: '探索Vue 3带来的Composition API、Teleport等新特性',
            content: 'Vue 3是Vue.js框架重大更新...',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: '前端性能优化实践',
            category: '教程',
            summary: '分享一些实用的前端性能优化技巧',
            content: '性能优化是前端开发中的重要话题...',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        this.isLoadingArticles = false;
      }
    },
    
    async handleArticleSubmit() {
      this.isSubmitting = true;
      this.articleMessage = '';
      
      try {
        // 实际项目中应该调用后端API提交文章
        // const response = await fetch('/api/articles', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(this.newArticle)
        // });
        // if (!response.ok) throw new Error('上传文章失败');
        // const createdArticle = await response.json();
        
        // 模拟添加到列表
        const createdArticle = {
          id: Date.now(),
          ...this.newArticle,
          createdAt: new Date().toISOString()
        };
        
        this.articles.unshift(createdArticle);
        
        // 重置表单
        this.newArticle = {
          title: '',
          category: '',
          summary: '',
          content: ''
        };
        
        this.articleMessage = '文章上传成功';
        this.articleMessageType = 'success';
        
        // 触发文章更新事件
        this.$emit('article-created', createdArticle);
      } catch (error) {
        this.articleMessage = '上传失败，请重试';
        this.articleMessageType = 'error';
        console.error('上传文章失败:', error);
      } finally {
        setTimeout(() => {
          this.isSubmitting = false;
          this.articleMessage = '';
        }, 2000);
      }
    },
    
    editArticle(article) {
      // 编辑功能实现
      this.newArticle = {
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.content
      };
      // 可以滚动到表单顶部
      document.querySelector('.article-upload').scrollIntoView({ behavior: 'smooth' });
    },
    
    async deleteArticle(articleId) {
      if (!confirm('确定要删除这篇文章吗？')) return;
      
      try {
        // 实际项目中应该调用后端API删除文章
        // const response = await fetch(`/api/articles/${articleId}`, {
        //   method: 'DELETE'
        // });
        // if (!response.ok) throw new Error('删除文章失败');
        
        // 模拟删除
        this.articles = this.articles.filter(article => article.id !== articleId);
        
        this.articleMessage = '文章删除成功';
        this.articleMessageType = 'success';
        
        // 触发文章删除事件
        this.$emit('article-deleted', articleId);
      } catch (error) {
        this.articleMessage = '删除失败，请重试';
        this.articleMessageType = 'error';
        console.error('删除文章失败:', error);
      } finally {
        setTimeout(() => {
          this.articleMessage = '';
        }, 2000);
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
/* 基础变量定义 - 优化的配色方案 */
:root {
  /* 文字颜色 */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* 主色调 */
  --primary-color: #22c55e;
  --primary-hover: #16a34a;
  --primary-light: #dcfce7;
  
  /* 辅助色 */
  --secondary-color: #22c55e;
  --secondary-hover: #16a34a;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  
  /* 背景色 */
  --bg-light: #f8fafc;
  --bg-white: #ffffff;
  --bg-card: #ffffff;
  --bg-hover: #f3f4f6;
  
  /* 边框和阴影 */
  --border-color: #e2e8f0;
  --border-hover: #cbd5e1;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* 圆角 */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;
    --border-radius-xl: 20px;
    --border-radius-full: 9999px;
  
  /* 过渡效果 */
  --transition: all 0.25s ease-in-out;
  --transition-fast: all 0.15s ease-in-out;
}

/* 全局样式重置 */
* {
  box-sizing: border-box;
}

/* 主容器样式 */
.admin-panel {
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-light);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.admin-header {
    background-color: #ffffff;
    color: var(--text-primary);
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 9999;
    border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
    opacity: 1;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.admin-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-info {
  display: flex;
  align-items: center;
}

.admin-welcome {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 主内容布局 */
.admin-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 侧边栏 */
.sidebar {
  background-color: var(--bg-white);
  width: 240px;
  border-right: 1px solid var(--border-color);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.sidebar:hover {
  box-shadow: var(--shadow-md);
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 15px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: var(--transition);
  border-left: 4px solid transparent;
  position: relative;
}

.nav-menu li::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: transparent;
  transition: var(--transition-fast);
}

.nav-menu li:hover {
  background-color: var(--bg-hover);
  transform: translateX(2px);
}

.nav-menu li.active {
  background-color: var(--primary-light);
  border-left-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 500;
}

.nav-menu li.active::after {
  background-color: var(--primary-color);
}

.nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  text-align: center;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background-color: var(--bg-light);
}

/* 标签内容 */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 章节标题 */
.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: var(--text-primary);
  font-weight: 700;
  display: flex;
  align-items: center;
}

.section-header p {
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
}

/* 卡片组件 */
.card {
    background-color: var(--bg-card);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-md);
    margin-bottom: 24px;
    overflow: hidden;
    transition: var(--transition);
    border: 1px solid var(--border-color);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-white);
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 24px;
}

/* 导航设置 */
.navigation-settings {
  max-width: 600px;
}

.nav-item-config {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  margin-bottom: 16px;
  background-color: var(--bg-white);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.nav-item-config:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.nav-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.nav-item-id {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 开关样式增强 */
.switch {
    position: relative;
    display: inline-block;
    width: 64px;
    height: 36px;
    border-radius: var(--border-radius-full);
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--text-muted);
    transition: var(--transition);
    border-radius: var(--border-radius-full);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 28px;
  width: 28px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: var(--transition);
  border-radius: var(--border-radius-full);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
  background-clip: padding-box;
}

input:checked + .slider {
  background-color: var(--secondary-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

input:focus + .slider {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  outline: 2px solid var(--secondary-color);
  outline-offset: 2px;
}

input:checked + .slider:before {
  transform: translateX(28px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

/* 按钮样式增强 */
.save-button,
.submit-button,
.logout-button,
.edit-button,
.delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: var(--border-radius-full);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
}

.save-button,
.submit-button,
.edit-button,
.logout-button {
  background-color: var(--secondary-color);
  color: white;
  border-color: var(--secondary-color);
}

.save-button:hover:not(:disabled),
.submit-button:hover:not(:disabled),
.edit-button:hover,
.logout-button:hover {
  background-color: var(--secondary-hover);
  border-color: var(--secondary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.save-button:disabled,
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.delete-button {
  background-color: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.delete-button:hover {
  background-color: var(--danger-hover);
  border-color: var(--danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 按钮点击效果 */
.save-button:active:not(:disabled),
.submit-button:active:not(:disabled),
.logout-button:active,
.edit-button:active,
.delete-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 16px;
}

/* 加载图标 */
.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 操作按钮容器 */
.action-buttons {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 消息提示增强 */
.save-message,
.article-message {
  margin-top: 16px;
  padding: 14px 18px;
  border-radius: var(--border-radius-md);
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  box-shadow: var(--shadow-sm);
}

.save-message.success,
.article-message.success {
  background-color: rgba(56, 161, 105, 0.1);
  color: var(--secondary-color);
  border-color: rgba(56, 161, 105, 0.3);
}

.save-message.error,
.article-message.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
}

.message-icon {
  font-size: 16px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 表单样式增强 */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  flex: 1;
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-control,
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 16px;
  transition: var(--transition);
  background-color: var(--bg-white);
  color: var(--text-primary);
}

.form-control:focus,
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  background-color: var(--bg-white);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

/* 搜索框增强 */
.search-box {
    margin-bottom: 24px;
    position: relative;
    max-width: 400px;
    border-radius: var(--border-radius-full);
    overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 16px;
  pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius-full);
    font-size: 16px;
    transition: var(--transition);
    background-color: var(--bg-white);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

/* 表格样式增强 */
.table-container {
    overflow-x: auto;
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-white);
  min-width: 600px;
}

.articles-table th,
.articles-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.articles-table th {
  background-color: var(--bg-light);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.articles-table tr:last-child td {
  border-bottom: none;
}

.table-row {
  transition: var(--transition);
  position: relative;
}

.table-row:hover {
  background-color: var(--bg-hover);
  transform: translateX(2px);
}

.article-title {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-date {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 分类标签 */
.category-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: var(--border-radius-full);
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 500;
    text-transform: capitalize;
    transition: var(--transition);
}

/* 加载状态增强 */
.loading {
  padding: 60px 40px;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 空状态增强 */
.no-articles {
  padding: 60px 40px;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.no-articles p {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.no-articles small {
  font-size: 14px;
  color: var(--text-muted);
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .main-content {
    padding: 24px;
  }
  
  .form-row {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 12px 16px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .admin-header h1 {
    font-size: 18px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .admin-welcome {
    display: none;
  }
  
  .admin-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 10px 0;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    box-shadow: none;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .nav-menu::-webkit-scrollbar {
    display: none;
  }
  
  .nav-menu li {
    white-space: nowrap;
    border-left: none;
    border-bottom: 4px solid transparent;
    flex-shrink: 0;
    min-width: 140px;
    justify-content: center;
  }
  
  .nav-menu li.active {
    border-left: none;
    border-bottom-color: var(--primary-color);
    background-color: transparent;
  }
  
  .nav-menu li.active::after {
    display: none;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .section-header h2 {
    font-size: 24px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .nav-item-config {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .save-button,
  .submit-button,
  .logout-button,
  .edit-button,
  .delete-button {
    justify-content: center;
  }
  
  .articles-table {
    min-width: auto;
  }
  
  .articles-table th,
  .articles-table td {
    padding: 12px 16px;
  }
  
  .article-title {
    max-width: 150px;
  }
  
  .edit-button,
  .delete-button {
    padding: 8px 12px;
    font-size: 14px;
    margin-right: 8px;
  }
}

@media (max-width: 480px) {
  .search-box {
    max-width: 100%;
  }
  
  .table-container {
    border: none;
  }
  
  .articles-table {
    background-color: transparent;
  }
  
  .articles-table th {
    display: none;
  }
  
  .articles-table tr {
    background-color: var(--bg-white);
    margin-bottom: 16px;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    display: block;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }
  
  .articles-table td {
    display: block;
    text-align: right;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    position: relative;
  }
  
  .articles-table td:last-child {
    border-bottom: none;
  }
  
  .articles-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 16px;
    top: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 12px;
  }
  
  .article-title {
    max-width: none;
    white-space: normal;
  }
}</style>
