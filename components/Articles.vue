<template>
  <section id="articles" class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <h2 class="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-center mb-16 relative">
        <span class="relative z-10">最新文章</span>
        <span class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-primary/20 -z-10 rounded-full"></span>
      </h2>
      
      <div class="max-w-6xl mx-auto py-8">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-center py-16">
          <p class="text-gray-500">加载中...</p>
        </div>
        
        <!-- 无文章提示 -->
        <div v-else-if="articles.length === 0" class="text-center py-16">
          <p class="text-gray-500">暂无文章</p>
        </div>
        
        <!-- 文章列表 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <div v-for="article in articles" :key="article.id" class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
            <div class="p-6">
              <span class="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full mb-3">{{ article.category }}</span>
              <h3 class="text-xl font-bold mb-2">{{ article.title }}</h3>
              <p class="text-gray-500 text-sm mb-4">{{ article.date }}</p>
              <p class="text-gray-600 mb-4 line-clamp-3">{{ article.summary }}</p>
              <button @click="showArticleDetail(article)" class="text-primary hover:underline font-medium">阅读更多</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button @click="loadMoreArticles" class="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium px-8 py-3 rounded-full transition-custom" :disabled="isLoading">
          {{ isLoading ? '加载中...' : '查看更多' }}
        </button>
      </div>
    </div>
    
    <!-- 文章详情模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold">{{ selectedArticle.title }}</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex items-center text-sm text-gray-500 mb-4">
            <span class="bg-primary/10 text-primary px-3 py-1 rounded-full mr-3">{{ selectedArticle.category }}</span>
            <span>{{ selectedArticle.date }}</span>
          </div>
          <div class="text-gray-700 whitespace-pre-line">
            {{ selectedArticle.content || selectedArticle.summary }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Articles',
  data() {
    return {
      articles: [],
      isLoading: false,
      showModal: false,
      selectedArticle: null,
      currentPage: 1,
      pageSize: 6
    }
  },
  mounted() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      this.isLoading = true;
      try {
        // 实际的API调用
        const response = await fetch(`/api/articles?page=${this.currentPage}&pageSize=${this.pageSize}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 假设API返回的数据格式为 { articles: [...] }
        // 如果是第一页，则替换文章列表，否则追加
        if (this.currentPage === 1) {
          this.articles = data.articles || [];
        } else {
          this.articles.push(...(data.articles || []));
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        alert('加载文章失败，请重试');
      } finally {
        this.isLoading = false;
      }
    },
    
    loadMoreArticles() {
      if (!this.isLoading) {
        this.currentPage++;
        this.fetchArticles();
      }
    },
    
    showArticleDetail(article) {
      this.selectedArticle = article;
      this.showModal = true;
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
      this.showModal = false;
      this.selectedArticle = null;
      // 恢复页面滚动
      document.body.style.overflow = '';
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>