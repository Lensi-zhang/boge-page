// 模拟前端API调用流程的测试脚本

// 模拟浏览器环境的window对象
global.window = {
  location: {
    hostname: 'feng-zhang.github.io'
  }
};

global.process = {
  env: {
    NODE_ENV: 'production'
  }
};

// 实现简化版的fetch函数
const fetch = require('node-fetch');
global.fetch = fetch;

// 导入我们的API工具函数
const fs = require('fs');
const path = require('path');

// 读取并执行apiUtils.js文件中的函数
const apiUtilsPath = path.join(__dirname, 'components', 'utils', 'apiUtils.js');
const apiUtilsContent = fs.readFileSync(apiUtilsPath, 'utf8');

// 创建一个安全的环境来执行代码
const vm = require('vm');
const context = {
  fetch,
  window: global.window,
  process: global.process,
  console,
  setInterval: () => {},
  clearInterval: () => {}
};

vm.runInNewContext(apiUtilsContent, context);

// 测试函数
async function testApiFlow() {
  console.log('开始测试API调用流程...');
  
  try {
    // 1. 测试获取cpolar公网地址
    console.log('\n步骤1: 获取cpolar公网地址...');
    const baseUrl = await context.fetchCpolarPublicUrl();
    console.log('获取到的基础URL:', baseUrl);
    
    // 2. 测试API请求
    console.log('\n步骤2: 测试API健康检查...');
    try {
      const healthUrl = `${baseUrl}/api/health`;
      console.log('尝试访问:', healthUrl);
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('健康检查成功:', data);
      } else {
        console.error('健康检查失败:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('健康检查请求失败:', error.message);
    }
    
    // 3. 测试文章发布
    console.log('\n步骤3: 测试文章发布...');
    try {
      const articleData = {
        title: '测试文章',
        category: '技术',
        summary: '这是一篇测试文章',
        content: '测试内容',
        author: '测试用户',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const postUrl = `${baseUrl}/api/articles`;
      console.log('尝试发布文章到:', postUrl);
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('文章发布成功:', data);
      } else {
        console.error('文章发布失败:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('错误详情:', errorData);
      }
    } catch (error) {
      console.error('文章发布请求失败:', error.message);
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 运行测试
testApiFlow();