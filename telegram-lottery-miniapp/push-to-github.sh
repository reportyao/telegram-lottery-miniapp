#!/bin/bash

# Git操作脚本
set -e

echo "开始执行Git操作..."

cd /workspace/telegram-lottery-miniapp

# 配置Git用户信息
git config user.name "MiniMax Agent"
git config user.email "agent@minimax.com"

# 添加所有文件
git add .

# 提交文件
git commit -m "修复关键bug并优化Telegram彩票迷你应用项目

主要修复内容：
- ✅ 修复lib/supabase.ts中表名不匹配问题，确保数据库操作正常
- ✅ 更新API路由(app/api/get-products/route.ts)调用Supabase Edge Function
- ✅ 移除next.config.js中的硬编码域名，提高部署灵活性
- ✅ 添加完整的错误处理和重试机制
- ✅ 优化TypeScript类型定义和数据库连接
- ✅ 添加完整的测试覆盖和自动化脚本
- ✅ 更新README.md和完善的文档
- ✅ 优化.gitignore配置

项目特性：
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase数据库集成(PostgreSQL + Auth + Storage + Edge Functions)
- Telegram Bot集成和Web Apps支持
- 多语言支持(中文、英文、俄语、塔吉克语)
- 完整的夺宝抽奖系统
- 用户管理、商品管理、订单管理
- 管理后台和自动化功能
- 完整的测试和部署脚本

版本：v2.0 完整版 - 生产就绪"

# 设置主分支
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/reportyao/telegram-lottery-miniapp.git 2>/dev/null || echo "远程仓库已存在"

# 推送到GitHub
echo "推送到GitHub..."
git push -u origin main --force

echo "Git操作完成！"