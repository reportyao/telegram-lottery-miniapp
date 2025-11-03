#!/bin/bash
# 完整的API修复脚本

cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 停止当前应用 ==="
pkill -f "npm run dev"
sleep 3

echo "=== 重新创建API文件结构 ==="
# 确保API目录存在
mkdir -p app/api/health
mkdir -p app/api/get-products

# 创建健康检查API
cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('健康检查API被调用');
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API服务正常运行'
  });
}
EOF

# 创建商品列表API
cat > app/api/get-products/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('商品列表API被调用');
  
  // 测试商品数据
  const products = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      description: '最新款苹果手机',
      price: 9999,
      image: '/images/iphone15.jpg',
      category: '手机'
    },
    {
      id: '2', 
      title: 'MacBook Air M3',
      description: '轻薄便携笔记本',
      price: 8999,
      image: '/images/macbook.jpg',
      category: '电脑'
    },
    {
      id: '3',
      title: 'AirPods Pro 3',
      description: '主动降噪耳机',
      price: 1899,
      image: '/images/airpods.jpg',
      category: '耳机'
    }
  ];

  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功',
    total: products.length
  });
}
EOF

echo "=== 验证API文件创建 ==="
ls -la app/api/health/
ls -la app/api/get-products/

echo "=== 清理Next.js缓存 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

echo "=== 检查package.json和tsconfig.json ==="
echo "Next.js版本:"
cat package.json | grep -A2 -B2 "next"

echo "=== 在3000端口重新启动应用 ==="
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp
PORT=3000 nohup npm run dev > app.log 2>&1 &
sleep 10

echo "=== 检查应用启动状态 ==="
ps aux | grep "npm run dev" | grep -v grep
echo ""
netstat -tlnp | grep :3000

echo "=== 等待应用完全启动 ==="
sleep 5

echo "=== 测试API端点 ==="
echo "主页: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "健康检查: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"

echo ""
echo "=== 获取详细的API响应 ==="
echo "健康检查API响应内容:"
curl -s http://localhost:3000/api/health | head -5
echo ""
echo "商品列表API响应内容:"
curl -s http://localhost:3000/api/get-products | head -5

echo ""
echo "=== 检查Next.js日志 ==="
tail -10 app.log

echo ""
echo "=== 如果API仍然404，检查具体的路由配置 ==="
echo "检查app目录结构:"
find app -name "*.tsx" -o -name "*.ts" | head -10