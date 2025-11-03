#!/bin/bash

# 第一步：创建验证脚本
cat > ~/verify_app.sh << 'EOF'
#!/bin/bash

echo "=== Telegram 彩票小程序验证报告 ==="
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 验证项目:"
echo "1. 环境变量文件检查"
echo "2. 应用进程状态"
echo "3. 端口监听状态"
echo "4. API连通性测试"
echo "5. 管理员面板访问"
echo ""

echo "=== 1. 环境变量文件检查 ==="
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local 文件存在${NC}"
    echo "环境变量内容:"
    cat .env.local
    echo ""
else
    echo -e "${RED}❌ .env.local 文件不存在${NC}"
    echo "💡 正在创建环境变量文件..."
    cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
ENVEOF
    echo -e "${GREEN}✅ 环境变量文件已创建${NC}"
fi
echo ""

echo "=== 2. 应用进程状态 ==="
npm_process=$(ps aux | grep "npm run dev" | grep -v grep)
if [ ! -z "$npm_process" ]; then
    echo -e "${GREEN}✅ npm 开发服务器正在运行${NC}"
    echo "进程信息:"
    ps aux | grep "npm run dev" | grep -v grep
    npm_pid=$(ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}' | head -1)
    echo "进程ID: $npm_pid"
else
    echo -e "${RED}❌ npm 开发服务器未运行${NC}"
    echo "💡 正在启动应用..."
    nohup npm run dev >> app.log 2>&1 &
    sleep 5
    echo "应用已启动"
fi
echo ""

echo "=== 3. 端口监听状态 ==="
port_3000=$(netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000")
if [ ! -z "$port_3000" ]; then
    echo -e "${GREEN}✅ 端口 3000 正在监听${NC}"
    echo "端口监听信息:"
    netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"
else
    echo -e "${RED}❌ 端口 3000 未监听${NC}"
    echo "💡 等待应用启动..."
    sleep 5
fi
echo ""

echo "=== 4. API连通性测试 ==="
echo "正在测试 get-products API..."
api_response=$(curl -s -w "%{http_code}" -o /tmp/api_response.txt http://localhost:3000/api/get-products 2>/dev/null)
if [ "$api_response" = "200" ]; then
    echo -e "${GREEN}✅ API 测试成功 (HTTP $api_response)${NC}"
    echo "API 响应内容:"
    cat /tmp/api_response.txt
    echo ""
else
    echo -e "${RED}❌ API 测试失败 (HTTP $api_response)${NC}"
    echo "API 响应内容:"
    cat /tmp/api_response.txt 2>/dev/null || echo "无响应内容"
fi
rm -f /tmp/api_response.txt
echo ""

echo "=== 5. 管理员面板访问测试 ==="
echo "正在测试管理员面板..."
admin_response=$(curl -s -w "%{http_code}" -o /tmp/admin_response.txt http://localhost:3000/admin 2>/dev/null)
if [ "$admin_response" = "200" ]; then
    echo -e "${GREEN}✅ 管理员面板可访问 (HTTP $admin_response)${NC}"
else
    echo -e "${RED}❌ 管理员面板访问失败 (HTTP $admin_response)${NC}"
    echo "管理员面板响应内容:"
    cat /tmp/admin_response.txt 2>/dev/null || echo "无响应内容"
fi
rm -f /tmp/admin_response.txt
echo ""

echo "=== 验证总结 ==="
checks_passed=0
total_checks=4

if [ -f ".env.local" ]; then ((checks_passed++)); fi
if [ ! -z "$npm_process" ]; then ((checks_passed++)); fi
if [ ! -z "$port_3000" ]; then ((checks_passed++)); fi
if [ "$api_response" = "200" ]; then ((checks_passed++)); fi

echo "通过检查: $checks_passed/$total_checks"

if [ $checks_passed -eq $total_checks ]; then
    echo -e "${GREEN}🎉 所有检查通过！应用正常运行${NC}"
    echo ""
    echo "✅ 恭喜！您可以访问以下地址:"
    echo "   🌐 主页: http://47.243.83.253:3000/"
    echo "   🔧 管理后台: http://47.243.83.253:3000/admin"
    echo ""
    echo "🔑 管理员登录信息:"
    echo "   用户名: admin"
    echo "   密码: admin123"
elif [ $checks_passed -ge 2 ]; then
    echo -e "${YELLOW}⚠️ 部分检查通过，应用可能正在启动中${NC}"
    echo "等待30秒后再次运行验证"
else
    echo -e "${RED}❌ 大部分检查失败，需要进一步排查${NC}"
fi

echo ""
echo "=== 实时日志查看 ==="
if [ -f "app.log" ]; then
    echo "最近10行应用日志:"
    tail -10 app.log
else
    echo "未找到 app.log 文件"
fi

echo ""
echo "✅ 验证脚本执行完成！"
EOF

# 第二步：执行验证
chmod +x ~/verify_app.sh
~/verify_app.sh