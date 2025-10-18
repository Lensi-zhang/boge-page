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
      <AdminLogin @login-success="handleLoginSuccess" />
    </div>
    
    <!-- 普通用户视图 -->
    <div v-else>
      <Header @show-admin-login="showAdminLogin = true" />
      <main>
        <Hero v-if="isNavVisible('hero')" />
        <About v-if="isNavVisible('about')" />
        <BlogIntro v-if="isNavVisible('blogIntro')" />
        <Articles ref="articlesRef" v-if="isNavVisible('articles')" />
        <ArticleForm 
          v-if="isNavVisible('articleForm')" 
          @article-published="handleArticlePublished" 
        />
        <Contact v-if="isNavVisible('contact')" />
      </main>
      <Footer />
      <BackToTop />
    </div>
  </div>
</template>

<script>
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
      navigationSettings: [
        { id: 'hero', name: '首页横幅', visible: true },
        { id: 'about', name: '关于我们', visible: true },
        { id: 'blogIntro', name: '博客介绍', visible: true },
        { id: 'articles', name: '文章列表', visible: true },
        { id: 'articleForm', name: '发布文章', visible: true },
        { id: 'contact', name: '联系我们', visible: true }
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
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      
      // 如果已登录，直接显示管理面板
      if (isLoggedIn) {
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
    },
    
    handleLogout() {
      // 移除登录状态
      localStorage.removeItem('adminLoggedIn');
      this.showAdminPanel = false;
      this.showAdminLogin = false;
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
</style>