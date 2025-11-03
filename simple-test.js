// 简单的转售功能测试
const SUPABASE_URL = 'https://mftfgofnosakobjfpzss.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA0Mzg5OCwiZXhwIjoyMDc3NjE5ODk4fQ.z9OWWuon_M_NGbqjl3DXyXm0-Se3RCN3piJd4sahXDM';

async function testResaleAPI() {
  console.log('🚀 测试转售API功能...\n');
  
  try {
    // 测试1: 获取转售市场数据
    console.log('1. 测试转售市场数据获取...');
    const marketResponse = await fetch(`${SUPABASE_URL}/functions/v1/resale-api-improved?action=market`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    console.log('状态码:', marketResponse.status);
    const marketData = await marketResponse.json();
    console.log('响应:', JSON.stringify(marketData, null, 2));
    
    // 测试2: 获取转售单列表
    console.log('\n2. 测试转售单列表获取...');
    const listResponse = await fetch(`${SUPABASE_URL}/functions/v1/resale-api-improved?action=list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    console.log('状态码:', listResponse.status);
    const listData = await listResponse.json();
    console.log('响应:', JSON.stringify(listData, null, 2));
    
    // 测试3: 测试无效操作
    console.log('\n3. 测试无效操作...');
    const invalidResponse = await fetch(`${SUPABASE_URL}/functions/v1/resale-api-improved?action=invalid`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    console.log('状态码:', invalidResponse.status);
    const invalidData = await invalidResponse.json();
    console.log('响应:', JSON.stringify(invalidData, null, 2));
    
    console.log('\n✅ 转售API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试错误:', error);
  }
}

// 如果在Node.js环境中运行
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  const fetch = require('node-fetch');
  testResaleAPI();
} else if (typeof fetch !== 'undefined') {
  // 在浏览器环境中运行
  testResaleAPI();
} else {
  console.log('请确保安装了node-fetch或在浏览器环境中运行');
}