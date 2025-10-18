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
      >
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        <span>Boge</span>
      </a>
      
      <!-- 桌面导航 -->
      <nav class="hidden md:flex items-center space-x-8">
        <a href="#about" class="text-gray-600 hover:text-primary transition-custom">关于我</a>
        <a href="#blog" class="text-gray-600 hover:text-primary transition-custom">博客简介</a>
        <a href="#articles" class="text-gray-600 hover:text-primary transition-custom">文章</a>
        <a href="#contact" class="text-gray-600 hover:text-primary transition-custom">联系我</a>
      </nav>
      
      <!-- 移动端菜单按钮 -->
      <button @click="toggleMenu" class="md:hidden text-gray-600 hover:text-primary transition-custom">
        <i :class="['fa', menuOpen ? 'fa-times' : 'fa-bars', 'text-xl']" aria-hidden="true"></i>
      </button>
    </div>
    
    <!-- 移动端导航菜单 -->
    <div v-show="menuOpen" class="md:hidden bg-white border-t">
      <div class="container mx-auto px-4 py-2 flex flex-col space-y-3">
        <a href="#about" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">关于我</a>
        <a href="#blog" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">博客简介</a>
        <a href="#articles" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">文章</a>
        <a href="#contact" class="py-2 text-gray-600 hover:text-primary transition-custom" @click="closeMenu">联系我</a>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      menuOpen: false,
      longPressTimer: null
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
        // 触发管理员登录界面显示
        this.$emit('show-admin-login')
      }, 1500)
    },
    cancelLongPress() {
      // 清除长按定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    }
  },
  beforeUnmount() {
    // 组件卸载前清除定时器
    this.cancelLongPress()
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>