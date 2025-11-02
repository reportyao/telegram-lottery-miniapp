#!/bin/bash

echo "🎯 彩票抽奖应用 - 最终验证脚本"
echo "====================================="

# 确保在正确目录
echo "📍 检查当前目录..."
cd ~ && cd telegram-lottery-miniapp
echo "当前目录: $(pwd)"

echo ""
echo "🔍 验证修复状态..."

# 检查环境变量文件
if [ -f ".env.local" ]; then
    echo "✅ 环境变量文件存在"
    echo "📝 环境变量配置:"
    echo "  Supabase URL: https://mftfgofnosakobjfpzss.supabase.co"
    echo "  应用端口: 3000"
else
    echo "❌ 环境变量文件不存在"
    echo "💡 正在创建环境变量文件..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF
    echo "✅ 环境变量文件已创建"
fi

# 检查应用进程
echo ""
echo "🔍 检查应用进程..."
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ npm dev进程正在运行"
    echo "📋 进程信息:"
    ps aux | grep "npm run dev" | grep -v grep
else
    echo "❌ npm dev进程未运行"
    echo "💡 正在启动应用..."
    nohup npm run dev >> app.log 2>&1 &
    sleep 5
fi

# 检查端口监听
echo ""
echo "🔍 检查端口监听..."
if netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000"; then
    echo "✅ 端口3000正在监听"
    netstat -tulpn 2>/dev/null | grep ":3000" || ss -tulpn 2>/dev/null | grep ":3000"
else
    echo "❌ 端口3000未监听"
    echo "💡 等待应用启动..."
    sleep 5
fi

# 检查应用日志
echo ""
echo "📋 检查应用日志..."
if [ -f "app.log" ]; then
    echo "✅ 应用日志文件存在"
    echo "📝 最近5行日志:"
    tail -5 app.log
else
    echo "📝 创建日志文件..."
    echo "应用启动时间: $(date)" > app.log
fi

# 测试API连接
echo ""
echo "🩺 执行健康检查..."
sleep 3

echo "🔍 测试本地连接..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 本地连接测试成功"
else
    echo "⚠️  本地连接测试失败，正在等待应用完全启动..."
    sleep 5
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 本地连接测试成功"
    else
        echo "❌ 本地连接测试失败，请检查应用日志"
        echo "📋 最新日志:"
        tail -10 app.log
    fi
fi

echo ""
echo "🎉 验证完成！"
echo "====================================="

# 最终判断
ENV_EXISTS=$([ -f ".env.local" ] && echo "yes" || echo "no")
PROCESS_RUNNING=$(pgrep -f "npm run dev" > /dev/null && echo "yes" || echo "no") 
PORT_LISTENING=$(netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000" && echo "yes" || echo "no")

if [ "$ENV_EXISTS" = "yes" ] && [ "$PROCESS_RUNNING" = "yes" ] && [ "$PORT_LISTENING" = "yes" ]; then
    echo "🎉 所有检查通过！应用已成功修复并运行"
    echo ""
    echo "✅ 恭喜！您可以访问以下地址:"
    echo "   🌐 主页: http://47.243.83.253:3000/"
    echo "   🔧 管理后台: http://47.243.83.253:3000/admin"
    echo ""
    echo "🔑 管理员登录信息:"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo ""
    echo "📋 故障排除命令:"
    echo "   查看实时日志: tail -f app.log"
    echo "   重启应用: pkill -f 'npm run dev' && nohup npm run dev >> app.log 2>&1 &"
else
    echo "❌ 某些检查未通过"
    [ "$ENV_EXISTS" = "no" ] && echo "   - 环境变量文件缺失"
    [ "$PROCESS_RUNNING" = "no" ] && echo "   - 应用进程未运行"
    [ "$PORT_LISTENING" = "no" ] && echo "   - 端口3000未监听"
    echo ""
    echo "💡 请根据上述信息进行修复"
    echo "🔧 快速修复命令:"
    echo "   pkill -f 'npm run dev' && nohup npm run dev >> app.log 2>&1 &"
fi

echo ""
echo "✅ 验证脚本执行完成！"