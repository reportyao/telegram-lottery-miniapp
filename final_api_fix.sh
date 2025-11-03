#!/bin/bash

echo "=== API路由检查和修复 ==="
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "当前目录: $(pwd)"
echo ""

echo "=== 检查项目结构 ==="
echo "API目录是否存在:"
ls -la app/api/ 2>/dev/null || echo "API目录不存在"

echo ""
echo "=== 检查现有API文件 ==="
find app/api -name "*.ts" -o -name "*.js" 2>/dev/null || echo "未找到API文件"

echo ""
echo "=== 创建必要的API路由 ==="
# 确保API目录存在
mkdir -p app/api/get-products

# 创建API路由文件
cat > app/api/get-products/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 获取商品数据
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        status,
        target_participants,
        current_participants,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '数据库查询失败', details: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: products || [],
      message: '商品列表获取成功'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}
EOF

echo "✅ API路由文件已创建"

echo ""
echo "=== 检查.env.local文件 ==="
cat .env.local

echo ""
echo "=== 重启应用以加载新API ==="
pkill -f "npm run dev"
sleep 3
nohup npm run dev >> app.log 2>&1 &
sleep 10

echo ""
echo "=== 测试API修复结果 ==="
echo "测试 /api/get-products API..."
curl -s -w "HTTP状态码: %{http_code}\n" http://localhost:3000/api/get-products | head -20

echo ""
echo "=== 最终验证 ==="
echo "进程状态:"
ps aux | grep "npm run dev" | grep -v grep

echo ""
echo "端口状态:"
netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"

echo ""
echo "=== 完整测试结果 ==="
echo "主页访问:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/ | head -5

echo ""
echo "管理面板访问:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/admin | head -5