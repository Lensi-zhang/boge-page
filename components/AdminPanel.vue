<template>
  <div class="admin-panel">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="nav-left">
        <h1>后台管理系统</h1>
      </div>
      <div class="nav-right">
        <span class="user-info">
          欢迎, {{ currentUsername }}
          <span v-if="isSuperAdmin" class="role-badge super-admin">超级管理员</span>
          <span v-else class="role-badge admin">管理员</span>
        </span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
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
          <li :class="{ active: activeTab === 'articleApproval' }" @click="activeTab = 'articleApproval'">
            <span class="nav-icon">✅</span>
            <span>文章审批</span>
          </li>
          <!-- 管理员设置 - 所有用户可见，用于修改密码 -->
          <li :class="{ active: activeTab === 'adminSettings' }" @click="activeTab = 'adminSettings'">
            <span class="nav-icon">🔐</span>
            <span>账户设置</span>
          </li>
          <!-- 用户管理 - 仅超级管理员可见 -->
          <li v-if="isSuperAdmin" :class="{ active: activeTab === 'userManagement' }" @click="activeTab = 'userManagement'">
            <span class="nav-icon">👥</span>
            <span>用户管理</span>
          </li>
          <!-- 服务器设置 - 仅超级管理员可见 -->
          <li v-if="isSuperAdmin" :class="{ active: activeTab === 'serverSettings' }" @click="activeTab = 'serverSettings'">
            <span class="nav-icon">⚙️</span>
            <span>服务器设置</span>
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
                    v-model="item.visible"
                    @change="toggleNavItemVisibility(item.id)"
                  >
                  <span class="slider round"></span>
                </label>
              </div>

            </div>

            <button class="save-btn" @click="saveNavigationSettings" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存设置' }}
            </button>

            <div v-if="saveMessage" :class="['save-message', saveMessageType]">
              {{ saveMessage }}
            </div>
          </div>
        </div>
        
        <!-- 文章审批 -->
        <div v-if="activeTab === 'articleApproval'" class="tab-content">
          <div class="section-header">
            <h2>文章审批</h2>
            <p>审批用户上传的文章，决定是否适合展示</p>
          </div>
          
          <div class="approval-settings">
            <div class="form-group">
              <label for="approvalFilter">筛选文章</label>
              <select id="approvalFilter" v-model="approvalFilter">
                <option value="pending">待审批</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="all">全部文章</option>
              </select>
            </div>
            
            <div class="articles-list">
              <h3>待审批文章</h3>
              <div v-if="filteredApprovalArticles.length === 0" class="empty-message">
                暂无{{ approvalFilter === 'pending' ? '待审批' : approvalFilter === 'approved' ? '已通过' : approvalFilter === 'rejected' ? '已拒绝' : '' }}文章
              </div>
              
              <div v-else class="approval-articles-grid">
                <div v-for="article in filteredApprovalArticles" :key="article.id" class="approval-article-item" :class="{
                    'status-pending': article.approvalStatus === 'pending',
                    'status-approved': article.approvalStatus === 'approved',
                    'status-rejected': article.approvalStatus === 'rejected'
                  }">
                  <div class="article-header">
                    <h4 class="article-title">{{ article.title }}</h4>
                    <span class="approval-status" :class="'status-' + (article.approvalStatus || 'pending')">
                      {{ article.approvalStatus === 'pending' ? '待审批' : article.approvalStatus === 'approved' ? '已通过' : '已拒绝' }}
                    </span>
                  </div>
                  
                  <div class="article-meta">
                    <span>{{ article.category }}</span>
                    <span>{{ article.uploadTime }}</span>
                    <span v-if="article.author">作者: {{ article.author }}</span>
                  </div>
                  
                  <div class="article-summary">
                    {{ article.summary || '暂无摘要' }}
                  </div>
                  
                  <div class="approval-actions">
                    <button class="approve-btn" @click="approveArticle(article.id)" :disabled="article.approvalStatus === 'approved'">
                      批准
                    </button>
                    <button class="reject-btn" @click="rejectArticle(article.id)" :disabled="article.approvalStatus === 'rejected'">
                      拒绝
                    </button>
                    <button class="reset-btn" @click="resetArticleStatus(article.id)">
                      重置状态
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="approvalMessage" :class="['approval-message', approvalMessageType]">
              {{ approvalMessage }}
            </div>
          </div>
        </div>

        <!-- 文章管理 -->
        <div v-if="activeTab === 'articles'" class="tab-content">
          <div class="section-header">
            <h2>文章管理</h2>
            <p>管理网站的文章内容</p>
          </div>

          <!-- 文章显示设置 -->
          <div class="featured-settings">
            <h3>文章显示设置</h3>
            <p>设置首页显示的最新文章数量和置顶文章</p>
            
            <div class="form-group">
              <label for="displayCount">显示文章数量</label>
              <input 
                type="number" 
                id="displayCount" 
                v-model.number="featuredSettings.displayCount" 
                min="1" 
                max="10"
                placeholder="请输入显示数量"
              >
              <small>最多可显示10篇文章</small>
            </div>
            
            <div class="featured-articles-list">
              <h3>文章置顶设置</h3>
              <p>选择需要在首页优先显示的文章（置顶文章将按选择顺序显示）</p>
              
              <div v-if="articles.length === 0" class="empty-message">
                暂无文章，请先添加文章
              </div>
              
              <div v-else class="articles-grid">
                <div v-for="article in articles" :key="article.id" class="article-item">
                  <label class="article-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="featuredSettings.featuredArticles.includes(article.id)"
                      @change="toggleFeaturedArticle(article.id)"
                    >
                    <span class="article-info">
                      <span class="article-title">{{ article.title }}</span>
                      <span class="article-meta">{{ article.category }} · {{ article.uploadTime }}</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            <button class="save-btn" @click="saveFeaturedSettings" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存设置' }}
            </button>
            
            <div v-if="saveMessage" :class="['save-message', saveMessageType]">
              {{ saveMessage }}
            </div>
          </div>

          <hr class="section-divider">

          <div class="article-upload-form">
            <h3>上传新文章</h3>
            <div class="form-group">
              <label for="articleTitle">文章标题</label>
              <input type="text" id="articleTitle" v-model="articleForm.title" placeholder="请输入文章标题">
            </div>
            <div class="form-group">
              <label for="articleCategory">文章分类</label>
              <select id="articleCategory" v-model="articleForm.category">
                <option value="tech">技术</option>
                <option value="life">生活</option>
                <option value="travel">旅行</option>
              </select>
            </div>
            <div class="form-group">
              <label for="articleSummary">文章摘要</label>
              <textarea id="articleSummary" v-model="articleForm.summary" placeholder="请输入文章摘要" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="articleAuthor">作者</label>
              <input 
                type="text" 
                id="articleAuthor" 
                v-model="articleForm.author" 
                placeholder="请输入作者名称"
              >
            </div>
            <div class="form-group">
              <label for="articleContent">文章内容</label>
              <textarea id="articleContent" v-model="articleForm.content" placeholder="请输入文章内容" rows="10"></textarea>
            </div>
            <button class="submit-btn" @click="submitArticle">提交文章</button>
          </div>

          <div class="articles-list">
            <h3>已上传文章</h3>
            <div class="search-box">
              <input type="text" v-model="searchTerm" placeholder="搜索文章...">
            </div>
            <table class="articles-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>分类</th>
                  <th>上传时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="article in filteredArticles" :key="article.id">
                  <td class="article-title">{{ article.title }}</td>
                  <td>{{ article.category }}</td>
                  <td>{{ article.uploadTime }}</td>
                  <td>
                <button class="edit-btn" @click="editArticle(article)">编辑</button>
                <button class="delete-btn" @click="deleteArticle(article.id)" :class="{ 'delete-btn-active': hoveredArticleId === article.id }" @mouseenter="hoveredArticleId = article.id" @mouseleave="hoveredArticleId = null">删除</button>
              </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 账户设置区域 -->
        <div v-if="activeTab === 'serverSettings'" class="tab-content">
          <div class="section-header">
            <h2>后端服务器地址设置</h2>
            <p>配置后端服务器的连接地址</p>
          </div>
          
          <div class="card">
            <div class="card-body">
              <!-- 当前活动服务器地址信息 -->
              <div class="mb-4">
                <h4 class="text-muted">当前活动的服务器地址</h4>
                <p class="text-lg font-medium" :class="currentActiveServerUrl.includes('localhost') ? 'text-warning' : 'text-success'">
                  {{ currentActiveServerUrl || '未设置' }}
                </p>
                <small class="text-muted">此地址是当前系统正在使用的后端服务器地址</small>
              </div>
              
              <!-- 服务器地址设置表单 -->
              <div class="form-group">
                <label for="backendUrl" class="font-medium mb-2">后端服务器地址</label>
                <input 
                  type="text" 
                  id="backendUrl" 
                  v-model="serverSettings.backendUrl" 
                  class="form-control w-full" 
                  placeholder="输入后端服务器地址，例如 http://localhost:3000 或 https://your-server.com"
                />
                <small class="form-text text-muted mt-1">请确保地址以 http:// 或 https:// 开头，并包含正确的端口号</small>
              </div>
              
              <!-- 操作按钮 -->
              <div class="action-buttons mt-4" style="display: flex; gap: 8px;">
                <button 
                  @click="testServerConnection" 
                  class="btn"
                  :disabled="!serverSettings.backendUrl"
                  style="padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.3s ease; background-color: #28a745; color: white;"
                  :style="{ cursor: !serverSettings.backendUrl ? 'not-allowed' : 'pointer', opacity: !serverSettings.backendUrl ? 0.6 : 1 }"
                  @mouseenter="$event.target.style.transform = 'translateY(-2px)'; $event.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';"
                  @mouseleave="$event.target.style.transform = ''; $event.target.style.boxShadow = '';"
                >
                  测试连接
                </button>
                <button 
                  @click="saveServerSettings" 
                  class="btn"
                  :disabled="!serverSettings.backendUrl || isSaving"
                  style="padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.3s ease; background-color: #28a745; color: white;"
                  :style="{ cursor: (!serverSettings.backendUrl || isSaving) ? 'not-allowed' : 'pointer', opacity: (!serverSettings.backendUrl || isSaving) ? 0.6 : 1 }"
                  @mouseenter="$event.target.style.transform = 'translateY(-2px)'; $event.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';"
                  @mouseleave="$event.target.style.transform = ''; $event.target.style.boxShadow = '';"
                >
                  {{ isSaving ? '保存中...' : '保存设置' }}
                </button>
              </div>
              
              <!-- 消息提示 -->
              <div 
                v-if="serverMessage" 
                class="save-message" 
                :class="saveMessageType"
              >
                {{ serverMessage }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 账户设置区域 -->
        <div v-if="activeTab === 'adminSettings'" class="tab-content">
          <div class="section-header">
              <h2>账户设置</h2>
              <p>修改您的账户密码</p>
            </div>

          <div class="admin-settings-content">
            <div class="settings-section">
              <h3>修改密码</h3>
              <div class="form-group">
                <label for="currentPassword">当前密码</label>
                <input type="password" id="currentPassword" v-model="passwordForm.currentPassword">
              </div>
              <div class="form-group">
                <label for="newPassword">新密码</label>
                <input type="password" id="newPassword" v-model="passwordForm.newPassword">
              </div>
              <div class="form-group">
                <label for="confirmPassword">确认新密码</label>
                <input type="password" id="confirmPassword" v-model="passwordForm.confirmPassword">
              </div>
              <button class="submit-btn" @click="handlePasswordUpdate">更新密码</button>
              <div v-if="passwordMessage" :class="['password-message', passwordMessageType]">
                {{ passwordMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- 用户管理 - 仅超级管理员可见 -->
        <div v-if="activeTab === 'userManagement' && isSuperAdmin" class="tab-content">
          <div class="section-header">
            <h2>用户管理</h2>
            <p>添加和删除用户账户</p>
          </div>

          <div class="user-management-content">
            <!-- 添加新用户表单 -->
            <div class="add-user-form">
              <h3>添加新用户</h3>
              <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" v-model="newUserForm.username" placeholder="请输入用户名">
              </div>
              <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" v-model="newUserForm.password" placeholder="请输入密码">
              </div>
              <div class="form-group">
                <label for="role">角色</label>
                <select id="role" v-model="newUserForm.role">
                  <option value="admin">管理员</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <button class="submit-btn" @click="handleAddUser">添加用户</button>
              <div v-if="userError" class="error-message">
                {{ userError }}
              </div>
              <div v-if="userMessage" class="success-message">
                {{ userMessage }}
              </div>
            </div>

            <!-- 用户列表 -->
            <div class="user-list">
              <h3>用户列表</h3>
              <table class="users-table">
                <thead>
                  <tr>
                    <th>用户名</th>
                    <th>角色</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.username">
                    <td>{{ user.username }}</td>
                    <td>
                      <span v-if="user.role === 'super_admin'" class="role-badge super-admin">超级管理员</span>
                      <span v-else-if="user.role === 'admin'" class="role-badge admin">管理员</span>
                      <span v-else class="role-badge user">普通用户</span>
                    </td>
                    <td>
                      <button 
                        class="delete-btn" 
                        @click="handleDeleteUser(user.username)"
                        v-if="user.username !== 'superadmin'"
                      >
                        删除
                      </button>
                      <span v-else class="disabled-text">不可删除</span>
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
</template>

<script>
import { setBackendServerUrl, getBackendServerUrl, forceRefreshApiBaseUrl } from './utils/apiUtils.js';

export default {
  name: 'AdminPanel',
  data() {
    return {
      activeTab: 'navigation',
      isSuperAdmin: false,
      currentUsername: '',
      navigationItems: [
        { id: 'about', name: '关于开发者', visible: true },
        { id: 'blog', name: '博格简介', visible: true },
        { id: 'articles', name: '文章', visible: true },
        { id: 'contact', name: '联系开发者', visible: true }
      ],
      isSaving: false,
      saveMessage: '',
      saveMessageType: 'success',
      featuredSettings: {
        displayCount: 3,
        featuredArticles: []
      },
      articleForm: {
        title: '',
        category: 'tech',
        summary: '',
        content: '',
        approvalStatus: 'pending',
        author: ''
      },
      articles: [],
      searchTerm: '',
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordMessage: '',
      passwordMessageType: 'success',
      users: [
        { username: 'superadmin', role: 'super_admin' },
        { username: 'admin', role: 'admin' }
      ],
      newUserForm: {
        username: '',
        password: '',
        role: 'admin'
      },
      userError: '',
      userMessage: '',
      hoveredArticleId: null,
      // 文章审批相关
      approvalFilter: 'pending',
      approvalMessage: '',
      approvalMessageType: '',
      // 服务器设置相关
      serverSettings: {
        backendUrl: ''
      },
      currentActiveServerUrl: '',
      serverMessage: '',
      serverMessageType: ''
    }
  },
  computed: {
    filteredArticles() {
      return this.articles.filter(article => 
        article.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    // 筛选审批文章
    filteredApprovalArticles() {
      if (this.approvalFilter === 'all') {
        return this.articles;
      }
      return this.articles.filter(article => article.approvalStatus === this.approvalFilter);
    }
  },
  mounted() {
    // 检查当前登录用户类型
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    // 如果是普通用户登录，显示权限不足提示并重定向
    if (userLoggedIn && !adminLoggedIn) {
      setTimeout(() => {
        alert('你没有管理权限');
        window.location.href = '/';
      }, 100);
      return;
    }
    
    // 如果未登录为管理员，重定向到登录页面
    if (!adminLoggedIn) {
      window.location.href = '/admin-login';
      return;
    }
    
    // 每次组件挂载时检查用户角色
    this.isSuperAdmin = localStorage.getItem('adminRole') === 'super_admin';
    this.currentUsername = localStorage.getItem('adminUsername') || '';
    
    // 根据角色加载不同内容
    this.loadNavigationSettings();
    this.fetchArticles();
    this.loadFeaturedSettings();
    
    // 加载用户列表和服务器设置
    if (this.isSuperAdmin) {
      this.loadUsersFromStorage();
      this.loadServerSettings();
    }
  },
  methods: {
    handleLogout() {
      // 清除登录状态
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminUsername');
      // 通知父组件处理退出逻辑
      this.$emit('logout');
    },
    
    // 密码更新相关方法
    handlePasswordUpdate() {
      // 验证密码
      const currentPassword = localStorage.getItem(`password_${this.currentUsername}`) || 'admin';
      
      if (this.passwordForm.currentPassword !== currentPassword) {
        this.passwordMessage = '当前密码错误';
        this.passwordMessageType = 'error';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 4) {
        this.passwordMessage = '新密码长度至少为4个字符';
        this.passwordMessageType = 'error';
        return;
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordMessage = '两次输入的新密码不一致';
        this.passwordMessageType = 'error';
        return;
      }
      
      // 更新密码
      localStorage.setItem(`password_${this.currentUsername}`, this.passwordForm.newPassword);
      
      this.passwordMessage = '密码更新成功';
      this.passwordMessageType = 'success';
      
      // 重置表单
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      
      // 2秒后清除消息
      setTimeout(() => {
        this.passwordMessage = '';
      }, 2000);
    },
    
    // 添加新用户
    handleAddUser() {
      // 重置消息
      this.userError = '';
      this.userMessage = '';
      
      // 检查用户是否已存在
      if (this.users.some(user => user.username === this.newUserForm.username)) {
        this.userError = '用户名已存在';
        return;
      }
      
      // 检查用户名是否有效
      if (!this.newUserForm.username || this.newUserForm.username.trim().length === 0) {
        this.userError = '用户名不能为空';
        return;
      }
      
      // 检查密码是否有效
      if (!this.newUserForm.password || this.newUserForm.password.length < 4) {
        this.userError = '密码长度至少为4个字符';
        return;
      }
      
      // 添加新用户
      const newUser = {
        username: this.newUserForm.username,
        role: this.newUserForm.role
      };
      
      this.users.push(newUser);
      
      // 在实际项目中，应该调用后端API保存用户
      // 这里简化处理，保存到localStorage
      this.saveUsersToStorage();
      
      // 保存用户密码
      localStorage.setItem(`password_${newUser.username}`, this.newUserForm.password);
      
      this.userMessage = '用户添加成功';
      
      // 重置表单
      this.newUserForm = {
        username: '',
        password: '',
        role: 'admin'
      };
    },
    
    // 删除用户
    handleDeleteUser(username) {
      if (confirm(`确定要删除用户 ${username} 吗？`)) {
        // 先获取用户角色，再删除用户
        const user = this.users.find(u => u.username === username);
        const userRole = user ? user.role : null;
        
        // 从用户列表中删除
        this.users = this.users.filter(user => user.username !== username);
        
        // 更新管理员用户存储
          const adminUsers = this.users.filter(u => u.role === 'admin' || u.role === 'super_admin');
          localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        }
      },
      
      // 服务器设置相关方法
    loadServerSettings() {
      // 从API工具获取当前配置的服务器地址
      this.serverSettings.backendUrl = getBackendServerUrl();
      this.updateCurrentActiveUrl();
    },
    
    async updateCurrentActiveUrl() {
      try {
        // 尝试获取当前实际使用的服务器地址
        const baseUrl = await forceRefreshApiBaseUrl();
        this.currentActiveServerUrl = baseUrl;
      } catch (error) {
        this.currentActiveServerUrl = '无法获取 - 请检查连接';
        console.error('获取当前服务器地址失败:', error);
      }
    },
    
    // 保存用户列表到localStorage
    saveUsersToStorage() {
      // 分离管理员用户和普通用户
      const adminUsers = this.users.filter(u => u.role === 'admin' || u.role === 'super_admin');
      localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
      
      // 注意：普通用户的保存逻辑在UserAuth组件中处理
    },
    
    // 从localStorage加载用户列表（包括管理员和普通用户）
    loadUsersFromStorage() {
      try {
        // 加载管理员用户
        let allUsers = [];
        const adminUsers = localStorage.getItem('adminUsers');
        if (adminUsers) {
          allUsers = [...JSON.parse(adminUsers)];
        } else {
          // 使用默认管理员用户
          allUsers = [
            { username: 'superadmin', role: 'super_admin' },
            { username: 'admin', role: 'admin' }
          ];
        }
        
        // 加载普通用户并添加到用户列表
        const normalUsers = localStorage.getItem('normalUsers');
        if (normalUsers) {
          const parsedNormalUsers = JSON.parse(normalUsers);
          // 为普通用户设置角色并添加到总列表
          parsedNormalUsers.forEach(normalUser => {
            // 检查该用户是否已经在管理员列表中
            if (!allUsers.some(user => user.username === normalUser.username)) {
              allUsers.push({
                username: normalUser.username,
                role: 'user'
              });
            }
          });
        }
        
        this.users = allUsers;
      } catch (error) {
        console.error('加载用户列表失败:', error);
        // 使用默认用户列表
        this.users = [
          { username: 'superadmin', role: 'super_admin' },
          { username: 'admin', role: 'admin' }
        ];
      }
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
    
      async loadFeaturedSettings() {
        try {
        // 从localStorage加载最新文章设置
        const savedSettings = localStorage.getItem('featuredArticlesSettings');
        if (savedSettings) {
          this.featuredSettings = JSON.parse(savedSettings);
        }
      } catch (error) {
        console.error('加载最新文章设置失败:', error);
      }
    },
      
      async saveFeaturedSettings() {
      this.isSaving = true;
      this.saveMessage = '';
      
      try {
        // 保存到localStorage
        localStorage.setItem('featuredArticlesSettings', JSON.stringify(this.featuredSettings));
        
        this.saveMessage = '最新文章设置保存成功';
        this.saveMessageType = 'success';
      } catch (error) {
        this.saveMessage = '保存失败，请重试';
        this.saveMessageType = 'error';
        console.error('保存最新文章设置失败:', error);
      } finally {
        setTimeout(() => {
          this.isSaving = false;
          this.saveMessage = '';
        }, 2000);
      }
    },
    
      toggleFeaturedArticle(articleId) {
      const index = this.featuredSettings.featuredArticles.indexOf(articleId);
      if (index > -1) {
        // 如果已在列表中，移除
        this.featuredSettings.featuredArticles.splice(index, 1);
      } else {
        // 如果不在列表中，添加
        this.featuredSettings.featuredArticles.push(articleId);
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
    
    // 文章相关方法
      async fetchArticles() {
        try {
        // 实际项目中应该从后端API获取文章列表
        // 这里从localStorage加载模拟数据
        const savedArticles = localStorage.getItem('articles');
        if (savedArticles) {
          this.articles = JSON.parse(savedArticles);
          // 确保每篇文章都有审批状态
          this.articles = this.articles.map(article => ({
            ...article,
            approvalStatus: article.approvalStatus || 'pending',
            author: article.author || '管理员'
          }));
        }
      } catch (error) {
        console.error('获取文章列表失败:', error);
      }
    },
      
      async submitArticle() {
      // 验证表单
      if (!this.articleForm.title || !this.articleForm.content) {
        alert('请填写标题和内容');
        return;
      }
      
      try {
        // 创建新文章
        const newArticle = {
          id: Date.now(),
          title: this.articleForm.title,
          category: this.articleForm.category,
          summary: this.articleForm.summary,
          content: this.articleForm.content,
          uploadTime: new Date().toLocaleString(),
          approvalStatus: 'pending',
          author: this.articleForm.author || '管理员'
        };
        
        // 添加到文章列表
        this.articles.push(newArticle);
        
        // 保存到localStorage
        localStorage.setItem('articles', JSON.stringify(this.articles));
        
        // 重置表单
        this.articleForm = {
          title: '',
          category: 'tech',
          summary: '',
          content: '',
          author: ''
        };
        
        alert('文章提交成功');
      } catch (error) {
        console.error('提交文章失败:', error);
        alert('提交失败，请重试');
      }
    },
    
      editArticle(article) {
      // 在实际项目中，这里应该打开编辑对话框
      alert('编辑功能待实现');
    },
      
      deleteArticle(articleId) {
      if (confirm('确定要删除这篇文章吗？')) {
        this.articles = this.articles.filter(article => article.id !== articleId);
        // 保存到localStorage
        localStorage.setItem('articles', JSON.stringify(this.articles));
      }
    },
    
      // 文章审批相关方法
      approveArticle(id) {
      const article = this.articles.find(a => a.id === id);
      if (article) {
        article.approvalStatus = 'approved';
        localStorage.setItem('articles', JSON.stringify(this.articles));
        this.approvalMessage = '文章已批准';
        this.approvalMessageType = 'success';
        setTimeout(() => {
          this.approvalMessage = '';
        }, 3000);
      }
    },
    
      rejectArticle(id) {
      const article = this.articles.find(a => a.id === id);
      if (article) {
        article.approvalStatus = 'rejected';
        localStorage.setItem('articles', JSON.stringify(this.articles));
        this.approvalMessage = '文章已拒绝';
        this.approvalMessageType = 'error';
        setTimeout(() => {
          this.approvalMessage = '';
        }, 3000);
      }
    },
    
    resetArticleStatus(id) {
      const article = this.articles.find(a => a.id === id);
      if (article) {
        article.approvalStatus = 'pending';
        localStorage.setItem('articles', JSON.stringify(this.articles));
        this.approvalMessage = '文章状态已重置为待审批';
        this.approvalMessageType = 'info';
        setTimeout(() => {
          this.approvalMessage = '';
        }, 3000);
      }
    },
    
    // 测试服务器连接
    async testServerConnection() {
      if (!this.serverSettings.backendUrl) {
        this.serverMessage = '请输入服务器地址';
        this.serverMessageType = 'error';
        setTimeout(() => {
          this.serverMessage = '';
        }, 3000);
        return;
      }
      
      try {
        this.serverMessage = '正在测试连接...';
        this.serverMessageType = 'info';
        
        // 尝试访问服务器健康检查端点
        const response = await fetch(`${this.serverSettings.backendUrl}/api/health`);
        
        if (response.ok) {
          const data = await response.json();
          this.serverMessage = '连接成功！服务器响应正常';
          this.serverMessageType = 'success';
          // 更新当前活动服务器地址
          this.currentActiveServerUrl = this.serverSettings.backendUrl;
        } else {
          this.serverMessage = `连接失败：${response.status} ${response.statusText}`;
          this.serverMessageType = 'error';
        }
      } catch (error) {
        this.serverMessage = `连接失败：${error.message}`;
        this.serverMessageType = 'error';
        console.error('测试服务器连接失败:', error);
      } finally {
        setTimeout(() => {
          this.serverMessage = '';
        }, 3000);
      }
    },
    
    // 保存服务器设置
    async saveServerSettings() {
      if (!this.serverSettings.backendUrl) {
        this.serverMessage = '请输入服务器地址';
        this.serverMessageType = 'error';
        setTimeout(() => {
          this.serverMessage = '';
        }, 3000);
        return;
      }
      
      try {
        this.isSaving = true;
        this.serverMessage = '正在保存设置...';
        
        // 使用apiUtils中的方法保存服务器地址
        setBackendServerUrl(this.serverSettings.backendUrl);
        
        // 强制刷新API基础URL
        await forceRefreshApiBaseUrl();
        
        // 更新当前活动服务器地址
        await this.updateCurrentActiveUrl();
        
        this.serverMessage = '服务器设置保存成功！';
        this.serverMessageType = 'success';
      } catch (error) {
        this.serverMessage = `保存失败：${error.message}`;
        this.serverMessageType = 'error';
        console.error('保存服务器设置失败:', error);
      } finally {
        this.isSaving = false;
        setTimeout(() => {
          this.serverMessage = '';
        }, 3000);
      }
    }
  }
}
</script>

<style scoped>
.admin-panel {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-left h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.super-admin {
  background-color: #ff4757;
  color: white;
}

.role-badge.admin {
  background-color: #3742fa;
  color: white;
}

.role-badge.user {
  background-color: #26de81;
  color: white;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

/* 主内容区 */
.admin-content {
  display: flex;
  flex: 1;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  background-color: #34495e;
  color: white;
  padding: 1rem 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.3s;
}

.nav-menu li:hover {
  background-color: #2c3e50;
}

.nav-menu li.active {
  background-color: #1abc9c;
  border-left: 4px solid #16a085;
}

.nav-icon {
  font-size: 1.25rem;
}

/* 主要内容 */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.75rem;
}

.section-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

/* 导航设置样式 */
.navigation-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 最新文章控制样式和文章审批样式 */
  .featured-settings,
  .approval-settings {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .featured-settings h3,
  .approval-settings h3 {
    margin-top: 0;
    color: #333;
  }

  .featured-settings .form-group,
  .form-group {
    margin-bottom: 1rem;
  }

  .featured-settings .form-group label,
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .featured-settings .form-group input,
  .form-group input[type="number"],
  .form-group input[type="text"],
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-group textarea {
    resize: vertical;
  }

  .featured-settings .form-group small,
  .form-group small {
    display: block;
    margin-top: 0.25rem;
    color: #7f8c8d;
    font-size: 0.875rem;
  }

  .featured-articles-list h3,
  .articles-list h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }

  .featured-articles-list p,
  .articles-list p {
    margin: 0 0 1.5rem 0;
    color: #7f8c8d;
  }

  .empty-message {
    padding: 2rem;
    text-align: center;
    color: #7f8c8d;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .articles-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .article-item {
    margin-bottom: 0.5rem;
  }

  .article-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .article-checkbox:hover {
    background-color: #e9ecef;
  }

  .article-checkbox input[type="checkbox"] {
    margin-top: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
  }

  .article-info {
    flex: 1;
  }

  .article-title {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }

  .article-meta {
    display: block;
    font-size: 0.875rem;
    color: #7f8c8d;
  }
  
  /* 文章审批样式 */
  .approval-articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .approval-article-item {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
    border-left: 4px solid #ffc107;
  }
  
  .approval-article-item.status-approved {
    border-left-color: #28a745;
    background-color: #f8fff8;
  }
  
  .approval-article-item.status-rejected {
    border-left-color: #dc3545;
    background-color: #fff8f8;
  }
  
  .approval-article-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .article-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  
  .article-header h4 {
    margin: 0;
    color: #333;
    font-size: 18px;
    flex: 1;
    margin-right: 10px;
  }
  
  .approval-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .approval-status.status-pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .approval-status.status-approved {
    background-color: #d4edda;
    color: #155724;
  }
  
  .approval-status.status-rejected {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .article-summary {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.6;
    color: #555;
    min-height: 60px;
  }
  
  .approval-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .approve-btn,
  .reject-btn,
  .reset-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .approve-btn {
    background-color: #28a745;
    color: white;
  }
  
  .approve-btn:hover:not(:disabled) {
    background-color: #218838;
  }
  
  .reject-btn {
    background-color: #dc3545;
    color: white;
  }
  
  .reject-btn:hover:not(:disabled) {
    background-color: #c82333;
  }
  
  .reset-btn {
    background-color: #6c757d;
    color: white;
  }
  
  .reset-btn:hover {
    background-color: #5a6268;
  }
  
  .approve-btn:disabled,
  .reject-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .save-message,
  .approval-message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
  }
  
  .save-message.success,
  .approval-message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .save-message.error,
  .approval-message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .approval-message.info {
    background-color: #cce7ff;
    color: #004085;
    border: 1px solid #b3d9ff;
  }

.nav-item-config {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item-name {
  font-weight: 600;
  color: #2c3e50;
}

.nav-item-id {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #1abc9c;
}

input:focus + .slider {
  box-shadow: 0 0 1px #1abc9c;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.nav-item-name-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.save-btn {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-start;
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.save-btn:hover:not(:disabled) {
  background-color: #16a085;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.save-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.save-message {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 1rem;
}

.save-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.save-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1abc9c;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #2980b9;
}

/* 文章管理样式 */
.article-upload-form {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.article-upload-form h3,
.articles-list h3,
.admin-settings-content h3,
.user-management-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.25rem;
}

.search-box {
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.articles-table,
.users-table {
  width: 100%;
  border-collapse: collapse;
}

.articles-table th,
.users-table th {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
}

.articles-table td,
.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.delete-btn {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .delete-btn:hover,
    .delete-btn.delete-btn-active {
      background-color: #c0392b;
      transform: scale(1.05);
    }

.disabled-text {
  color: #95a5a6;
  font-size: 0.9rem;
}

/* 错误和成功消息 */
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #c3e6cb;
}

/* 管理员设置样式 */
.admin-settings-content,
.user-management-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section,
.add-user-form,
.user-list {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 0.5rem 0;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
  }
  
  .nav-menu li {
    min-width: 150px;
    padding: 0.75rem 1rem;
    justify-content: center;
  }
  
  .nav-menu li.active {
    border-left: none;
    border-bottom: 4px solid #16a085;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .tab-content {
    padding: 1.5rem;
  }
  
  .articles-table,
  .users-table {
    display: block;
    overflow-x: auto;
  }
  
  .articles-table tr,
  .users-table tr {
    display: block;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .articles-table td,
  .users-table td {
    display: block;
    text-align: right;
    padding: 0.5rem 1rem;
    position: relative;
    border-bottom: 1px solid var(--border-color);
  }
  
  .articles-table td:last-child,
  .users-table td:last-child {
    border-bottom: none;
  }
  
  .articles-table td::before,
  .users-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 16px;
    top: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 12px;
  }
}

.article-title {
  max-width: none;
  white-space: normal;
}
</style>
