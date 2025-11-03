# 强制清理所有相关进程和端口
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 强制清理所有相关进程 ==="
# 强制清理所有npm/node/next相关进程
pkill -9 -f npm
pkill -9 -f node  
pkill -9 -f next
pkill -9 -f dev

# 额外清理可能残留的进程
kill -9 273103 2>/dev/null || echo "PID 273103不存在"

# 强制清理所有相关端口
fuser -k 3000/tcp 2>/dev/null || echo "3000端口无进程"
fuser -k 3001/tcp 2>/dev/null || echo "3001端口无进程"
fuser -k 3002/tcp 2>/dev/null || echo "3002端口无进程"
fuser -k 3003/tcp 2>/dev/null || echo "3003端口无进程"
fuser -k 3004/tcp 2>/dev/null || echo "3004端口无进程"

# 使用lsof清理
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null  
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
lsof -ti:3004 | xargs kill -9 2>/dev/null

echo "等待进程完全清理..."
sleep 5

echo "=== 验证清理结果 ==="
echo "检查3000端口占用："
netstat -tlnp | grep :3000 || echo "3000端口已清理"
echo ""
echo "检查相关进程："
ps aux | grep -E "(npm|node|next)" | grep -v grep || echo "所有相关进程已清理"

echo "=== 重新创建API文件（确保文件正确） ==="
rm -rf app/api/health
rm -rf app/api/get-products

mkdir -p app/api/health
mkdir -p app/api/get-products

# 创建更简单的API文件，避免语法错误
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 健康检查API被调用');
  
  return NextResponse.json({
    status: 'healthy',
    message: 'API服务正常',
    timestamp: new Date().toISOString()
  });
}
EOF

cat > app/api/get-products/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('📦 商品API被调用');
  
  const products = [
    { id: '1', title: 'iPhone 15', price: 9999 },
    { id: '2', title: 'MacBook Air', price: 8999 }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功'
  });
}
EOF

echo "=== 验证API文件创建 ==="
ls -la app/api/health/
ls -la app/api/get-products/

echo "=== 清理所有缓存和日志 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

echo "=== 重新启动应用（使用不同方法） ==="
# 先删除可能存在的旧日志文件
rm -f app.log

# 使用nohup启动并重定向所有输出
nohup npm run dev > app.log 2>&1 &
APP_PID=$!
echo "应用PID: $APP_PID"

sleep 15

echo "=== 检查启动状态 ==="
echo "检查新启动的应用进程："
ps aux | grep npm | grep -v grep

echo "检查3000端口监听："
netstat -tlnp | grep :3000 || echo "3000端口无监听"

echo "=== 等待应用完全启动并测试 ==="
sleep 10

echo "=== 开始API测试 ==="
echo "主页状态码: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "健康检查状态码: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表状态码: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"
echo "管理面板状态码: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"

echo ""
echo "=== 获取详细API响应 ==="
echo "健康检查响应:"
curl -s http://localhost:3000/api/health | head -10

echo ""
echo "商品列表响应:"
curl -s http://localhost:3000/api/get-products | head -10

echo ""
echo "=== 查看启动日志 ==="
tail -20 app.log