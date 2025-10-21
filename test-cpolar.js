// 测试cpolar公网地址获取功能
import fetch from 'node-fetch';

async function testCpolarApi() {
  try {
    console.log('尝试访问cpolar API...');
    const response = await fetch('http://localhost:4040/api/tunnels');
    
    if (!response.ok) {
      console.error(`Failed to fetch cpolar tunnels: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('cpolar API响应:', JSON.stringify(data, null, 2));
    
    // 查找映射到端口3000的隧道
    if (data.tunnels && data.tunnels.length > 0) {
      const tunnel = data.tunnels.find(t => 
        t.config && t.config.addr && t.config.addr.includes(':3000')
      ) || data.tunnels[0];
      
      if (tunnel && tunnel.public_url) {
        console.log('找到的cpolar公网地址:', tunnel.public_url);
        // 测试这个公网地址是否可以访问
        try {
          const healthCheckResponse = await fetch(`${tunnel.public_url}/api/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          if (healthCheckResponse.ok) {
            const healthData = await healthCheckResponse.json();
            console.log('通过公网地址访问后端健康检查成功:', healthData);
          } else {
            console.error(`公网地址访问失败: ${healthCheckResponse.status}`);
          }
        } catch (error) {
          console.error('公网地址访问测试失败:', error.message);
        }
      }
    } else {
      console.log('未找到任何cpolar隧道');
    }
  } catch (error) {
    console.error('测试cpolar API失败:', error.message);
  }
}

// 运行测试
testCpolarApi();