<template>
  <section class="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-20 md:py-32 overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary"></div>
      <div class="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-secondary"></div>
    </div>
    
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-[clamp(2.5rem,5vw,4rem)] font-bold text-dark mb-6 leading-tight text-shadow">
          探索思想，记录生活
        </h1>
        <p class="text-[clamp(1.1rem,2vw,1.3rem)] text-gray-600 mb-8">
          欢迎来到博格，这里分享思考、学习和生活点滴
        </p>
        <a href="#articles" class="inline-block bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-custom transform hover:-translate-y-1">
          浏览文章
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Hero'
}
</script>

<style scoped>
/* 组件特定样式 */
</style>