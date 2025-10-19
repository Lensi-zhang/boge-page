// 测试API响应的脚本
import http from 'http';

http.get('http://localhost:3000/api/articles?page=1&pageSize=6', (res) => {
  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    try {
      console.log('\nAPI响应状态码:', res.statusCode);
      console.log('\n响应内容长度:', rawData.length, '字符');
      
      // 尝试解析JSON
      const parsedData = JSON.parse(rawData);
      console.log('\n解析成功!');
      console.log('\n数据结构:');
      console.log('- 包含articles数组:', Array.isArray(parsedData.articles));
      console.log('- articles数组长度:', parsedData.articles?.length || 0);
      console.log('- 包含pagination对象:', typeof parsedData.pagination === 'object');
      console.log('- pagination内容:', JSON.stringify(parsedData.pagination));
      
      if (Array.isArray(parsedData.articles)) {
        console.log('\n文章详情:');
        parsedData.articles.forEach((article, index) => {
          console.log(`\n文章${index + 1}:`);
          console.log(`- ID: ${article.id}`);
          console.log(`- 标题: ${article.title}`);
          console.log(`- 状态: ${article.status}`);
          console.log(`- 创建时间: ${article.createdAt}`);
        });
      }
      
    } catch (e) {
      console.error('解析JSON失败:', e.message);
      console.log('\n原始响应内容(前500字符):', rawData.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('请求失败:', e.message);
});