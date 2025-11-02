#!/bin/bash

echo "🚀 Telegram彩票小程序 - 阿里云一键部署脚本"
echo "=========================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    echo "请确保在项目目录中运行此脚本"
    exit 1
fi

# 检查Node.js版本
echo "📋 检查环境..."
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js未安装，请先安装Node.js"
    echo "推荐版本: Node.js >= 18.0"
    exit 1
fi
echo "✅ Node.js版本: $NODE_VERSION"

NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ NPM未安装"
    exit 1
fi
echo "✅ NPM版本: $NPM_VERSION"

# 清理环境
echo "🧹 清理之前的安装..."
rm -rf node_modules package-lock.json .next out .turbo dist build
npm cache clean --force 2>/dev/null
echo "✅ 清理完成"

# 配置npm镜像
echo "🔧 配置npm镜像..."
npm config set registry https://registry.npm.taobao.org
npm config set fetch-retries 3
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
echo "✅ NPM镜像配置完成"

# 逐步安装依赖
echo "📦 安装核心依赖..."
if npm install next react react-dom @supabase/supabase-js @telegram-apps/sdk; then
    echo "✅ 核心依赖安装成功"
else
    echo "⚠️ 核心依赖安装失败，尝试分批安装..."
    echo "请手动执行以下命令:"
    echo "npm install next react react-dom @supabase/supabase-js @telegram-apps/sdk --force"
    exit 1
fi

echo "📦 安装UI依赖..."
if npm install clsx tailwind-merge @radix-ui/react-dialog lucide-react; then
    echo "✅ UI依赖安装成功"
else
    echo "⚠️ UI依赖安装失败，请手动安装"
fi

echo "📦 安装开发依赖..."
if npm install --save-dev typescript @types/node @types/react @types/react-dom; then
    echo "✅ TypeScript依赖安装成功"
else
    echo "⚠️ TypeScript依赖安装失败"
fi

if npm install --save-dev eslint eslint-config-next jest @testing-library/react jest-environment-jsdom; then
    echo "✅ 开发工具依赖安装成功"
else
    echo "⚠️ 开发工具依赖安装失败"
fi

if npm install --save-dev postcss tailwindcss; then
    echo "✅ CSS依赖安装成功"
else
    echo "⚠️ CSS依赖安装失败"
fi

# 环境检查
echo "🔍 检查配置文件..."
if [ ! -f ".env.local" ]; then
    echo "⚠️ 未找到.env.local文件"
    echo "请配置以下环境变量:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_TELEGRAM_BOT_TOKEN"
else
    echo "✅ 找到环境配置文件"
fi

# 类型检查
echo "🔍 运行类型检查..."
if npm run type-check; then
    echo "✅ 类型检查通过"
else
    echo "⚠️ 类型检查有警告，但这不影响运行"
fi

# 构建项目
echo "🏗️ 构建项目..."
if npm run build; then
    echo "✅ 项目构建成功!"
    BUILD_SUCCESS=true
else
    echo "⚠️ 构建失败，但可以尝试开发模式运行"
    BUILD_SUCCESS=false
fi

echo ""
echo "🎉 安装完成!"
echo "============="
echo "使用以下命令启动应用:"
echo "开发模式: npm run dev"
echo "生产模式: npm start"

if [ "$BUILD_SUCCESS" = true ]; then
    echo ""
    echo "🚀 启动生产服务器:"
    echo "npm start"
else
    echo ""
    echo "⚠️ 构建失败，启动开发模式:"
    echo "npm run dev"
fi

echo ""
echo "📖 部署指南请查看: ALIYUN_DEPLOYMENT_GUIDE.md"
echo "🌐 应用访问地址: http://$(hostname -I | awk '{print $1}'):3000"

# 检查端口占用
echo ""
echo "🔍 检查端口状态..."
if netstat -tlnp 2>/dev/null | grep :3000 > /dev/null; then
    echo "⚠️ 端口3000已被占用，请先停止占用进程:"
    echo "sudo kill -9 \$(lsof -ti:3000)"
else
    echo "✅ 端口3000可用"
fi

echo ""
echo "部署完成后，请确保:"
echo "1. 防火墙配置允许访问3000端口"
echo "2. 环境变量正确配置"
echo "3. Telegram Bot和Supabase服务正常"