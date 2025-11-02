# 完全清理和修复脚本
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 完全清理环境 ==="
# 停止所有npm和node进程
pkill -9 -f npm
pkill -9 -f node
pkill -9 -f next
sleep 5

# 清理所有相关端口
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
lsof -ti:3004 | xargs kill -9 2>/dev/null
sleep 2

echo "=== 验证环境已清理 ==="
ps aux | grep -E "(npm|node|next)" | grep -v grep
netstat -tlnp | grep -E ":300[0-4]" | head -5

echo "=== 删除旧的API文件并重新创建 ==="
rm -rf app/api/health
rm -rf app/api/get-products

# 重新创建API目录
mkdir -p app/api/health
mkdir -p app/api/get-products

echo "=== 创建健康检查API ==="
cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 健康检查API被调用 - 时间:', new Date().toISOString());
  
  try {
    const response = NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'API服务正常运行',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
    
    console.log('✅ 健康检查API响应生成成功');
    return response;
  } catch (error) {
    console.error('❌ 健康检查API错误:', error);
    return NextResponse.json({
      status: 'error',
      message: '健康检查失败'
    }, { status: 500 });
  }
}
EOF

echo "=== 创建商品列表API ==="
cat > app/api/get-products/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('📦 商品列表API被调用 - 时间:', new Date().toISOString());
  
  try {
    // 测试商品数据
    const products = [
      {
        id: 'test-1',
        title: 'iPhone 15 Pro Max',
        description: '最新款苹果手机，钛金属设计',
        price: 9999,
        currency: 'CNY',
        image: '/images/iphone-15-pro.jpg',
        category: '智能手机',
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        title: 'MacBook Air M3',
        description: '轻薄便携笔记本，M3芯片',
        price: 8999,
        currency: 'CNY', 
        image: '/images/macbook-air-m3.jpg',
        category: '笔记本电脑',
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-3',
        title: 'AirPods Pro 3',
        description: '主动降噪无线耳机',
        price: 1899,
        currency: 'CNY',
        image: '/images/airpods-pro-3.jpg',
        category: '音频设备',
        inStock: true,
        createdAt: new Date().toISOString()
      }
    ];

    const response = NextResponse.json({
      success: true,
      data: products,
      message: '商品列表获取成功',
      total: products.length,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ 商品列表API响应生成成功，返回', products.length, '个商品');
    return response;
  } catch (error) {
    console.error('❌ 商品列表API错误:', error);
    return NextResponse.json({
      success: false,
      message: '获取商品列表失败',
      error: '服务器内部错误'
    }, { status: 500 });
  }
}
EOF

echo "=== 验证API文件创建 ==="
echo "健康检查API文件内容："
head -10 app/api/health/route.ts
echo ""
echo "商品列表API文件内容："
head -10 app/api/get-products/route.ts

echo "=== 清理Next.js缓存 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

echo "=== 检查package.json配置 ==="
echo "Next.js版本信息："
cat package.json | grep -A3 -B3 "next"
echo ""

echo "=== 在3000端口启动应用（强制） ==="
# 强制使用3000端口
PORT=3000 npm run dev > app.log 2>&1 &
NEW_PID=$!
echo "新应用PID: $NEW_PID"
sleep 8

echo "=== 检查应用启动状态 ==="
echo "运行中的进程："
ps aux | grep "npm run dev" | grep -v grep
echo ""
echo "端口监听状态："
netstat -tlnp | grep :3000
echo ""

echo "=== 等待应用完全启动 ==="
sleep 5

echo "=== 测试所有端点 ==="
echo "主页: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "健康检查: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"

echo ""
echo "=== 获取详细API响应 ==="
echo "健康检查API响应："
curl -s http://localhost:3000/api/health | head -10
echo ""
echo "商品列表API响应："
curl -s http://localhost:3000/api/get-products | head -10

echo ""
echo "=== 查看最新启动日志 ==="
tail -20 app.log

echo ""
echo "=== 最终状态检查 ==="
echo "当前运行的所有node/npm进程："
ps aux | grep -E "(node|npm)" | grep -v grep
echo ""
echo "3000端口详细监听信息："
lsof -i :3000 2>/dev/null || echo "3000端口无监听"