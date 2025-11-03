#!/bin/bash

# 彩票抽奖应用 - 服务器修复脚本
# 用于修复 API Error: 404 问题

echo "🎯 彩票抽奖应用 - 服务器修复脚本"
echo "====================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    exit 1
fi

# 获取当前目录
APP_DIR="/root/telegram-lottery-miniapp"
if [ ! -d "$APP_DIR" ]; then
    echo "❌ 找不到应用目录: $APP_DIR"
    echo "请确认应用已正确安装到 $APP_DIR"
    exit 1
fi

echo "✅ 找到应用目录: $APP_DIR"

# 进入应用目录
cd $APP_DIR

echo "📝 创建环境变量配置文件..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF

echo "✅ 环境变量文件创建完成"

# 检查并停止现有应用
echo "🔄 重启应用服务..."

# 检查是否使用PM2
if command -v pm2 &> /dev/null; then
    echo "使用PM2管理应用..."
    pm2 restart all
    sleep 2
    
    # 检查应用状态
    if pm2 list | grep -q "online"; then
        echo "✅ 应用重启成功"
    else
        echo "❌ PM2重启失败，手动启动..."
        nohup npm run dev > app.log 2>&1 &
    fi
else
    echo "手动重启应用..."
    # 杀死现有进程
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "node.*next" 2>/dev/null
    
    # 等待进程结束
    sleep 2
    
    # 启动新进程
    nohup npm run dev > app.log 2>&1 &
    echo "✅ 应用启动完成"
fi

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 检查应用是否正常运行
if netstat -tulpn | grep -q ":3000"; then
    echo "✅ 应用已成功运行在端口3000"
else
    echo "❌ 应用启动失败，检查日志:"
    tail -20 app.log
    echo ""
    echo "请手动检查: cd $APP_DIR && npm run dev"
fi

echo ""
echo "🎉 修复完成！"
echo "====================================="
echo "访问地址: http://47.243.83.253:3000/"
echo "管理员后台: http://47.243.83.253:3000/admin"
echo "管理员账号: admin / admin123"
echo ""
echo "如果仍有404错误，请检查:"
echo "1. 网络连接是否正常"
echo "2. 防火墙是否开放3000端口"
echo "3. 应用日志: tail -f $APP_DIR/app.log"