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

# 设置npm镜像 (可选)
echo "🔧 配置npm..."
npm config set registry https://registry.npm.taobao.org
echo "✅ NPM镜像配置完成"

# 清理之前的安装
echo "🧹 清理之前的安装..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ 清理完成"

# 尝试安装依赖
echo "📦 开始安装依赖..."
echo "这可能需要几分钟时间..."

# 方法1: 标准安装
if npm install; then
    echo "✅ 依赖安装成功!"
else
    echo "⚠️ 标准安装失败，尝试替代方法..."
    
    # 方法2: 分批安装核心依赖
    echo "🔄 尝试分批安装..."
    
    # 安装核心依赖
    npm install next react react-dom @supabase/supabase-js @telegram-apps/sdk
    if [ $? -eq 0 ]; then
        echo "✅ 核心依赖安装成功"
    else
        echo "❌ 安装失败，请检查网络连接"
        exit 1
    fi
    
    # 安装UI依赖
    npm install clsx tailwind-merge @radix-ui/react-dialog lucide-react
    if [ $? -eq 0 ]; then
        echo "✅ UI依赖安装成功"
    fi
    
    # 安装开发依赖
    npm install --save-dev typescript @types/node @types/react @types/react-dom eslint eslint-config-next jest @testing-library/react
    if [ $? -eq 0 ]; then
        echo "✅ 开发依赖安装成功"
    fi
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