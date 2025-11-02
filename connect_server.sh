#!/bin/bash
# 服务器快速连接脚本

echo "🚀 连接到彩票抽奖应用服务器..."
echo "服务器: 47.243.83.253"
echo "用户名: root"
echo "密码: Lingjiu123@"
echo ""
echo "执行以下命令进行连接:"
echo ""
echo "ssh root@47.243.83.253"
echo "# 输入密码: Lingjiu123@"
echo ""
echo "连接成功后，执行以下操作:"
echo ""
echo "cd telegram-lottery-miniapp"
echo "ls -la"
echo ""
echo "如果需要自动修复问题，运行:"
echo "./auto_fix.sh"
echo ""
echo "或者手动创建环境变量:"
echo "cat > .env.local << 'EOF'"
echo "NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8"
echo "EOF"
echo ""
echo "然后重启应用:"
echo "pkill -f 'npm run dev' && nohup npm run dev >> app.log 2>&1 &"

# 询问是否自动连接
read -p "是否要自动打开SSH连接? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 注意：这在某些环境中可能无法工作
    echo "请手动输入SSH命令连接到服务器"
fi