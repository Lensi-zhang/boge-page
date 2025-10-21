<template>
  <div class="min-h-screen">
    <!-- 控制端视图 -->
    <div v-if="showAdminPanel">
      <AdminPanel 
        @logout="handleLogout" 
        @navigation-updated="handleNavigationUpdated"
        @article-created="handleArticlePublished"
      />
    </div>
    
    <!-- 控制端登录页面 -->
      <div v-else-if="showAdminLogin">
        <!-- 非管理员用户只要进入管理员登录界面就显示权限提示 -->
        <AdminLogin 
          @login-success="handleLoginSuccess"
          :show-permission-alert="true"
        />
      </div>
    
    <!-- 普通用户视图 -->
    <div v-else>
      <Header @show-admin-login="handleShowAdminLogin" @show-article-form="showArticleFormDialog" />
      <main>
        <Hero v-if="isNavVisible('hero')" />
        <About v-if="isNavVisible('about')" />
        <BlogIntro v-if="isNavVisible('blogIntro')" />
        <Articles ref="articlesRef" v-if="isNavVisible('articles')" />
        <Contact v-if="isNavVisible('contact')" />
      </main>
      
      <!-- 发布文章对话框 -->
      <div v-if="showArticleForm" class="article-form-modal-overlay" @click="closeArticleForm">
        <div class="article-form-modal" @click.stop>
          <button class="article-form-close" @click="closeArticleForm">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
          <ArticleForm @article-published="handleArticlePublished" />
        </div>
      </div>
      <Footer />
      <BackToTop />
    </div>
  </div>
</template>

<script>
// 直接导入组件，避免Promise对象被直接渲染
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import BlogIntro from './components/BlogIntro.vue'
import Articles from './components/Articles.vue'
import ArticleForm from './components/ArticleForm.vue'
import Contact from './components/Contact.vue'
import Footer from './components/Footer.vue'
import BackToTop from './components/BackToTop.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminPanel from './components/AdminPanel.vue'

export default {
  name: 'App',
  components: {
    Header,
    Hero,
    About,
    BlogIntro,
    Articles,
    ArticleForm,
    Contact,
    Footer,
    BackToTop,
    AdminLogin,
    AdminPanel
  },
  data() {
      return {
        showAdminLogin: false,
        showAdminPanel: false,
        showArticleForm: false,
        adminLoginSource: {}, // 保存管理员登录界面的触发来源
        navigationSettings: [
          { id: 'hero', name: '首页横幅', visible: true },
          { id: 'about', name: '关于开发者', visible: true },
          { id: 'blogIntro', name: '博格介绍', visible: true },
          { id: 'articles', name: '文章列表', visible: true },
          { id: 'contact', name: '联系开发者', visible: true }
        ]
      }
  },
  mounted() {
    // 检查是否已登录
    this.checkLoginStatus();
    // 加载导航设置
    this.loadNavigationSettings();
    
    // 监听路由变化（模拟，因为没有使用Vue Router）
    window.addEventListener('popstate', this.checkLoginStatus);
  },
  
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('popstate', this.checkLoginStatus);
  },
  methods: {
      handleShowAdminLogin(options = {}) {
        // 根据传入的选项决定是否显示权限提示
        this.showAdminLogin = true;
        // 保存触发来源信息，供后续使用
        this.adminLoginSource = options;
      },
      showArticleFormDialog() {
        // 直接显示文章表单，因为登录状态检查已在 Header 组件中完成
        this.showArticleForm = true;
      },
      closeArticleForm() {
        this.showArticleForm = false;
      },
      checkLoginStatus() {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
      
      // 如果是普通用户登录，重定向到首页
      if (userLoggedIn && !adminLoggedIn) {
        this.showAdminPanel = false;
        this.showAdminLogin = false;
        return;
      }
      
      // 如果是管理员已登录，显示管理面板
      if (adminLoggedIn) {
        this.showAdminPanel = true;
        this.showAdminLogin = false;
      } else {
        // 如果未登录，但正在尝试访问管理面板
        // 只在明确点击登录按钮时显示登录页面
        if (!this.showAdminLogin) {
          this.showAdminPanel = false;
        }
      }
    },
    
    loadNavigationSettings() {
      try {
        const savedSettings = localStorage.getItem('navigationSettings');
        if (savedSettings) {
          this.navigationSettings = JSON.parse(savedSettings);
        }
      } catch (error) {
        console.error('加载导航设置失败:', error);
      }
    },
    
    isNavVisible(id) {
      const item = this.navigationSettings.find(i => i.id === id);
      return item ? item.visible : true;
    },
    
    handleLoginSuccess() {
      // 确保登录状态保存到localStorage（在AdminLogin.vue中已实现）
      this.showAdminLogin = false;
      this.showAdminPanel = true;
      // 移除页面刷新，直接显示管理面板
    },
    
    handleLogout() {
      // 只清除特定的登录相关信息，保留导航设置等其他数据
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('userLoggedIn');
      
      // 显式设置状态为普通用户视图
      this.showAdminPanel = false;
      this.showAdminLogin = false;
      
      // 强制重新加载页面，避免Vue实例状态缓存问题
      setTimeout(() => {
        // 使用绝对路径进行重定向
        window.location.href = 'https://lensi-zhang.github.io/boge-page/';
      }, 0);
    },
    
    handleNavigationUpdated(settings) {
      this.navigationSettings = settings;
    },
    
    handleArticlePublished() {
      // 当新文章发布时，重置文章组件的页码并重新获取文章列表
      if (this.$refs.articlesRef) {
        this.$refs.articlesRef.currentPage = 1;
        this.$refs.articlesRef.fetchArticles();
      }
    }
  }
}
</script>

<style>
/* 全局样式已在style.css中定义 */

/* 发布文章对话框样式 */
.article-form-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.article-form-modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.article-form-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 10;
}

.article-form-close:hover {
  color: #333;
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .article-form-modal-overlay {
    padding: 10px;
  }
  
  .article-form-modal {
    max-height: 95vh;
    margin: 10px;
  }
}
</style>