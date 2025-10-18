<template>
  <section id="article-form" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-center mb-16 relative">
        <span class="relative z-10">发布文章</span>
        <span class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-primary/20 -z-10 rounded-full"></span>
      </h2>
      
      <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <form @submit.prevent="submitArticle">
          <div class="mb-6">
            <label for="title" class="block text-gray-700 font-medium mb-2">文章标题</label>
            <input 
              type="text" 
              id="title" 
              v-model="article.title" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入文章标题" 
              required
            >
          </div>
          
          <div class="mb-6">
            <label for="category" class="block text-gray-700 font-medium mb-2">文章分类</label>
            <select 
              id="category" 
              v-model="article.category" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="">请选择分类</option>
              <option value="技术">技术</option>
              <option value="生活">生活</option>
              <option value="经验分享">经验分享</option>
            </select>
          </div>
          
          <div class="mb-6">
            <label for="summary" class="block text-gray-700 font-medium mb-2">文章摘要</label>
            <textarea 
              id="summary" 
              v-model="article.summary" 
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入文章摘要" 
              required
            ></textarea>
          </div>
          
          <div class="mb-8">
            <label for="content" class="block text-gray-700 font-medium mb-2">文章内容</label>
            <textarea 
              id="content" 
              v-model="article.content" 
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="请输入文章内容" 
              required
            ></textarea>
          </div>
          
          <div class="text-center">
            <button 
              type="submit" 
              class="inline-block bg-primary text-white font-medium px-8 py-3 rounded-full transition-custom hover:bg-primary/90"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '发布文章' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ArticleForm',
  data() {
    return {
      article: {
        title: '',
        category: '',
        summary: '',
        content: ''
      },
      isSubmitting: false
    }
  },
  methods: {
    async submitArticle() {
      this.isSubmitting = true;
      try {
        // 实际的API调用
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.article)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 成功响应
        alert('文章发布成功！');
        
        // 重置表单
        this.article = {
          title: '',
          category: '',
          summary: '',
          content: ''
        };
        
        // 通知父组件刷新文章列表
        this.$emit('articlePublished');
      } catch (error) {
        console.error('发布文章失败:', error);
        alert('发布失败，请重试');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>