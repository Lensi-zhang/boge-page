# Boge 博格 (Vue 3 版)

这是一个使用 Vue 3 构建的个人博格网站。

## 项目结构

```
.
├── index.html         # 入口HTML文件
├── main.js            # Vue应用入口
├── App.vue            # 根组件
├── style.css          # 全局样式
├── components/        # Vue组件目录
│   ├── Header.vue     # 导航栏组件
│   ├── Hero.vue       # 英雄区域组件
│   ├── About.vue      # 关于开发者组件
│   ├── BlogIntro.vue  # 博格简介组件
│   ├── Articles.vue   # 文章组件
│   ├── Contact.vue    # 联系开发者组件
│   ├── Footer.vue     # 页脚组件
│   └── BackToTop.vue  # 返回顶部组件
├── package.json       # 项目配置和依赖
└── vite.config.js     # Vite构建配置
```

## 技术栈

- Vue 3
- Vite
- Tailwind CSS (CDN)
- Font Awesome (CDN)

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能特点

- 响应式设计，适配移动端和桌面端
- 组件化架构，易于维护和扩展
- 平滑滚动和动画效果
- 社交媒体链接集成
- 返回顶部功能
- 动态年份显示