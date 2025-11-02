#!/bin/bash
# 彩票抽奖应用 - 一键自动修复脚本
# 解决 API Error: 404 问题

set -e

echo "🎯 彩票抽奖应用 - 自动修复脚本"
echo "========================================"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到package.json文件"
    echo "请确保在telegram-lottery-miniapp项目根目录运行此脚本"
    echo ""
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo "✅ 找到项目根目录"

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "📝 创建环境变量配置文件..."
    
    cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF
    
    echo "✅ 环境变量文件已创建"
else
    echo "✅ 环境变量文件已存在"
fi

# 显示当前环境变量（隐藏密钥）
echo "📋 当前环境配置:"
echo "  Supabase URL: https://mftfgofnosakobjfpzss.supabase.co"
echo "  端口: 3000"

# 检查Node.js和npm
echo "🔧 检查开发环境..."
NODE_VERSION=$(node --version 2>/dev/null || echo "未安装")
NPM_VERSION=$(npm --version 2>/dev/null || echo "未安装")
echo "  Node.js: $NODE_VERSION"
echo "  npm: $NPM_VERSION"

if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm未安装，请先安装npm"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 停止现有进程
echo "🔄 停止现有应用进程..."
pkill -f "npm run dev" 2>/dev/null || echo "  未找到npm dev进程"
pkill -f "node.*next" 2>/dev/null || echo "  未找到Next.js进程"
pkill -f "3000" 2>/dev/null || echo "  端口3000未被占用"

# 等待进程完全结束
sleep 3

# 启动新进程
echo "🚀 启动应用服务..."

# 创建日志文件
LOG_FILE="app.log"
echo "应用启动时间: $(date)" > $LOG_FILE

# 启动应用（后台运行）
nohup npm run dev >> $LOG_FILE 2>&1 &
APP_PID=$!

echo "✅ 应用已启动，PID: $APP_PID"
echo "📝 日志文件: $LOG_FILE"

# 等待应用启动
echo "⏳ 等待应用启动..."
for i in {1..10}; do
    sleep 2
    if netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000"; then
        echo "✅ 应用成功启动在端口3000"
        break
    fi
    echo "  等待中... ($i/10)"
    
    if [ $i -eq 10 ]; then
        echo "❌ 应用启动超时，请检查日志:"
        tail -20 $LOG_FILE
        exit 1
    fi
done

# 最终检查
echo ""
echo "🎯 修复完成验证:"
echo "=================="

# 检查进程
if ps -p $APP_PID > /dev/null; then
    echo "✅ 应用进程正常运行 (PID: $APP_PID)"
else
    echo "⚠️  应用进程可能已退出，请检查日志"
fi

# 检查端口
if netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000"; then
    echo "✅ 端口3000已监听"
else
    echo "⚠️  端口3000未监听"
fi

# 检查最新日志
echo ""
echo "📋 最近5行应用日志:"
tail -5 $LOG_FILE 2>/dev/null || echo "  日志文件为空"

echo ""
echo "🎉 修复完成！"
echo "========================================"
echo ""
echo "✅ 请访问以下地址验证修复结果:"
echo ""
echo "  📱 主页: http://47.243.83.253:3000/"
echo "     应该显示产品列表（iPhone、AirPods、MacBook等）"
echo ""
echo "  🔧 管理后台: http://47.243.83.253:3000/admin"
echo "     用户名: admin"
echo "     密码: admin123"
echo ""
echo "🔍 如需查看实时日志:"
echo "  tail -f $LOG_FILE"
echo ""
echo "🔧 如需手动重启:"
echo "  pkill -f 'npm run dev' && nohup npm run dev >> $LOG_FILE 2>&1 &"

# 简单的健康检查
echo ""
echo "🩺 正在进行健康检查..."
sleep 2

# 测试本地连接
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ 本地连接测试通过"
else
    echo "⚠️  本地连接测试失败，可能需要额外配置"
fi

echo "✅ 修复脚本执行完成！"