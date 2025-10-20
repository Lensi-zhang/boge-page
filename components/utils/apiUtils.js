// 用于管理API连接和cpolar公网地址的工具函数

// 存储当前的cpolar公网地址
let currentApiBaseUrl = null;
// 上次更新时间
let lastUpdateTime = 0;
// 更新间隔（毫秒）
const UPDATE_INTERVAL = 60 * 60 * 1000; // 60分钟

/**
 * 从cpolar API获取最新的公网地址
 * @returns {Promise<string>} 后端API的公网地址
 */
export async function fetchCpolarPublicUrl() {
  try {
    // 尝试从cpolar Web界面获取公网地址
    const response = await fetch('http://localhost:4040/');
    
    if (!response.ok) {
      console.warn(`无法访问cpolar界面: ${response.status}`);
      return getDefaultBaseUrl();
    }
    
    // 由于cpolar返回HTML而非JSON，我们需要解析HTML来查找公网地址
    const htmlContent = await response.text();
    
    // 尝试使用正则表达式查找公网地址
    // 匹配类似 https://xxxx.cpolar.io 的URL
    const urlRegex = /https?:\/\/[a-zA-Z0-9-]+\.cpolar\.(io|cn)/g;
    const matches = htmlContent.match(urlRegex);
    
    if (matches && matches.length > 0) {
      // 去重并返回第一个匹配的URL
      const uniqueUrls = [...new Set(matches)];
      console.log('获取到cpolar公网地址:', uniqueUrls[0]);
      return uniqueUrls[0];
    }
    
    console.warn('未在cpolar界面找到公网地址');
    return getDefaultBaseUrl();
  } catch (error) {
    console.error('获取cpolar公网地址失败:', error);
    return getDefaultBaseUrl();
  }
}

/**
 * 获取默认的基础URL
 * @returns {string} 默认的基础URL
 */
function getDefaultBaseUrl() {
  // 检查是否是开发环境
  if (process.env.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // 生产环境使用备选方案 - 可以在这里配置备用地址
  console.warn('使用备选后端地址');
  return 'http://localhost:3000';
}

/**
 * 获取当前的API基础URL，如果需要则更新
 * @returns {Promise<string>} API基础URL
 */
export async function getApiBaseUrl() {
  const now = Date.now();
  
  // 如果没有URL或者超过了更新间隔，更新URL
  if (!currentApiBaseUrl || (now - lastUpdateTime) > UPDATE_INTERVAL) {
    currentApiBaseUrl = await fetchCpolarPublicUrl();
    lastUpdateTime = now;
  }
  
  return currentApiBaseUrl;
}

/**
 * 立即更新API基础URL
 * @returns {Promise<string>} 更新后的API基础URL
 */
export async function refreshApiBaseUrl() {
  currentApiBaseUrl = await fetchCpolarPublicUrl();
  lastUpdateTime = Date.now();
  return currentApiBaseUrl;
}

/**
 * 构建完整的API请求URL
 * @param {string} endpoint API端点路径，如 '/api/articles'
 * @returns {Promise<string>} 完整的API请求URL
 */
export async function buildApiUrl(endpoint) {
  const baseUrl = await getApiBaseUrl();
  // 确保路径正确连接
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * 发送API请求的便捷方法
 * @param {string} endpoint API端点
 * @param {Object} options fetch选项
 * @returns {Promise<any>} API响应数据
 */
export async function apiRequest(endpoint, options = {}) {
  const url = await buildApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API请求错误 (${endpoint}):`, error);
    // 如果请求失败，尝试刷新URL并重试一次
    try {
      console.log('尝试刷新API URL并重试...');
      await refreshApiBaseUrl();
      const retryUrl = await buildApiUrl(endpoint);
      const retryResponse = await fetch(retryUrl, defaultOptions);
      
      if (!retryResponse.ok) {
        throw new Error(`重试失败: ${retryResponse.status} ${retryResponse.statusText}`);
      }
      
      return await retryResponse.json();
    } catch (retryError) {
      console.error('重试请求也失败:', retryError);
      throw retryError;
    }
  }
}

/**
 * 设置定期更新API URL的定时器
 */
export function setupPeriodicUrlUpdate() {
  // 立即更新一次
  refreshApiBaseUrl();
  
  // 设置定时器，每60分钟更新一次
  setInterval(() => {
    console.log('执行定期API URL更新...');
    refreshApiBaseUrl();
  }, UPDATE_INTERVAL);
}