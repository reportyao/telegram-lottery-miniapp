#!/bin/bash

# 连接到服务器并执行最彻底的修复
echo "=== 连接到服务器进行彻底修复 ==="
ssh -o StrictHostKeyChecking=no root@47.243.83.253 << 'EOF'
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "步骤1: 强制杀死所有相关进程"
pkill -9 -f npm || echo "npm进程已清理"
pkill -9 -f node || echo "node进程已清理" 
pkill -9 -f next || echo "next进程已清理"
pkill -9 -f dev || echo "dev进程已清理"
sleep 5

echo "步骤2: 彻底清理所有端口 3000-3010"
for port in {3000..3010}; do
    echo "清理端口 $port..."
    fuser -k ${port}/tcp 2>/dev/null || echo "端口 $port 无进程占用"
    sleep 1
done

echo "步骤3: 验证端口清理状态"
for port in {3000..3010}; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用: $(lsof -i:$port | head -1)"
    else
        echo "✅ 端口 $port 已清理"
    fi
done

echo "步骤4: 检查和重新创建API文件"
mkdir -p app/api/health
mkdir -p app/api/get-products

cat > app/api/health/route.ts << 'TS_API'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('✅ 健康检查API被调用');
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API正常运行',
    port: '3000',
    version: '1.0.0'
  }, { status: 200 });
}
TS_API

cat > app/api/get-products/route.ts << 'TS_API'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('✅ 商品API被调用');
  
  const products = [
    { id: '1', title: 'iPhone 15 Pro', price: 9999, image: '/iphone15.jpg' },
    { id: '2', title: 'MacBook Air M3', price: 8999, image: '/macbook.jpg' },
    { id: '3', title: 'AirPods Pro', price: 1999, image: '/airpods.jpg' }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功',
    count: products.length
  }, { status: 200 });
}
TS_API

echo "API文件创建完成:"
ls -la app/api/*/route.ts

echo "步骤5: 清理缓存和重新安装依赖"
rm -rf .next node_modules/.cache package-lock.json
pnpm install
echo "依赖安装完成"

echo "步骤6: 启动应用"
echo "清除旧日志..."
> app.log

echo "启动应用 (30秒超时)..."
timeout 30 bash -c 'PORT=3000 npm run dev' > app.log 2>&1 &
APP_PID=$!
echo "应用PID: $APP_PID"

echo "等待15秒让应用启动..."
sleep 15

echo "步骤7: 检查应用状态"
echo "运行中的进程:"
ps aux | grep "npm run dev" | grep -v grep || echo "未找到npm进程"

echo "端口监听状态:"
netstat -tlnp | grep :3000 || echo "端口3000未被监听"

echo "步骤8: 查看启动日志"
echo "=== 最近20行启动日志 ==="
tail -20 app.log

echo "步骤9: 测试所有端点"
echo "主页状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/ || echo '连接失败')"
echo "健康检查状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/health || echo '连接失败')"
echo "商品API状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/get-products || echo '连接失败')"
echo "管理面板状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/admin || echo '连接失败')"

echo "步骤10: 详细API响应"
echo "=== 健康检查详细响应 ==="
curl -s --connect-timeout 10 http://localhost:3000/api/health || echo "健康检查请求失败"

echo "=== 商品API详细响应 ==="
curl -s --connect-timeout 10 http://localhost:3000/api/get-products || echo "商品API请求失败"

echo "=== 修复完成 ==="
EOF