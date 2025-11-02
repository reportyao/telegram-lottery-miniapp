#!/bin/bash
echo "🚀 启动Telegram彩票小程序..."

# 设置环境变量
export NODE_OPTIONS="--max_old_space_size=2048"
export PORT=3000

# 启动应用
npm run dev
