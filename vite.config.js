import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 根目录配置
  root: process.cwd(),
  // 基础路径
  base: '/',
  server: {
    // 允许所有主机访问
    allowedHosts: true,
    port: 5173,
    strictPort: false,
    open: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // 优化HMR配置
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    // 增加超时设置
    timeout: 60000,
    // 禁用服务器端渲染的预加载
    preTransformRequests: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 增加代理超时设置
        timeout: 60000
      }
    }
  },
  // 构建优化
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue']
        },
        // 优化大文件分割
        maxChunkSize: 500 * 1024,
        // 优化入口点
        entryFileNames: '[name].[hash].js',
        chunkFileNames: 'chunks/[name].[hash].js'
      }
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 优化构建缓存
    cacheDir: '.vite/cache',
    // 减少初始加载大小
    chunkSizeWarningLimit: 1000
  },
  // 依赖优化
  optimizeDeps: {
    // 预构建常用依赖
    include: ['vue'],
    // 缓存优化结果
    cacheDir: '.vite/optimize-cache'
  },
  // 性能优化
  esbuild: {
    // 优化构建速度
    minifyIdentifiers: true,
    treeShaking: true
  },
  // 路径解析
  resolve: {
    alias: {
      '@': '/src',
      'components': '/components'
    },
    // 减少解析时间
    extensions: ['.vue', '.js', '.jsx', '.ts', '.tsx']
  }
})