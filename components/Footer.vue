<template>
  <footer class="bg-dark text-white py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center mb-8">
          <a href="#" class="text-2xl font-bold mb-4 md:mb-0 flex items-center gap-2">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
            <span>Boge</span>
          </a>
          
          <div class="flex gap-6">
            <a href="#about" class="text-gray-300 hover:text-white transition-custom">关于我</a>
            <a href="#blog" class="text-gray-300 hover:text-white transition-custom">博客简介</a>
            <a href="#articles" class="text-gray-300 hover:text-white transition-custom">文章</a>
            <a href="#contact" class="text-gray-300 hover:text-white transition-custom">联系我</a>
          </div>
        </div>
        
        <div class="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {{ currentYear }} Boge. 保留所有权利.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>