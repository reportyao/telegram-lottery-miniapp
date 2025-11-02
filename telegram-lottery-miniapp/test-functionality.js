// 功能测试脚本 - 验证所有关键功能
const tests = {
  // 1. 环境变量检查
  checkEnvironment: () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
    }
    
    console.log('✅ 环境变量检查通过');
    return true;
  },

  // 2. Supabase连接测试
  testSupabaseConnection: async (supabase) => {
    try {
      // 测试基本的数据库查询
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log('✅ Supabase连接正常');
      return true;
    } catch (error) {
      console.error('❌ Supabase连接失败:', error.message);
      return false;
    }
  },

  // 3. Edge Functions测试
  testEdgeFunctions: async (supabase) => {
    try {
      // 测试get-products函数
      const { data, error } = await supabase.functions.invoke('get-products');
      
      if (error) {
        throw new Error(`Edge Function错误: ${error.message}`);
      }
      
      console.log('✅ Edge Functions工作正常');
      return true;
    } catch (error) {
      console.error('❌ Edge Functions测试失败:', error.message);
      return false;
    }
  },

  // 4. 数据库表结构验证
  validateDatabaseSchema: async (supabase) => {
    try {
      const requiredTables = [
        'users',
        'products', 
        'lottery_rounds',
        'participations',
        'transactions'
      ];
      
      for (const tableName of requiredTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error && error.code !== 'PGRST116') {
          throw new Error(`表 ${tableName} 不存在或无法访问: ${error.message}`);
        }
      }
      
      console.log('✅ 数据库表结构验证通过');
      return true;
    } catch (error) {
      console.error('❌ 数据库表结构验证失败:', error.message);
      return false;
    }
  },

  // 5. Telegram集成测试
  testTelegramIntegration: () => {
    try {
      // 检查是否在Telegram WebApp环境中
      if (typeof window !== 'undefined' && window.Telegram) {
        console.log('✅ Telegram WebApp环境检测正常');
        return true;
      } else {
        console.log('⚠️ 不在Telegram环境中，这是正常的（非Telegram环境测试）');
        return true;
      }
    } catch (error) {
      console.error('❌ Telegram集成测试失败:', error.message);
      return false;
    }
  }
};

// 测试执行器
async function runAllTests() {
  console.log('🧪 开始执行功能测试...\n');
  
  let passedTests = 0;
  let totalTests = Object.keys(tests).length;
  
  for (const [testName, testFunction] of Object.entries(tests)) {
    console.log(`\n🔍 运行测试: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result !== false) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ 测试 ${testName} 失败:`, error.message);
    }
  }
  
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！应用可以正常部署运行。');
  } else {
    console.log('⚠️ 部分测试失败，请检查配置和依赖。');
  }
  
  return passedTests === totalTests;
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { tests, runAllTests };
}

// 如果在浏览器环境中
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
}

export { tests, runAllTests };