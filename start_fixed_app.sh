#!/bin/bash

echo "🚀 开始启动Telegram彩票小程序（代码修复版本）..."

# 进入项目目录
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp || cd telegram-lottery-miniapp

# 设置端口
export PORT=3000

echo "📋 当前状态检查:"
echo "   - 项目目录: $(pwd)"
echo "   - Node版本: $(node --version)"
echo "   - NPM版本: $(npm --version)"
echo ""

echo "🔧 检查API文件:"
if [ -f "app/api/health/route.ts" ]; then
  echo "   ✅ 健康检查API: app/api/health/route.ts"
  head -3 app/api/health/route.ts
else
  echo "   ❌ 健康检查API文件不存在"
fi

if [ -f "app/api/get-products/route.ts" ]; then
  echo "   ✅ 商品列表API: app/api/get-products/route.ts"
  head -3 app/api/get-products/route.ts
else
  echo "   ❌ 商品列表API文件不存在"
fi

echo ""
echo "📦 清理依赖并重新安装..."
rm -rf node_modules .next package-lock.json
npm cache clean --force
npm install

echo ""
echo "🏃‍♂️ 启动应用..."
npm run dev