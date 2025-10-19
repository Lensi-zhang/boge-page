<template>
  <section id="contact" class="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-6">联系开发者</h2>
        <p class="text-gray-600 mb-12">
          如果你有任何问题、建议或者合作意向，欢迎通过以下方式联系开发者
        </p>
        
        <div class="flex flex-wrap justify-center gap-10">
          <div 
            v-for="social in socialLinks" 
            :key="social.id"
            class="flex flex-col items-center"
          >
            <a 
              :href="social.url" 
              class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-custom text-gray-600 hover:text-primary mb-3" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i :class="['fa', social.icon, 'text-2xl']" aria-hidden="true"></i>
            </a>
            <span class="font-bold text-gray-700">{{ social.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Contact',
  data() {
    return {
      socialLinks: [
        {
          id: 1,
          name: 'GitHub',
          icon: 'fa-github',
          url: 'https://github.com/Lensi-zhang'
        },
        {
          id: 2,
          name: '稀土掘金',
          icon: 'fa-book',
          url: 'https://juejin.cn/user/1180188819589920?share_token=ceb3875a-8952-43e1-94e5-346d5043d530'
        },
        {
          id: 3,
          name: '程序员客栈',
          icon: 'fa-briefcase',
          url: 'https://www.proginn.com/u/1138328'
        }
      ]
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>