# 找到正确项目目录并修复
echo "=== 目录结构检查 ==="
ls -la
echo ""
echo "=== 查找项目根目录 ==="
find /root -name "package.json" -type f 2>/dev/null | head -5

echo ""
echo "=== 进入正确项目目录 ==="
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp/
pwd
ls -la package.json

echo ""
echo "=== 在正确目录中重启应用 ==="
pkill -f "npm run dev"
echo "清理完成，准备重启..."

# 确保环境变量文件在正确位置
if [ ! -f ".env.local" ]; then
    echo "复制环境变量文件到正确位置..."
    cp /root/telegram-lottery-miniapp/.env.local .env.local 2>/dev/null || {
        echo "创建环境变量文件..."
        cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF
    }
fi

# 重新启动应用
nohup npm run dev >> ../app.log 2>&1 &
sleep 8

echo ""
echo "=== 应用启动检查 ==="
ps aux | grep "npm run dev" | grep -v grep

echo ""
echo "=== 端口检查 ==="
netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"

echo ""
echo "=== API测试 ==="
curl -s http://localhost:3000/api/get-products | head -200

echo ""
echo "=== 主页测试 ==="
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/ | head -3