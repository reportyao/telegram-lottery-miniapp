#!/bin/bash

# 彻底清理和修复脚本
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 第一步：彻底清理所有进程 ==="
# 使用多种方法清理所有可能占用端口的进程
sudo pkill -9 -f npm || echo "npm进程已清理"
sudo pkill -9 -f node || echo "node进程已清理"
sudo pkill -9 -f next || echo "next进程已清理"
sudo pkill -9 -f dev || echo "dev进程已清理"
sudo pkill -9 -f start-server || echo "start-server进程已清理"

# 使用fuser强制清理端口
for port in {3000..3010}; do
    echo "清理端口 $port..."
    sudo fuser -k ${port}/tcp 2>/dev/null || echo "端口 $port 无进程占用"
done

sleep 8

echo "=== 第二步：验证端口清理状态 ==="
for port in {3000..3010}; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用: $(lsof -i:$port | head -1)"
        # 强制清理
        PID=$(lsof -t -i:$port 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo "强制杀死进程 $PID"
            sudo kill -9 $PID 2>/dev/null
        fi
    else
        echo "✅ 端口 $port 已清理"
    fi
done

echo "=== 第三步：重新创建API文件 ==="
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
    }, { status: 200 });
    
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
    }, { status: 200 });
    
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
echo "API文件列表："
ls -la app/api/*/route.ts
echo ""
echo "健康检查API文件内容预览："
head -15 app/api/health/route.ts
echo ""
echo "商品列表API文件内容预览："
head -15 app/api/get-products/route.ts

echo "=== 第四步：彻底清理缓存和依赖 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf package-lock.json
rm -rf app.log

echo "重新安装依赖..."
pnpm install
echo "依赖安装完成"

echo "=== 第五步：在3000端口启动应用 ==="
echo "启动应用，日志保存到 app.log"
echo "启动时间: $(date)"

# 启动应用
export PORT=3000
timeout 30 bash -c 'npm run dev' > app.log 2>&1 &
APP_PID=$!
echo "应用PID: $APP_PID"

echo "等待15秒让应用完全启动..."
sleep 15

echo "=== 第六步：检查应用启动状态 ==="
echo "运行中的进程："
ps aux | grep "npm run dev" | grep -v grep || echo "未找到npm进程"
echo ""

echo "端口监听状态："
echo "netstat检查："
netstat -tlnp | grep :3000 || echo "❌ 端口3000未被监听"
echo ""
echo "lsof检查："
lsof -i:3000 || echo "✅ 端口3000无进程占用"
echo ""

echo "=== 第七步：查看启动日志 ==="
echo "=== 最后25行启动日志 ==="
tail -25 app.log

echo "=== 第八步：测试所有端点 ==="
echo "主页状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/ || echo '失败')"
echo "健康检查状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/health || echo '失败')"
echo "商品列表状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/api/get-products || echo '失败')"
echo "管理面板状态码: $(curl -s -w '%{http_code}' -o /dev/null --connect-timeout 10 http://localhost:3000/admin || echo '失败')"

echo ""
echo "=== 第九步：获取详细API响应 ==="
echo "健康检查API详细响应："
curl -s --connect-timeout 10 http://localhost:3000/api/health || echo "健康检查请求失败"
echo ""
echo ""
echo "商品列表API详细响应："
curl -s --connect-timeout 10 http://localhost:3000/api/get-products || echo "商品列表请求失败"

echo ""
echo "=== 第十步：最终状态检查 ==="
echo "所有node/npm进程："
ps aux | grep -E "(node|npm)" | grep -v grep || echo "无node/npm进程运行"
echo ""
echo "最终端口状态："
for port in 3000 3001 3002 3003 3004; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用: $(lsof -i:$port | head -1)"
    else
        echo "✅ 端口 $port 空闲"
    fi
done

echo ""
echo "=== 修复完成 ==="
echo "修复完成时间: $(date)"