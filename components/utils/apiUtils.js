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
    // 访问cpolar的API来获取隧道信息
    // cpolar默认提供了一个本地API在http://localhost:4040/api/tunnels
    const response = await fetch('http://localhost:4040/api/tunnels');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cpolar tunnels: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 查找映射到端口3000的隧道
    if (data.tunnels && data.tunnels.length > 0) {
      // 假设第一个隧道是我们需要的，或者根据端口过滤
      const tunnel = data.tunnels.find(t => 
        t.config && t.config.addr && t.config.addr.includes(':3000')
      ) || data.tunnels[0];
      
      if (tunnel && tunnel.public_url) {
        console.log('获取到cpolar公网地址:', tunnel.public_url);
        return tunnel.public_url;
      }
    }
    
    throw new Error('未找到有效的cpolar隧道信息');
  } catch (error) {
    console.error('获取cpolar公网地址失败:', error);
    // 如果无法从cpolar API获取，使用默认的本地地址作为备选
    return 'http://localhost:3000';
  }
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