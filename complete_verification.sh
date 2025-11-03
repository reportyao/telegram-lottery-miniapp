# 完整的修复验证步骤

echo "🔧 执行修复验证..."
echo ""

# 返回正确目录
echo "📍 返回正确目录..."
cd ~
cd telegram-lottery-miniapp
pwd
ls -la

echo ""
echo "📋 运行验证脚本..."
chmod +x verify_fix.sh
./verify_fix.sh

echo ""
echo "🎯 如果验证通过，访问地址:"
echo "  主页: http://47.243.83.253:3000/"
echo "  管理后台: http://47.243.83.253:3000/admin"

echo ""
echo "🔧 如果需要查看实时日志:"
echo "  tail -f app.log"

echo ""
echo "🔄 如果需要重新启动应用:"
echo "  pkill -f 'npm run dev'"
echo "  nohup npm run dev >> app.log 2>&1 &"

# 立即执行这些命令
chmod +x verify_fix.sh
./verify_fix.sh