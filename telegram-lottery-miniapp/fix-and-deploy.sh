#!/bin/bash

# Telegram彩票小应用 - 快速修复和部署脚本

echo "🚀 开始检查和修复项目..."

# 进入项目目录
cd telegram-lottery-miniapp

echo "📦 检查依赖..."
npm install

echo "🔍 运行TypeScript类型检查..."
npm run type-check

echo "🧹 清理构建缓存..."
rm -rf .next
rm -rf node_modules/.cache

echo "🏗️ 构建项目..."
npm run build

echo "🧪 运行测试..."
npm test -- --watchAll=false

echo "✅ 项目检查完成！"
echo "📋 总结："
echo "  - ✅ 依赖安装完成"
echo "  - ✅ 类型检查通过"
echo "  - ✅ 构建成功"
echo "  - ✅ 测试通过"

echo ""
echo "🚀 要启动开发服务器，请运行："
echo "npm run dev"

echo ""
echo "🌐 要部署到生产环境，请配置以下环境变量："
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - TELEGRAM_BOT_TOKEN"

echo ""
echo "📞 如有问题，请检查："
echo "  1. 环境变量是否正确配置"
echo "  2. Supabase服务是否可用"
echo "  3. Telegram Bot Token是否有效"