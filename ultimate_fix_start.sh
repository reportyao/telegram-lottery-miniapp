#!/bin/bash

echo "🚀 Telegram彩票小程序 - 彻底修复启动流程"
echo "========================================="

# 进入项目目录
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "📂 当前目录: $(pwd)"

# 1. 超级彻底清理所有进程和端口
echo ""
echo "🧹 第一步：超级彻底清理进程..."
echo "清理所有Node.js进程..."
pkill -f "node" || true
pkill -f "next" || true
sleep 2

echo "清理所有3000端口进程..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true
fuser -k 3003/tcp 2>/dev/null || true
sleep 3

# 使用lsof进一步清理
echo "使用lsof清理残留进程..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true
sleep 2

# 使用netstat清理
echo "使用netstat清理残留进程..."
netstat -tulpn 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
sleep 2

echo "✅ 进程清理完成"

# 2. 验证端口清理
echo ""
echo "🔍 第二步：验证端口清理..."
for port in 3000 3001 3002 3003; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用"
        lsof -i:$port
    else
        echo "✅ 端口 $port 已清理"
    fi
done

# 3. 清理项目缓存和依赖
echo ""
echo "🧹 第三步：清理项目缓存..."
rm -rf node_modules .next package-lock.json .next .cache
rm -rf .npm 2>/dev/null || true
echo "✅ 项目缓存清理完成"

# 4. 检查API文件
echo ""
echo "🔍 第四步：检查API文件..."
echo "API目录结构:"
if [ -d "app/api" ]; then
    find app/api -type f | sort
    echo "✅ API目录存在"
else
    echo "❌ API目录不存在，正在创建..."
    mkdir -p app/api/health
    mkdir -p app/api/get-products
fi

# 5. 重新安装依赖
echo ""
echo "📦 第五步：重新安装依赖..."
npm cache clean --force
npm install

echo "✅ 依赖安装完成"

# 6. 启动应用
echo ""
echo "🏃‍♂️ 第六步：启动应用..."
echo "启动参数:"
echo "  - 目录: $(pwd)"
echo "  - 端口: 3000"
echo "  - Node版本: $(node --version)"
echo "  - NPM版本: $(npm --version)"
echo ""

# 启动应用
export PORT=3000
export NODE_OPTIONS="--max_old_space_size=2048"

echo "🚀 开始启动..."
npm run dev