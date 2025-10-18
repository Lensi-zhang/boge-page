<template>
  <section id="blog" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-6">博客简介</h2>
        <p class="text-gray-600 mb-12 leading-relaxed">
          这个博客创建于2023年，主要分享以下内容：
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div 
          v-for="item in blogCategories" 
          :key="item.id"
          class="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-custom transform hover:-translate-y-1"
        >
          <div :class="['w-14 h-14', item.bgColor, 'rounded-full flex items-center justify-center mb-6']">
            <i :class="['fa', item.icon, item.textColor, 'text-2xl']" aria-hidden="true"></i>
          </div>
          <h3 class="text-xl font-bold mb-3">{{ item.title }}</h3>
          <p class="text-gray-600">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BlogIntro',
  data() {
    return {
      blogCategories: [
        {
          id: 1,
          title: '技术分享',
          description: '前端开发技术、框架使用心得、编程技巧和解决方案',
          icon: 'fa-laptop',
          bgColor: 'bg-blue-100',
          textColor: 'text-primary'
        },
        {
          id: 2,
          title: '学习笔记',
          description: '新技术学习过程中的笔记、总结和思考',
          icon: 'fa-book',
          bgColor: 'bg-green-100',
          textColor: 'text-secondary'
        },
        {
          id: 3,
          title: '生活感悟',
          description: '旅行见闻、阅读感悟和生活中的思考与体会',
          icon: 'fa-lightbulb-o',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-500'
        }
      ]
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>