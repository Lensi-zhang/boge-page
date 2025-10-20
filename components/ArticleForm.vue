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
          
          <!-- 状态消息显示区域 -->
          <div v-if="statusMessage" class="mb-6">
            <div 
              :class="[
                'w-full px-4 py-3 rounded-lg text-center',
                isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ]"
            >
              {{ statusMessage }}
            </div>
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
        
        <!-- 调试信息面板 -->
        <div v-if="showDebugInfo" class="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">调试信息</h3>
          <div class="space-y-2 text-sm">
            <p><strong>当前API基础URL:</strong> {{ currentApiBaseUrl }}</p>
            <p><strong>连接状态:</strong> {{ connectionStatus }}</p>
            <button 
              @click="checkConnection" 
              class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新检查连接
            </button>
            <button 
              @click="getCurrentApiBaseUrl" 
              class="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              刷新API URL
            </button>
          </div>
        </div>
        
        <!-- 调试面板切换按钮 -->
        <button 
          @click="showDebugInfo = !showDebugInfo" 
          class="mt-4 text-sm text-gray-600 hover:text-primary"
        >
          {{ showDebugInfo ? '隐藏调试信息' : '显示调试信息' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { apiRequest, setupPeriodicUrlUpdate, getBaseUrl, forceRefreshApiBaseUrl } from './utils/apiUtils.js';

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
      isSubmitting: false,
      statusMessage: '',
      isSuccess: false,
      showDebugInfo: false,
      currentApiBaseUrl: '',
      connectionStatus: '未检查'
    }
  },
  
  created() {
    // 组件创建时设置定期更新API URL
    setupPeriodicUrlUpdate();
    // 获取当前API基础URL
    this.getCurrentApiBaseUrl();
  },
  methods: {
    // 获取当前API基础URL
    async getCurrentApiBaseUrl() {
      try {
        console.log('获取当前API基础URL...');
        const baseUrl = await getBaseUrl();
        this.currentApiBaseUrl = baseUrl;
        console.log('当前API基础URL:', baseUrl);
      } catch (error) {
        console.error('获取API基础URL失败:', error);
        this.currentApiBaseUrl = '获取失败';
      }
    },
    
    // 检查与后端的连接状态
    async checkConnection() {
      try {
        console.log('检查后端连接状态...');
        this.connectionStatus = '检查中...';
        
        // 发送健康检查请求
        const response = await apiRequest('/health');
        this.connectionStatus = response.status === 'ok' ? '已连接' : '连接异常';
        console.log('连接状态:', this.connectionStatus);
        
        return response;
      } catch (error) {
        console.error('连接检查失败:', error);
        this.connectionStatus = '未连接';
        throw error;
      }
    },
    
    // 提交文章方法
    async submitArticle() {
      // 表单验证
      if (!this.article.title.trim() || !this.article.content.trim()) {
        this.statusMessage = '请填写文章标题和内容';
        this.isSuccess = false;
        return;
      }

      // 设置提交状态
      this.isSubmitting = true;
      this.statusMessage = '正在发布文章...';

      try {
        // 准备文章数据
        const articleData = {
          ...this.article,
          author: this.article.author || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('文章数据准备:', articleData);
        
        // 先检查连接状态
        await this.checkConnection();
        
        // 使用apiUtils中的apiRequest函数发送请求，自动处理cpolar公网地址
        console.log('发送文章发布请求...');
        const result = await apiRequest('/api/articles', {
          method: 'POST',
          body: JSON.stringify(articleData)
        });
        
        console.log('文章发布成功:', result);
        
        // 成功响应
        this.isSuccess = true;
        this.statusMessage = '文章发布成功！';
        
        // 重置表单
        this.article = {
          title: '',
          category: '',
          summary: '',
          content: ''
        };
        
        // 通知父组件刷新文章列表
        this.$emit('articlePublished');
        
        // 3秒后清除成功消息
        setTimeout(() => {
          this.statusMessage = '';
        }, 3000);
      } catch (error) {
        // 错误处理
        console.error('发布文章失败:', error);
        
        // 根据错误类型显示不同的消息
        if (error.message.includes('Failed to fetch')) {
          this.statusMessage = '网络连接失败，请检查cpolar服务是否正常运行';
        } else if (error.message.includes('404')) {
          this.statusMessage = '未找到API端点，请检查URL配置';
        } else if (error.message.includes('403') || error.message.includes('500')) {
          this.statusMessage = '服务器错误，请稍后重试';
        } else {
          this.statusMessage = '发布失败: ' + error.message;
        }
        
        this.isSuccess = false;
        
        // 刷新API URL
        try {
          console.log('尝试刷新API URL...');
          await forceRefreshApiBaseUrl();
          await this.getCurrentApiBaseUrl();
        } catch (refreshError) {
          console.error('刷新API URL失败:', refreshError);
        }
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