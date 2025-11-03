#!/bin/bash

# GitHub核心库文件同步脚本
# 同步hooks/, lib/, types/目录下的文件到GitHub仓库

echo "开始同步核心库文件到GitHub..."

# 进入项目目录
cd /workspace/telegram-lottery-miniapp

# 检查git状态
echo "检查Git状态..."
git status

# 添加核心库文件
echo "添加hooks/目录文件..."
git add hooks/useTelegram.ts

echo "添加lib/目录文件..."
git add lib/performance.ts lib/supabase.ts lib/telegram.ts lib/utils.ts

echo "添加types/目录文件..."
git add types/database.ts types/database_fixed.ts

# 显示要提交的文件
echo "要提交的文件："
git status --porcelain | grep -E "(hooks/|lib/|types/)"

# 提交更改
echo "提交核心库文件..."
git commit -m "Add core library files: hooks, lib, and types"

# 推送到GitHub
echo "推送到GitHub..."
git push origin master

echo "核心库文件同步完成！"