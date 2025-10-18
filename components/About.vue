<template>
  <section id="about" class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-center mb-16 relative">
          <span class="relative z-10">关于我</span>
          <span class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-primary/20 -z-10 rounded-full"></span>
        </h2>
        
        <div class="flex flex-col md:flex-row items-center gap-12">
          <div class="w-full md:w-1/3 flex justify-center">
            <div class="relative">
              <div class="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  :src="avatarUrl" 
                  alt="博主头像" 
                  class="w-full h-full object-cover"
                >
              </div>
              <div class="absolute -bottom-4 -right-4 bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <i class="fa fa-code text-2xl" aria-hidden="true"></i>
              </div>
            </div>
          </div>
          
          <div class="w-full md:w-2/3">
            <h3 class="text-2xl font-bold mb-4">{{ greeting }}</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">
              一名热爱技术与写作的软件工程师，对Web技术、用户体验和交互设计有着浓厚的兴趣。
            </p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              这个博客是记录学习心得、分享技术见解和生活感悟的地方。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      greeting: '你好，我是博主',
      avatarUrl: 'https://p3-passport.byteacctimg.com/img/user-avatar/52550b01fd44b51170eaae83e3bdba5c~120x120.awebp'
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>