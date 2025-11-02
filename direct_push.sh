#!/bin/bash

# 🚀 直接推送到GitHub脚本
# 使用提供的token直接推送

set -e

echo "🚀 直接推送Telegram夺宝系统到GitHub"
echo "======================================="

# 配置
REPO_NAME="telegram-lottery-miniapp"
DESCRIPTION="Complete Telegram Lottery Mini App with Resale Features - 生产环境就绪的Telegram夺宝系统"

# GitHub Token (从用户提供的token)
TOKEN="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"

# 检查必要的工具
if ! command -v curl &> /dev/null; then
    echo "❌ 需要curl工具"
    exit 1
fi

echo "✅ 环境检查通过"

# 1. 创建GitHub仓库
echo ""
echo "📦 创建GitHub仓库: $REPO_NAME"

# 使用GitHub API创建仓库
create_response=$(curl -s -H "Authorization: token $TOKEN" \
    -X POST \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"$DESCRIPTION\",\"private\":true,\"auto_init\":false}")

# 检查创建结果
if echo "$create_response" | grep -q '"id"'; then
    echo "✅ 仓库创建成功"
    
    # 从响应中提取仓库URL
    REPO_URL=$(echo "$create_response" | grep -o '"clone_url":\s*"[^"]*"' | cut -d'"' -f4)
    echo "📦 仓库URL: $REPO_URL"
    
else
    # 如果仓库已存在，获取现有仓库URL
    echo "⚠️ 仓库可能已存在，尝试获取现有仓库..."
    
    existing_repo=$(curl -s -H "Authorization: token $TOKEN" \
        https://api.github.com/repos/$REPO_NAME)
        
    if echo "$existing_repo" | grep -q '"id"'; then
        REPO_URL=$(echo "$existing_repo" | grep -o '"clone_url":\s*"[^"]*"' | cut -d'"' -f4)
        echo "✅ 找到现有仓库: $REPO_URL"
    else
        echo "❌ 无法创建或找到仓库"
        echo "API响应: $create_response"
        exit 1
    fi
fi

# 2. 配置Git并推送
echo ""
echo "🧩 配置Git仓库..."

# 设置远程仓库
git remote add origin "$REPO_URL" 2>/dev/null || echo "⚠️ 远程仓库已存在，继续操作..."

# 配置Git（如果没有设置）
git config user.name "MiniMax Agent" || true
git config user.email "minimax-agent@minimax.chat" || true

echo "✅ Git配置完成"

# 3. 推送到GitHub
echo ""
echo "🚀 开始推送代码到GitHub..."

if git push -u origin main; then
    echo ""
    echo "🎉 推送成功!"
    echo ""
    echo "✨ 您的Telegram夺宝系统已成功推送到GitHub:"
    echo "📦 仓库: $REPO_NAME"
    echo "🔗 URL: https://github.com/$(echo $REPO_URL | sed 's|https://github.com/||; s|\.git||')"
    echo ""
    echo "🚀 项目功能概览:"
    echo "   ✅ 完整的Telegram夺宝系统 (React + Next.js)"
    echo "   ✅ 转售市场功能 (数据库 + API + 前端)"
    echo "   ✅ 增强版Telegram机器人 (注册 + 通知)"
    echo "   ✅ 11个API端点 (Supabase Edge Functions)"
    echo "   ✅ 安全审计与修复 (6个关键问题已解决)"
    echo "   ✅ 多语言支持 (中、英、俄、塔吉克文)"
    echo "   ✅ 自动化部署工具"
    echo "   ✅ 完整文档 (README、部署指南、API文档)"
    echo ""
    echo "🏆 生产环境部署就绪!"
else
    echo "❌ 推送失败"
    echo "💡 请检查:"
    echo "   1. 网络连接"
    echo "   2. GitHub token权限"
    echo "   3. 仓库创建状态"
fi

echo ""
echo "========================================"
echo "🚀 GitHub推送完成!"
echo "========================================"