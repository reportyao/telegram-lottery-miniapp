#!/bin/bash

echo "🚀 Telegram彩票小程序 - 简化安装脚本"
echo "=================================="

# 设置npm配置
echo "🔧 配置npm..."
npm config set registry https://registry.npmmirror.com
npm config set timeout 600000
npm config set fetch-retries 5

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    exit 1
fi

echo "✅ 项目目录确认"

# 清理之前的安装
echo "🧹 清理之前的安装..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ 清理完成"

# 分批安装（避免一次性安装过多依赖）
echo "📦 分批安装依赖..."

echo "1️⃣ 安装核心框架..."
npm install next@14.2.33 react@18.2.0 react-dom@18.2.0 --legacy-peer-deps --no-progress

echo "2️⃣ 安装Supabase和Telegram SDK..."
npm install @supabase/supabase-js@2.39.0 @telegram-apps/sdk@1.1.0 --legacy-peer-deps --no-progress

echo "3️⃣ 安装UI组件库..."
npm install clsx@2.1.0 tailwind-merge@2.2.0 @radix-ui/react-dialog@1.0.5 lucide-react@0.344.0 --legacy-peer-deps --no-progress

echo "4️⃣ 安装开发工具..."
npm install -D typescript@5.0.0 @types/node@20.0.0 @types/react@18.2.0 @types/react-dom@18.2.0 --legacy-peer-deps --no-progress

echo "5️⃣ 安装工具链..."
npm install -D tailwindcss@3.4.0 postcss@8.4.0 eslint@8.57.0 --legacy-peer-deps --no-progress

# 验证安装
echo "🔍 验证安装..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules目录存在"
    key_packages=("next" "react" "@supabase/supabase-js" "@telegram-apps/sdk")
    for package in "${key_packages[@]}"; do
        if [ -d "node_modules/$package" ]; then
            echo "✅ $package 已安装"
        else
            echo "⚠️ $package 可能安装失败"
        fi
    done
else
    echo "❌ 安装失败"
    exit 1
fi

echo ""
echo "🎉 安装完成！"
echo "================"
echo "使用命令启动应用:"
echo "npm run dev"
echo ""
echo "应用将在 http://localhost:3000 运行"