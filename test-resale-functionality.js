// 转售功能测试脚本
// 测试从创建转售到购买转售的完整流程

const testResaleFunctionality = async () => {
  console.log('🚀 开始测试转售功能...\n');
  
  // 模拟用户数据
  const testUser1 = {
    id: 'test_user_1',
    telegram_id: 123456789,
    balance: 2000,
    shares: 50
  };
  
  const testUser2 = {
    id: 'test_user_2', 
    telegram_id: 987654321,
    balance: 1500
  };
  
  const testParticipation = {
    id: 'test_participation_1',
    lottery_round_id: 'test_lottery_round',
    shares_count: 50,
    user_id: testUser1.id,
    is_resaleable: true
  };
  
  try {
    // 1. 测试转售市场数据加载
    console.log('1. 测试转售市场数据加载...');
    const marketResponse = await fetch('https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api-improved?action=market', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    });
    
    const marketData = await marketResponse.json();
    console.log('✅ 转售市场API响应:', JSON.stringify(marketData, null, 2));
    
    // 2. 测试创建转售单
    console.log('\n2. 测试创建转售单...');
    const createResaleData = {
      action: 'create',
      participation_id: testParticipation.id,
      shares_to_sell: 20,
      price_per_share: 15
    };
    
    const createResponse = await fetch('https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api-improved?action=create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(createResaleData)
    });
    
    const createResult = await createResponse.json();
    console.log('✅ 创建转售单API响应:', JSON.stringify(createResult, null, 2));
    
    if (createResult.success) {
      const resaleId = createResult.data.id;
      console.log(`\n📋 创建的转售单ID: ${resaleId}`);
      
      // 3. 测试购买转售单
      console.log('\n3. 测试购买转售单...');
      const purchaseData = {
        action: 'purchase',
        resale_id: resaleId,
        buyer_id: testUser2.id,
        shares_to_buy: 20
      };
      
      const purchaseResponse = await fetch('https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api-improved?action=purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify(purchaseData)
      });
      
      const purchaseResult = await purchaseResponse.json();
      console.log('✅ 购买转售单API响应:', JSON.stringify(purchaseResult, null, 2));
      
      // 4. 测试取消转售单
      console.log('\n4. 测试取消转售单...');
      const cancelData = {
        action: 'cancel',
        resale_id: resaleId,
        seller_id: testUser1.id
      };
      
      const cancelResponse = await fetch('https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api-improved?action=cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify(cancelData)
      });
      
      const cancelResult = await cancelResponse.json();
      console.log('✅ 取消转售单API响应:', JSON.stringify(cancelResult, null, 2));
    }
    
    // 5. 测试转售单列表
    console.log('\n5. 测试转售单列表...');
    const listResponse = await fetch('https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api-improved?action=list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    });
    
    const listData = await listResponse.json();
    console.log('✅ 转售单列表API响应:', JSON.stringify(listData, null, 2));
    
    console.log('\n🎉 转售功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
};

// 执行测试
if (typeof window === 'undefined') {
  // 在Node.js环境中运行
  testResaleFunctionality();
} else {
  // 在浏览器环境中运行
  console.log('请在浏览器控制台或Node.js环境中运行此测试脚本');
  console.log('可以在浏览器控制台中调用: testResaleFunctionality()');
}

// 导出函数供浏览器使用
if (typeof window !== 'undefined') {
  window.testResaleFunctionality = testResaleFunctionality;
}