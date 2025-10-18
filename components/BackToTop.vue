<template>
  <button 
    id="backToTop" 
    class="fixed bottom-8 right-8 bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-custom z-50"
    :class="{ 'opacity-0 invisible': !showButton, 'opacity-100 visible': showButton }"
    @click="scrollToTop"
  >
    <i class="fa fa-arrow-up" aria-hidden="true"></i>
  </button>
</template>

<script>
export default {
  name: 'BackToTop',
  data() {
    return {
      showButton: false
    }
  },
  mounted() {
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    // 移除滚动事件监听
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      // 当滚动距离超过300px时显示按钮
      this.showButton = window.scrollY > 300
    },
    scrollToTop() {
      // 平滑滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>