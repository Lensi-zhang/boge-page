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
          <div v-for="article in displayedArticles" :key="article.id" class="bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow" :class="{ 'featured-article': featuredSettings.featuredArticles.includes(article.id) }">
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
      displayedArticles: [],
      isLoading: false,
      showModal: false,
      selectedArticle: null,
      currentPage: 1,
      pageSize: 6,
      featuredSettings: {
        displayCount: 3,
        featuredArticles: []
      }
    }
  },
  mounted() {
    // 使用防抖函数延迟执行初始加载，避免页面阻塞
    setTimeout(() => {
      this.fetchArticles();
      this.loadFeaturedSettings();
    }, 100);
    
    // 监听localStorage变化，更新文章列表
    window.addEventListener('storage', this.handleStorageChange);
  },
  
  beforeUnmount() {
    // 移除事件监听器，避免内存泄漏
    window.removeEventListener('storage', this.handleStorageChange);
  },
  
  watch: {
    articles() {
      // 当文章列表更新时，重新应用最新文章设置
      this.applyFeaturedSettings();
    },
    featuredSettings() {
      // 当设置更新时，重新应用
      this.applyFeaturedSettings();
    }
  },
  
  methods: {
      loadFeaturedSettings() {
        try {
          // 从localStorage加载最新文章设置
          const savedSettings = localStorage.getItem('featuredArticlesSettings');
          if (savedSettings) {
            this.featuredSettings = JSON.parse(savedSettings);
          }
        } catch (error) {
          console.error('加载最新文章设置失败:', error);
        }
      },
      
      applyFeaturedSettings() {
        // 获取所有已批准文章的副本
        let allArticles = [...this.articles].filter(article => 
          article.approvalStatus === 'approved' || !article.approvalStatus
        );
        
        // 分离置顶文章和普通文章
        const featuredArticles = [];
        const regularArticles = [];
        
        allArticles.forEach(article => {
          if (this.featuredSettings.featuredArticles.includes(article.id)) {
            featuredArticles.push(article);
          } else {
            regularArticles.push(article);
          }
        });
        
        // 按置顶文章的选择顺序排序
        featuredArticles.sort((a, b) => {
          const indexA = this.featuredSettings.featuredArticles.indexOf(a.id);
          const indexB = this.featuredSettings.featuredArticles.indexOf(b.id);
          return indexA - indexB;
        });
        
        // 合并置顶文章和普通文章，并限制显示数量
        this.displayedArticles = [...featuredArticles, ...regularArticles]
          .slice(0, this.featuredSettings.displayCount);
      },
    async fetchArticles() {
      // 检查是否有缓存数据且缓存未过期（5分钟内）
      const cacheKey = `articles_cache_page_${this.currentPage}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheTime = 5 * 60 * 1000; // 5分钟缓存时间
      
      // 如果有有效缓存且是第一页，直接使用缓存数据
      if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < cacheTime && this.currentPage === 1) {
        const approvedArticles = JSON.parse(cachedData);
        this.articles = approvedArticles;
        this.applyFeaturedSettings();
        return;
      }
      
      // 否则发起请求
      this.isLoading = true;
      try {
        // 使用相对路径，通过Vite代理转发到后端服务
        const response = await fetch(`/api/articles?page=${this.currentPage}&pageSize=${this.pageSize}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 处理文章数据，适配模拟数据格式
        const formattedArticles = (data.articles || []).map(article => ({
          id: article._id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          date: new Date(article.createdAt).toLocaleDateString('zh-CN'),
          approvalStatus: article.approvalStatus || 'approved'
        }));
        
        // 过滤出已批准的文章
        const approvedArticles = formattedArticles.filter(article => 
          article.approvalStatus === 'approved' || !article.approvalStatus
        );
        
        // 如果是第一页，则替换文章列表，否则追加
        if (this.currentPage === 1) {
          this.articles = approvedArticles;
          // 缓存第一页数据
          localStorage.setItem(cacheKey, JSON.stringify(approvedArticles));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        } else {
          this.articles.push(...approvedArticles);
        }
        
        // 应用最新文章设置
        this.applyFeaturedSettings();
      } catch (error) {
        console.error('获取文章失败:', error);
        // 失败时不弹出提示，避免影响用户体验
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
    },
    
    // 优化的storage事件处理函数
    handleStorageChange(e) {
      // 只有在当前页面不是后台标签页时才处理变化
      if (document.visibilityState !== 'visible') return;
      
      // 区分不同的变化类型，只做必要的更新
      if (e.key === 'featuredArticlesSettings') {
        this.loadFeaturedSettings();
        // 只重新应用设置，不需要重新获取文章
        this.applyFeaturedSettings();
      } else if (e.key === 'articles') {
        // 对于文章数据变化，使用防抖处理
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this.currentPage = 1;
          // 清除缓存，强制获取新数据
          localStorage.removeItem(`articles_cache_page_1`);
          localStorage.removeItem(`articles_cache_page_1_timestamp`);
          this.fetchArticles();
        }, 300);
      }
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
.featured-article {
  border: 2px solid #4CAF50;
  position: relative;
}

.featured-article::before {
  content: "置顶";
  position: absolute;
  top: 0;
  right: 0;
  background-color: #4CAF50;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  border-bottom-left-radius: 4px;
}
</style>