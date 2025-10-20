// 用于管理API连接和cpolar公网地址的工具函数

// 存储当前的cpolar公网地址
let currentApiBaseUrl = null;
// 上次更新时间
let lastUpdateTime = 0;
// 更新间隔（毫秒）
const UPDATE_INTERVAL = 5 * 60 * 1000; // 临时改为5分钟，方便测试

// 手动配置的cpolar地址（作为备选）
const MANUAL_CPOLAR_URL = 'http://localhost:3000'; // 用户可以手动更新这个地址

/**
 * 从cpolar API获取最新的公网地址
 * @returns {Promise<string>} 后端API的公网地址
 */
export async function fetchCpolarPublicUrl() {
  console.log('开始获取cpolar公网地址...');
  
  try {
    // 1. 首先尝试从cpolar Web界面获取公网地址
    try {
      console.log('尝试访问cpolar Web界面: http://localhost:4040/');
      const response = await fetch('http://localhost:4040/');
      
      if (!response.ok) {
        console.warn(`无法访问cpolar界面: ${response.status}`);
      } else {
        console.log('成功访问cpolar界面，正在解析HTML...');
        // 由于cpolar返回HTML而非JSON，我们需要解析HTML来查找公网地址
        const htmlContent = await response.text();
        
        // 尝试使用正则表达式查找公网地址
        // 匹配类似 https://xxxx.cpolar.io 的URL
        const urlRegex = /https?:\/\/[a-zA-Z0-9-]+\.cpolar\.(io|cn)/g;
        const matches = htmlContent.match(urlRegex);
        
        if (matches && matches.length > 0) {
          // 去重并返回第一个匹配的URL
          const uniqueUrls = [...new Set(matches)];
          console.log('成功获取到cpolar公网地址:', uniqueUrls[0]);
          return uniqueUrls[0];
        } else {
          console.warn('未在cpolar界面找到公网地址');
        }
      }
    } catch (error) {
      console.error('访问cpolar界面失败:', error.message);
    }
    
    // 2. 如果cpolar界面访问失败，使用手动配置的地址
    console.log('使用手动配置的cpolar地址:', MANUAL_CPOLAR_URL);
    return MANUAL_CPOLAR_URL;
    
  } catch (error) {
    console.error('获取cpolar公网地址过程中出现严重错误:', error);
    // 最后的备选方案
    console.log('使用本地地址作为最后的备选:', 'http://localhost:3000');
    return 'http://localhost:3000';
  }
}

/**
 * 获取默认的基础URL
 * @returns {string} 默认的基础URL
 */
function getDefaultBaseUrl() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDev = process.env && process.env.NODE_ENV === 'development';
  
  console.log('环境检测 - localhost:', isLocalhost, 'dev:', isDev);
  
  // 检查是否是开发环境或本地环境
  if (isDev || isLocalhost) {
    console.log('使用本地开发地址: http://localhost:3000');
    return 'http://localhost:3000';
  }
  
  // 生产环境使用备选方案
  console.log('使用生产环境备选地址:', MANUAL_CPOLAR_URL);
  return MANUAL_CPOLAR_URL;
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
 */// 获取当前API基础URL
export async function getBaseUrl() {
  console.log('调用getBaseUrl函数获取当前API基础URL');
  return await getApiBaseUrl();
}

// 构建完整的API URL
export async function buildApiUrl(endpoint) {
  const baseUrl = await getApiBaseUrl();
  // 确保endpoint以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * 强制刷新API基础URL
 * @returns {Promise<string>} 新的API基础URL
 */
export async function forceRefreshApiBaseUrl() {
  console.log('手动刷新API基础URL...');
  return await getApiBaseUrl(true);
}

/**
 * 发送API请求的便捷方法
 * @param {string} endpoint API端点
 * @param {Object} options fetch选项
 * @returns {Promise<any>} API响应数据
 */
export async function apiRequest(endpoint, options = {}) {
  console.log(`准备发送API请求到端点: ${endpoint}`);
  
  // 1. 构建URL
  const url = await buildApiUrl(endpoint);
  console.log(`构建的完整API URL: ${url}`);
  
  // 2. 准备请求选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  };
  
  console.log('请求方法:', defaultOptions.method || 'GET');
  console.log('是否包含请求体:', !!defaultOptions.body);
  
  // 3. 发送请求
  try {
    console.log('开始发送API请求...');
    const response = await fetch(url, defaultOptions);
    
    console.log(`收到API响应，状态码: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法获取错误详情');
      console.error(`API请求失败详情: ${errorText}`);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API请求成功，收到响应数据');
    return data;
  } catch (error) {
    console.error(`API请求错误 (${endpoint}):`, error.message);
    
    // 4. 如果请求失败，尝试刷新URL并重试
    try {
      console.log('尝试刷新API URL并重试...');
      await refreshApiBaseUrl();
      const retryUrl = await buildApiUrl(endpoint);
      console.log(`使用新URL重试: ${retryUrl}`);
      
      const retryResponse = await fetch(retryUrl, defaultOptions);
      
      if (!retryResponse.ok) {
        const errorText = await retryResponse.text().catch(() => '无法获取错误详情');
        console.error(`重试失败详情: ${errorText}`);
        throw new Error(`重试失败: ${retryResponse.status} ${retryResponse.statusText}`);
      }
      
      const data = await retryResponse.json();
      console.log('重试成功，收到响应数据');
      return data;
    } catch (retryError) {
      console.error('重试请求也失败:', retryError.message);
      throw retryError;
    }
  }
}

/**
 * 设置定期更新API URL的定时器
 */
export function setupPeriodicUrlUpdate() {
  console.log(`设置定期API URL更新，间隔: ${UPDATE_INTERVAL / 1000}秒`);
  
  // 立即更新一次
  console.log('立即执行首次API URL更新...');
  refreshApiBaseUrl();
  
  // 设置定时器
  const intervalId = setInterval(async () => {
    console.log('执行定期API URL更新...');
    await refreshApiBaseUrl();
  }, UPDATE_INTERVAL);
  
  console.log('API URL定期更新已启动，定时器ID:', intervalId);
}