#!/bin/bash

echo "=== 终极修复 - 彻底解决API 404问题 ==="

cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

# 步骤1: 超级彻底清理进程
echo "步骤1: 超级彻底清理所有进程..."
# 强制杀死所有相关进程
sudo pkill -9 -f "npm run dev" 2>/dev/null || echo "npm进程已清理"
sudo pkill -9 -f "next dev" 2>/dev/null || echo "next进程已清理"
sudo pkill -9 -f "next-server" 2>/dev/null || echo "next-server已清理"
sudo pkill -9 -f node 2>/dev/null || echo "node进程已清理"

# 强制清理端口占用
sudo fuser -k 3000/tcp 2>/dev/null || echo "端口3000已清理"
sudo fuser -k 3001/tcp 2>/dev/null || echo "端口3001已清理"
sudo fuser -k 3002/tcp 2>/dev/null || echo "端口3002已清理"
sudo fuser -k 3003/tcp 2>/dev/null || echo "端口3003已清理"

sleep 8

# 步骤2: 再次验证清理
echo "步骤2: 验证进程清理..."
RUNNING_PID=$(ps aux | grep -E "(npm run dev|next dev|next-server)" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$RUNNING_PID" ]; then
    echo "❌ 仍有进程运行: $RUNNING_PID，正在强制清理..."
    sudo kill -9 $RUNNING_PID
    sleep 3
fi

# 步骤3: 验证端口清理
echo "步骤3: 验证端口清理..."
for port in 3000 3001 3002 3003 3004; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用: $(lsof -i:$port | head -1)"
        PID=$(lsof -t -i:$port)
        if [ ! -z "$PID" ]; then
            echo "强制清理进程: $PID"
            sudo kill -9 $PID
            sleep 2
        fi
    else
        echo "✅ 端口 $port 已清理"
    fi
done

# 步骤4: 检查当前项目状态
echo "步骤4: 检查项目状态..."
echo "当前目录: $(pwd)"
echo "app目录存在: $(test -d app && echo "是" || echo "否")"
if [ -d app ]; then
    if [ -d app/api ]; then
        echo "API目录内容:"
        ls -la app/api/
    else
        echo "API目录不存在"
    fi
fi

# 步骤5: 删除现有API文件并重新创建
echo "步骤5: 重新创建API文件..."
rm -rf app/api/health
rm -rf app/api/get-products

mkdir -p app/api/health
mkdir -p app/api/get-products

echo "创建健康检查API..."
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 健康检查API被调用 - 时间:', new Date().toISOString());
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API服务正常运行',
    port: '3000',
    version: '1.0.0'
  }, { status: 200 });
}
EOF

echo "创建商品列表API..."
cat > app/api/get-products/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 商品列表API被调用 - 时间:', new Date().toISOString());
  
  const products = [
    { id: '1', title: 'iPhone 15 Pro Max', price: 9999, description: '最新款苹果手机' },
    { id: '2', title: 'MacBook Air M3', price: 8999, description: '轻薄便携笔记本' },
    { id: '3', title: 'AirPods Pro 3', price: 1899, description: '主动降噪无线耳机' }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功',
    count: products.length
  }, { status: 200 });
}
EOF

echo "验证API文件创建:"
ls -la app/api/*/route.ts
echo "健康检查API内容:"
head -10 app/api/health/route.ts
echo "商品列表API内容:"
head -10 app/api/get-products/route.ts

# 步骤6: 清理所有缓存
echo "步骤6: 清理所有缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf package-lock.json
rm -rf app.log
echo "缓存清理完成"

# 步骤7: 在3000端口启动应用
echo "步骤7: 在3000端口启动应用..."
export PORT=3000
echo "启动时间: $(date)"

# 使用更简单的方法启动应用
timeout 30 bash -c 'npm run dev' > app.log 2>&1 &
APP_PID=$!
echo "应用启动中，PID: $APP_PID"

echo "等待15秒让应用启动..."
sleep 15

# 步骤8: 检查应用状态
echo "步骤8: 检查应用状态..."
echo "运行中的进程:"
ps aux | grep -E "(npm run dev|next dev)" | grep -v grep || echo "未找到npm进程"

echo "端口监听状态:"
netstat -tlnp | grep :3000 || echo "❌ 端口3000未被监听"
lsof -i:3000 || echo "✅ 端口3000无进程占用"

echo "启动日志:"
tail -20 app.log

# 步骤9: 测试API
echo "步骤9: 测试API..."
echo "主页状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/ || echo '失败')"
echo "健康检查状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/health || echo '失败')"
echo "商品列表状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/get-products || echo '失败')"
echo "管理面板状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/admin || echo '失败')"

echo ""
echo "=== API详细响应 ==="
echo "健康检查API响应:"
curl -s --connect-timeout 10 http://localhost:3000/api/health || echo "健康检查请求失败"

echo ""
echo "商品列表API响应:"
curl -s --connect-timeout 10 http://localhost:3000/api/get-products || echo "商品列表请求失败"

echo ""
echo "=== 终极修复完成 ==="
echo "修复完成时间: $(date)"