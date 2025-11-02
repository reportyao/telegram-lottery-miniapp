#!/bin/bash

# 🚀 GitHub 代码推送脚本
# Telegram夺宝系统 - 完整代码推送

set -e  # 遇到错误立即退出

echo "========================================"
echo "🚀 开始推送Telegram夺宝系统到GitHub"
echo "========================================"

# 配置Git仓库信息
REPO_NAME="telegram-lottery-miniapp"
DESCRIPTION="Complete Telegram Lottery Mini App with Resale Features - 生产环境就绪的Telegram夺宝系统"

# 检查当前目录
if [ ! -f ".git/config" ]; then
    echo "❌ 错误: 当前目录不是有效的Git仓库"
    exit 1
fi

echo "✅ Git仓库检查通过"

# 1. 首先尝试直接推送到GitHub（如果已经创建了仓库）
echo ""
echo "🔍 检查是否需要创建GitHub仓库..."

# 让用户选择操作方式
echo ""
echo "请选择操作方式:"
echo "1. 创建新的GitHub仓库"
echo "2. 推送到现有仓库"
echo "3. 获取GitHub API命令创建仓库"
read -p "请输入选择 (1-3): " choice

case $choice in
    1)
        echo "正在创建GitHub仓库..."
        
        # 检查是否有GitHub CLI
        if command -v gh &> /dev/null; then
            echo "✅ 检测到GitHub CLI"
            
            # 创建私有仓库
            echo "📦 创建私有仓库..."
            gh repo create "$REPO_NAME" --private --description "$DESCRIPTION" --push
            
            echo "✅ 仓库创建成功!"
            
        else
            echo "❌ GitHub CLI未安装"
            echo ""
            echo "💡 请按以下步骤手动创建仓库:"
            echo "1. 访问 https://github.com"
            echo "2. 点击 '+' 号，选择 'New repository'"
            echo "3. 仓库名: $REPO_NAME"
            echo "4. 描述: $DESCRIPTION"
            echo "5. 选择 Private"
            echo "6. 不要勾选 README、.gitignore、许可证"
            echo "7. 创建后复制仓库URL"
            echo ""
            
            read -p "请输入GitHub仓库URL (例如: https://github.com/username/telegram-lottery-miniapp.git): " repo_url
            
            if [[ $repo_url =~ ^https://github.com/.*/.+\.git$ ]]; then
                echo "🧩 配置远程仓库..."
                git remote add origin "$repo_url"
                echo "✅ 远程仓库已添加"
            else
                echo "❌ 无效的仓库URL格式"
                exit 1
            fi
        fi
        ;;
        
    2)
        echo "📋 推送现有仓库..."
        read -p "请输入现有GitHub仓库URL: " repo_url
        
        if [[ $repo_url =~ ^https://github.com/.*/.+\.git$ ]]; then
            echo "🧩 配置远程仓库..."
            git remote add origin "$repo_url" 2>/dev/null || echo "⚠️ 远程仓库可能已存在，继续推送..."
        else
            echo "❌ 无效的仓库URL格式"
            exit 1
        fi
        ;;
        
    3)
        echo "📋 提供API命令创建仓库..."
        echo ""
        echo "使用GitHub CLI创建仓库的命令:"
        echo "gh repo create $REPO_NAME --private --description '$DESCRIPTION' --push"
        echo ""
        echo "或者使用GitHub REST API:"
        echo "curl -H 'Authorization: token YOUR_TOKEN' https://api.github.com/user/repos -d '{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"$DESCRIPTION\"}'"
        echo ""
        exit 0
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🚀 开始推送代码..."

# 配置Git用户信息（如果没有设置）
if [ -z "$(git config user.name)" ]; then
    echo "👤 配置Git用户信息..."
    git config user.name "MiniMax Agent"
    git config user.email "minimax-agent@minimax.chat"
fi

# 推送到GitHub
echo "📤 推送到GitHub (main分支)..."
if git push -u origin main; then
    echo ""
    echo "🎉 推送成功!"
    echo ""
    echo "✅ 项目已成功推送到GitHub"
    echo "📦 包含完整功能:"
    echo "   - ✅ Telegram夺宝系统 (React + Next.js)"
    echo "   - ✅ 转售市场功能"
    echo "   - ✅ Telegram机器人"
    echo "   - ✅ 11个API端点"
    echo "   - ✅ 数据库迁移"
    echo "   - ✅ 安全修复"
    echo "   - ✅ 多语言支持"
    echo "   - ✅ 部署工具"
    echo ""
    echo "🚀 您的项目已准备部署!"
    
else
    echo "❌ 推送失败"
    echo "💡 可能的原因:"
    echo "   - GitHub仓库不存在"
    echo "   - 网络连接问题"
    echo "   - 权限不足"
    echo ""
    echo "🔧 解决方案:"
    echo "   1. 确保仓库已创建"
    echo "   2. 检查网络连接"
    echo "   3. 验证GitHub权限"
fi

echo ""
echo "========================================"
echo "✨ 推送完成 - Telegram夺宝系统"
echo "========================================"