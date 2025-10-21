<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm transition-custom">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <a href="#" 
         class="text-2xl font-bold text-primary flex items-center gap-2" 
         @mousedown="startLongPress"
         @touchstart="startLongPress"
         @mouseup="cancelLongPress"
         @touchend="cancelLongPress"
         @mouseleave="cancelLongPress"
         @touchcancel="cancelLongPress"
         @click="handlePublishArticleClick"
      >
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        <span>Boge</span>
      </a>
      
      <div class="flex items-center gap-4">
        <!-- 桌面导航 -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="#about" class="text-gray-600 hover:text-primary transition-custom">关于开发者</a>
          <a href="#blog" class="text-gray-600 hover:text-primary transition-custom">博格简介</a>
          <a href="#articles" class="text-gray-600 hover:text-primary transition-custom">文章</a>
          <a href="#contact" class="text-gray-600 hover:text-primary transition-custom">联系开发者</a>
        </nav>
        
        <!-- 用户登录/账户 -->
        <div class="hidden md:block relative">
          <!-- 未登录状态 -->
          <button v-if="!isUserLoggedIn" @click="showUserAuth = true" class="login-btn">
            <i class="fa fa-user-circle-o" aria-hidden="true"></i>
            <span>登录</span>
          </button>
          
          <!-- 已登录状态 -->
          <div v-else class="user-menu-wrapper">
            <button @click="toggleUserMenu" class="user-menu-trigger">
              <i class="fa fa-user-circle-o" aria-hidden="true"></i>
              <span>{{ username }}</span>
              <i class="fa fa-angle-down" aria-hidden="true"></i>
            </button>
            
            <!-- 用户下拉菜单 -->
            <div v-show="userMenuOpen" class="user-dropdown-menu">
              <button @click="handlePublishArticle" class="dropdown-item">
                <i class="fa fa-pencil" aria-hidden="true"></i>
                <span>发布文章</span>
              </button>
              <button @click="handleUserSettings" class="dropdown-item">
                <i class="fa fa-cog" aria-hidden="true"></i>
                <span>设置</span>
              </button>
              <button @click="handleUserLogout" class="dropdown-item">
                <i class="fa fa-sign-out" aria-hidden="true"></i>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <button @click="toggleMenu" class="md:hidden text-gray-600 hover:text-primary transition-custom">
        <i :class="['fa', menuOpen ? 'fa-times' : 'fa-bars', 'text-xl']" aria-hidden="true"></i>
      </button>
    </div>
    
    <!-- 移动端导航菜单 -->
      <div v-show="menuOpen" class="md:hidden bg-white border-t">
        <div class="container mx-auto px-4 py-2 flex flex-col space-y-3">
          <a href="#about" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">关于开发者</a>
          <a href="#blog" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">博格简介</a>
          <a href="#articles" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">文章</a>
          <a href="#contact" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">联系开发者</a>
          
          <!-- 移动端用户登录/账户 -->
          <div class="py-2 border-t">
            <!-- 未登录状态 -->
            <button v-if="!isUserLoggedIn" @click="showUserAuth = true; closeMenu()" class="w-full text-left py-2 text-gray-600 hover:text-primary transition-custom">
              <i class="fa fa-user-circle-o" aria-hidden="true"></i>
              <span class="ml-2">登录</span>
            </button>
            
            <!-- 已登录状态 -->
            <div v-else class="flex justify-between items-center user-menu-wrapper">
              <div class="flex items-center">
                <i class="fa fa-user-circle-o" aria-hidden="true"></i>
                <span class="ml-2">{{ username }}</span>
              </div>
              <button @click="toggleUserMenu" class="text-gray-600">
                <i class="fa fa-angle-down" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 移动端用户下拉菜单 -->
            <div v-show="userMenuOpen" class="ml-6 mt-2 flex flex-col space-y-2">
              <button @click="handlePublishArticle; closeMenu()" class="text-left py-1 text-gray-600 hover:text-primary transition-custom">
                <i class="fa fa-pencil" aria-hidden="true"></i>
                <span class="ml-2">发布文章</span>
              </button>
              <button @click="handleUserSettings; closeMenu()" class="text-left py-1 text-gray-600 hover:text-primary transition-custom">
                <i class="fa fa-cog" aria-hidden="true"></i>
                <span class="ml-2">设置</span>
              </button>
              <button @click="handleUserLogout; closeMenu()" class="text-left py-1 text-gray-600 hover:text-primary transition-custom">
                <i class="fa fa-sign-out" aria-hidden="true"></i>
                <span class="ml-2">退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 用户登录注册组件 -->
    <UserAuth 
      v-if="showUserAuth" 
      :show="showUserAuth"
      @close="handleAuthClose"
      @login-success="handleAuthSuccess"
    />
  </template>

<script>
import UserAuth from './UserAuth.vue';

export default {
  name: 'Header',
  components: {
    UserAuth
  },
  data() {
    return {
      menuOpen: false,
      longPressTimer: null,
      showUserAuth: false,
      isUserLoggedIn: localStorage.getItem('userLoggedIn') === 'true',
      username: localStorage.getItem('username') || '',
      userMenuOpen: false
    }
  },
  methods: {
      toggleMenu() {
        this.menuOpen = !this.menuOpen
      },
      closeMenu() {
        this.menuOpen = false
      },
      startLongPress() {
        // 设置长按定时器（1.5秒）
        this.longPressTimer = setTimeout(() => {
          // 触发管理员登录界面显示，并传递来源标志
          // 标记为从logo长按触发，这种情况下不显示权限提示
          this.$emit('show-admin-login', { fromLogoPress: true })
        }, 1500)
      },
      toggleUserMenu() {
        this.userMenuOpen = !this.userMenuOpen;
      },
      handlePublishArticleClick() {
        // 点击铅笔图标时调用发布文章函数
        this.handlePublishArticle();
      },
      handlePublishArticle() {
        // 检查用户是否已登录
        const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        if (userLoggedIn) {
          // 触发发布文章事件
          this.$emit('show-article-form');
        } else {
          alert('请先登录后再发布文章');
        }
        this.userMenuOpen = false;
      },
      handleUserSettings() {
        // 用户设置功能，暂时提示
        alert('用户设置功能待实现');
        this.userMenuOpen = false;
      },
    handleUserLogout() {
      // 清除登录状态
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('username');
      
      // 更新状态
      this.isUserLoggedIn = false;
      this.username = '';
      this.userMenuOpen = false;
      
      // 刷新页面以确保状态更新
      window.location.reload();
    },
    handleAuthSuccess(username) {
      // 处理登录成功
      this.isUserLoggedIn = true;
      this.username = username;
      this.showUserAuth = false;
    },
    handleAuthClose() {
      this.showUserAuth = false;
    },
    cancelLongPress() {
      // 清除长按定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    }
  },
  mounted() {
    // 添加点击外部区域关闭下拉菜单的功能
    this.handleClickOutside = (event) => {
      // 确保组件实例存在且有$el属性
      if (!this.$el) return;
      
      try {
        // 检查点击的元素是否在用户菜单或触发器内
        const userMenuWrapper = this.$el.querySelector('.user-menu-wrapper');
        if (userMenuWrapper && !userMenuWrapper.contains(event.target) && this.userMenuOpen) {
          this.userMenuOpen = false;
        }
      } catch (error) {
        console.warn('Error in handleClickOutside:', error);
      }
    };
    
    // 添加全局点击事件监听器
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // 组件卸载前清除定时器
    this.cancelLongPress();
    // 关闭下拉菜单
    this.userMenuOpen = false;
    // 移除全局点击事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
/* 登录按钮样式 */
.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: transparent;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.login-btn:hover {
  color: var(--primary, #4CAF50);
}

/* 用户菜单样式 */
.user-menu-wrapper {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.user-menu-trigger:hover {
  color: var(--primary, #4CAF50);
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}
</style>