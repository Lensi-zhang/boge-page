// 用于管理API连接和cpolar公网地址的工具函数

// 存储当前的cpolar公网地址
let currentApiBaseUrl = null;
// 上次更新时间
let lastUpdateTime = 0;
// 更新间隔（毫秒）
const UPDATE_INTERVAL = 5 * 60 * 1000; // 临时改为5分钟，方便测试

// 手动配置的后端服务器地址（存储在localStorage中）
function getManualServerUrl() {
  return localStorage.getItem('manualServerUrl') || 'http://localhost:3000';
}

function setManualServerUrl(url) {
  localStorage.setItem('manualServerUrl', url);
}

/**
 * 从cpolar API获取最新的公网地址
 * @returns {Promise<string>} 后端API的公网地址
 */
export async function fetchCpolarPublicUrl() {
  console.log('开始获取API基础地址...');
  
  try {
    // 检查是否为开发环境或本地环境
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDev = import.meta.env?.DEV === true;
    
    console.log('环境检测 - localhost:', isLocalhost, 'dev:', isDev);
    
    // 开发环境或本地环境下直接使用localhost地址，避免cpolar访问
    if (isLocalhost || isDev) {
      console.log('开发环境下直接使用本地地址: http://localhost:3000');
      return 'http://localhost:3000';
    }
    
    // 生产环境下才尝试cpolar（如果有需要）
    // 但默认情况下，我们也优先使用手动配置的地址
    const manualUrl = getManualServerUrl();
    console.log('使用手动配置的服务器地址:', manualUrl);
    return manualUrl;
    
  } catch (error) {
    console.error('获取API基础地址过程中出现错误:', error);
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
  
  // 生产环境使用手动配置的服务器地址
  const manualUrl = getManualServerUrl();
  console.log('使用生产环境手动配置地址:', manualUrl);
  return manualUrl;
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
  currentApiBaseUrl = null; // 清除缓存，强制重新获取
  return await getApiBaseUrl();
}

/**
 * 设置手动配置的后端服务器地址
 * @param {string} url 后端服务器地址
 * @returns {string} 设置的地址
 */
export function setBackendServerUrl(url) {
  console.log('设置新的后端服务器地址:', url);
  setManualServerUrl(url);
  // 清除当前缓存的URL，下次请求时会使用新地址
  currentApiBaseUrl = null;
  return url;
}

/**
 * 获取当前手动配置的后端服务器地址
 * @returns {string} 后端服务器地址
 */
export function getBackendServerUrl() {
  return getManualServerUrl();
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