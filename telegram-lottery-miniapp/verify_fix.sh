#!/bin/bash
# 服务器验证和修复完成脚本

echo "🎯 验证应用修复状态"
echo "====================="

# 返回到正确目录
echo "📁 检查当前目录..."
pwd
ls -la

# 如果在错误的子目录中，返回上级目录
if [ -d "telegram-lottery-miniapp" ]; then
    echo "📍 切换到正确目录..."
    cd telegram-lottery-miniapp
fi

echo "📋 当前目录内容:"
ls -la

# 检查环境变量文件
echo ""
echo "🔍 检查环境变量文件..."
if [ -f ".env.local" ]; then
    echo "✅ 环境变量文件存在"
    echo "📝 环境变量内容（前几行）:"
    head -2 .env.local
else
    echo "❌ 环境变量文件不存在，需要创建"
fi

# 检查应用进程
echo ""
echo "🔍 检查应用进程..."
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ npm dev进程正在运行"
    ps aux | grep "npm run dev" | grep -v grep
else
    echo "❌ npm dev进程未运行"
fi

# 检查端口监听
echo ""
echo "🔍 检查端口监听..."
if netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000"; then
    echo "✅ 端口3000正在监听"
    netstat -tulpn 2>/dev/null | grep ":3000" || ss -tulpn 2>/dev/null | grep ":3000"
else
    echo "❌ 端口3000未监听"
fi

# 检查应用日志
echo ""
echo "📋 检查应用日志..."
if [ -f "app.log" ]; then
    echo "✅ 找到应用日志文件"
    echo "📝 最近10行日志:"
    tail -10 app.log
    
    # 检查是否有错误
    if grep -qi "error\|fail\|exception" app.log; then
        echo "⚠️  发现潜在错误，请检查日志"
    else
        echo "✅ 日志中未发现明显错误"
    fi
else
    echo "❌ 未找到应用日志文件"
fi

# 简单的健康检查
echo ""
echo "🩺 执行健康检查..."
sleep 2

# 测试API连接
echo "🔍 测试API连接..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ 本地连接测试成功"
else
    echo "❌ 本地连接测试失败"
    echo "💡 可能是应用还未完全启动，请稍等片刻再试"
fi

echo ""
echo "🎉 验证完成！"
echo "=================="

if [ -f ".env.local" ] && pgrep -f "npm run dev" > /dev/null && (netstat -tulpn 2>/dev/null | grep -q ":3000" || ss -tulpn 2>/dev/null | grep -q ":3000"); then
    echo "✅ 所有检查通过！应用已成功修复"
    echo ""
    echo "🌐 请访问以下地址验证:"
    echo "   主页: http://47.243.83.253:3000/"
    echo "   管理后台: http://47.243.83.253:3000/admin"
    echo ""
    echo "🔑 管理员账号:"
    echo "   用户名: admin"
    echo "   密码: admin123"
else
    echo "❌ 某些检查未通过，请根据上述信息进行排查"
fi