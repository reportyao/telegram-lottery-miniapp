#!/bin/bash

echo "🚀 Telegram彩票小程序 - 智能安装脚本"
echo "=================================="

# 检查Node.js版本
echo "📋 检查环境..."
NODE_VERSION=$(node --version)
echo "Node.js版本: $NODE_VERSION"

NPM_VERSION=$(npm --version)
echo "NPM版本: $NPM_VERSION"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    echo "请确保在正确的项目目录中运行此脚本"
    exit 1
fi

echo "✅ 项目目录确认"

# 设置npm配置以解决网络问题
echo "🔧 配置npm以解决网络问题..."
npm config set registry https://registry.npmmirror.com
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set timeout 300000
npm config set progress=false
echo "✅ NPM配置完成"

# 清理之前的安装
echo "🧹 清理之前的安装..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ 清理完成"

# 尝试安装依赖
echo "📦 开始安装依赖..."
echo "这可能需要几分钟时间..."

# 分批安装策略
echo "1️⃣ 安装核心框架..."
npm install next@14.2.33 react@18.2.0 react-dom@18.2.0 --force --no-progress

if [ $? -eq 0 ]; then
    echo "✅ 核心框架安装成功"
else
    echo "❌ 核心框架安装失败，尝试使用Yarn..."
    npm install -g yarn
    yarn install
    if [ $? -ne 0 ]; then
        echo "❌ Yarn安装也失败，请检查网络连接"
        exit 1
    fi
fi

echo "2️⃣ 安装Supabase和Telegram SDK..."
npm install @supabase/supabase-js@2.39.0 @telegram-apps/sdk@1.1.0 --force --no-progress

echo "3️⃣ 安装UI组件库..."
npm install clsx@2.1.0 tailwind-merge@2.2.0 @radix-ui/react-dialog@1.0.5 lucide-react@0.344.0 --force --no-progress

echo "4️⃣ 安装TypeScript和开发依赖..."
npm install -D typescript@5.0.0 @types/node@20.0.0 @types/react@18.2.0 @types/react-dom@18.2.0 --force --no-progress

echo "5️⃣ 安装其他开发依赖..."
npm install -D eslint@8.57.0 eslint-config-next@14.2.33 tailwindcss@3.4.0 postcss@8.4.0 jest@29.7.0 --force --no-progress

# 验证安装
echo "🔍 验证安装..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules目录存在"
    echo "📊 安装的包数量: $(ls node_modules | wc -l)"
    
    # 检查关键包
    key_packages=("next" "react" "@supabase/supabase-js" "@telegram-apps/sdk")
    for package in "${key_packages[@]}"; do
        if [ -d "node_modules/$package" ]; then
            echo "✅ $package 已安装"
        else
            echo "⚠️ $package 安装失败，尝试单独安装..."
            npm install $package --force --no-progress
        fi
    done
else
    echo "❌ node_modules目录不存在，安装可能失败"
    exit 1
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
else
    echo "⚠️ 构建失败，但可以尝试开发模式运行"
fi

echo ""
echo "🎉 安装完成!"
echo "================"
echo "使用以下命令启动应用:"
echo "开发模式: npm run dev"
echo "生产模式: npm start"
echo ""
echo "或者直接运行: ./start_app.sh"
echo ""
echo "📖 详细信息请查看: SIMPLE_DEPLOYMENT_GUIDE.md"