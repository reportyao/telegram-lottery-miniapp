#!/bin/bash

echo "🚀 Telegram彩票小程序 - 完整启动流程"
echo "========================================"

# 进入项目目录
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "📂 当前目录: $(pwd)"
echo "🌐 Node版本: $(node --version)"
echo "📦 NPM版本: $(npm --version)"
echo ""

echo "🔍 检查API文件:"
echo "   - 健康检查API: $([ -f app/api/health/route.ts ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - 商品列表API: $([ -f app/api/get-products/route.ts ] && echo '✅ 存在' || echo '❌ 缺失')"
echo ""

echo "🧹 清理旧缓存和依赖..."
rm -rf node_modules .next package-lock.json
npm cache clean --force

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🏃‍♂️ 启动应用 (端口: 3000)..."
export PORT=3000
export NODE_OPTIONS="--max_old_space_size=2048"

echo ""
echo "✅ 应用已启动！请在另一个终端执行测试："
echo "   curl http://localhost:3000/api/health"
echo "   curl http://localhost:3000/api/get-products"

# 启动应用
npm run dev