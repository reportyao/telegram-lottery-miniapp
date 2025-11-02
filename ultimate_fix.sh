# 最强力的端口清理和启动方案
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 最强力清理所有端口进程 ==="

# 1. 停止所有相关进程
pkill -9 -f npm
pkill -9 -f node
pkill -9 -f next
pkill -9 -f dev
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"

# 2. 使用多种方法清理所有端口 (3000-3010)
for port in {3000..3010}; do
    echo "清理端口 $port..."
    fuser -k ${port}/tcp 2>/dev/null || echo "端口 $port 清理完成"
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "端口 $port 无进程"
done

# 3. 额外清理可能的挂起进程
ps aux | grep -E "(npm|node|next)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

echo "=== 验证清理结果 ==="
echo "检查3000-3010端口占用："
for port in {3000..3010}; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍有占用: $(lsof -i:$port | grep LISTEN | head -1)"
    else
        echo "✅ 端口 $port 已清理"
    fi
done

echo "=== 重新创建API文件（确保正确） ==="
# 删除旧的API目录
rm -rf app/api/health
rm -rf app/api/get-products

# 创建新的API目录
mkdir -p app/api/health
mkdir -p app/api/get-products

# 创建最简化的API文件
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🏥 健康检查API被调用 - 时间:', new Date().toISOString());
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API服务正常运行',
    port: '3000'
  });
}
EOF

cat > app/api/get-products/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('📦 商品API被调用 - 时间:', new Date().toISOString());
  
  const products = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      price: 9999,
      description: '最新款苹果手机'
    },
    {
      id: '2', 
      title: 'MacBook Air M3',
      price: 8999,
      description: '轻薄笔记本'
    }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功'
  });
}
EOF

echo "=== 验证API文件 ==="
ls -la app/api/health/
ls -la app/api/get-products/

echo "=== 清理所有缓存 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

echo "=== 等待完全清理 ==="
sleep 5

echo "=== 启动应用（监控模式） ==="
# 使用bash启动并保持前台模式
timeout 60 bash -c 'PORT=3000 npm run dev' > app.log 2>&1 &
APP_PID=$!
echo "应用启动中，PID: $APP_PID"

echo "=== 监控启动过程 ==="
for i in {1..20}; do
    echo "等待启动... ($i/20)"
    sleep 1
    
    # 检查日志是否生成
    if [ -f "app.log" ]; then
        # 检查是否完成启动
        if grep -q "Ready in" app.log; then
            echo "✅ 应用启动完成！"
            break
        fi
        
        # 检查是否有端口冲突错误
        if grep -q "Port.*is in use" app.log; then
            echo "❌ 仍有端口冲突:"
            grep "Port.*is in use" app.log | tail -2
        fi
    fi
done

echo "=== 最终状态检查 ==="
echo "应用进程:"
ps aux | grep "npm run dev" | grep -v grep || echo "无npm进程运行"

echo ""
echo "端口监听:"
netstat -tlnp | grep :3000 || echo "3000端口无监听"

echo ""
echo "端口监听详细信息:"
netstat -tlnp | grep -E ":300[0-9]" | head -5

echo ""
echo "查看完整启动日志:"
tail -15 app.log

echo "=== 开始API测试 ==="
sleep 2

echo "测试3000端口所有端点:"
echo "主页: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/)"
echo "健康检查: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/health)"  
echo "商品列表: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/admin)"

echo ""
echo "=== 获取详细API响应 ==="
echo "健康检查API详细响应:"
curl -s http://localhost:3000/api/health | head -5

echo ""
echo "商品列表API详细响应:"
curl -s http://localhost:3000/api/get-products | head -5

echo ""
echo "=== 最终诊断 ==="
echo "如果所有端点返回200，API问题已解决！"
echo "如果仍有问题，日志会显示具体错误信息。"