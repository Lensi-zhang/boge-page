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
        // 由于GitHub Pages是静态托管，API调用会失败
        // 使用模拟数据作为后备方案，避免页面显示错误
        // 首先尝试使用本地缓存或模拟数据
        if (this.currentPage === 1) {
          // 使用模拟数据
          this.articles = this.getMockArticles();
          this.applyFeaturedSettings();
          this.isLoading = false;
          return;
        }
        
        // 仅在开发环境尝试API调用
        const isDevelopment = !window.location.hostname.includes('github.io');
        if (isDevelopment) {
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
        } else {
          // 在非开发环境，使用模拟数据（已经在上面为第一页处理）
          if (this.currentPage > 1) {
            // 对于更多页面，添加一些额外的模拟文章
            this.articles.push(...this.getMoreMockArticles());
            this.applyFeaturedSettings();
          }
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        // 失败时使用模拟数据作为后备
        if (this.currentPage === 1) {
          this.articles = this.getMockArticles();
        } else {
          this.articles.push(...this.getMoreMockArticles());
        }
        this.applyFeaturedSettings();
      } finally {
        this.isLoading = false;
      }
    },
    
    // 提供模拟文章数据
    getMockArticles() {
      return [
        {
          id: '1',
          title: '欢迎来到伯格博客',
          summary: '这是伯格博客的第一篇文章，介绍了博客的主要功能和使用方法。',
          content: '欢迎来到伯格博客！\n\n伯格博客是一个简单但功能强大的博客系统，支持文章发布、分类管理、用户评论等功能。\n\n主要特点：\n- 简洁美观的界面设计\n- 响应式布局，支持各种设备\n- 支持文章分类和标签\n- 内置评论系统\n- 支持搜索功能\n\n感谢您的访问！',
          category: '公告',
          date: '2024-01-01',
          approvalStatus: 'approved'
        },
        {
          id: '2',
          title: '如何有效提高编程效率',
          summary: '本文分享了一些提高编程效率的实用技巧和工具推荐。',
          content: '在日常开发中，效率是关键。以下是一些可以帮助你提高编程效率的方法：\n\n1. 使用键盘快捷键\n2. 善用代码片段和模板\n3. 学习并使用适当的开发工具\n4. 保持代码整洁，遵循最佳实践\n5. 定期休息，避免疲劳编程\n\n记住，效率不仅仅是速度，还包括代码质量和可维护性。',
          category: '编程技巧',
          date: '2024-01-15',
          approvalStatus: 'approved'
        },
        {
          id: '3',
          title: 'Vue.js 3.0 新特性介绍',
          summary: '深入探讨Vue.js 3.0带来的重大更新和性能改进。',
          content: 'Vue.js 3.0引入了许多令人兴奋的新特性：\n\n- Composition API：提供更灵活的代码组织方式\n- 更好的TypeScript支持\n- 更小的包体积\n- 更快的渲染性能\n- Fragment、Teleport和Suspense等新组件\n\n这些改进使Vue.js在保持易用性的同时，也大大提升了在复杂应用场景中的表现。',
          category: '前端技术',
          date: '2024-01-30',
          approvalStatus: 'approved'
        },
        {
          id: '4',
          title: '现代前端开发工作流',
          summary: '详细介绍现代前端开发的标准工作流程和工具链。',
          content: '现代前端开发已经变得非常复杂，拥有一套完整的工作流程至关重要：\n\n1. 项目初始化与脚手架工具\n2. 依赖管理\n3. 开发服务器与热重载\n4. 代码检查与格式化\n5. 构建与优化\n6. 测试策略\n7. 部署自动化\n\n合理配置这些环节，可以显著提高团队协作效率和代码质量。',
          category: '开发实践',
          date: '2024-02-15',
          approvalStatus: 'approved'
        },
        {
          id: '5',
          title: '响应式设计最佳实践',
          summary: '分享响应式网页设计的核心原则和实现技巧。',
          content: '响应式设计是现代Web开发的基础，以下是一些最佳实践：\n\n- 移动优先设计\n- 使用弹性布局(Flexbox)和网格布局(Grid)\n- 媒体查询的合理使用\n- 响应式图片处理\n- 触摸友好的界面元素\n\n通过这些技术，可以创建出在各种设备上都能提供良好用户体验的网站。',
          category: 'UI/UX',
          date: '2024-02-28',
          approvalStatus: 'approved'
        },
        {
          id: '6',
          title: '前端性能优化指南',
          summary: '全面介绍前端性能优化的方法和工具。',
          content: '性能优化是前端开发中永恒的话题：\n\n1. 资源压缩与合并\n2. 懒加载与预加载\n3. 缓存策略\n4. 代码分割\n5. 减少重排与重绘\n6. 使用Web Workers处理复杂计算\n\n良好的性能不仅提升用户体验，还能影响搜索引擎排名和转化率。',
          category: '性能优化',
          date: '2024-03-15',
          approvalStatus: 'approved'
        }
      ];
    },
    
    // 提供更多页面的模拟文章数据
    getMoreMockArticles() {
      const baseDate = new Date('2024-03-16');
      return [
        {
          id: '7',
          title: 'JavaScript异步编程深入理解',
          summary: '深入剖析JavaScript中的Promise、async/await等异步编程模式。',
          content: 'JavaScript的异步编程经历了从回调函数到Promise，再到async/await的演进：\n\n1. 回调地狱问题及解决方案\n2. Promise的原理与使用\n3. async/await语法糖\n4. 错误处理策略\n5. 并发控制技巧\n\n掌握这些异步编程模式，可以编写出更清晰、更易维护的代码。',
          category: 'JavaScript',
          date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'),
          approvalStatus: 'approved'
        },
        {
          id: '8',
          title: 'CSS Grid布局完全指南',
          summary: '从基础到高级，全面介绍CSS Grid布局系统。',
          content: 'CSS Grid是一个强大的二维布局系统：\n\n- Grid容器与网格项\n- 网格线与网格轨道\n- 网格区域\n- 自动布局与命名网格\n- 响应式网格设计\n- 网格与Flexbox的结合使用\n\nGrid布局彻底改变了我们设计网页布局的方式，使复杂布局变得简单直观。',
          category: 'CSS',
          date: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'),
          approvalStatus: 'approved'
        }
      ];
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