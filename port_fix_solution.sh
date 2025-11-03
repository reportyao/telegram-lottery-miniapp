=== 端口冲突修复方案 ===

# 1. 清理所有npm进程
pkill -f "npm"
sleep 3

# 2. 清理3000端口占用
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "3000端口无占用"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "3001端口无占用"  
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "3002端口无占用"
lsof -ti:3003 | xargs kill -9 2>/dev/null || echo "3003端口无占用"
lsof -ti:3004 | xargs kill -9 2>/dev/null || echo "3004端口无占用"

# 3. 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 4. 强制在3000端口启动
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp
echo "当前目录: $(pwd)"
echo "开始强制在3000端口启动..."

# 5. 直接指定端口启动
PORT=3000 nohup npm run dev > app.log 2>&1 &
echo "应用已启动，PID: $!"

# 6. 等待启动
sleep 8

# 7. 检查启动状态
echo ""
echo "=== 检查应用启动状态 ==="
echo "进程状态:"
ps aux | grep "npm run dev" | grep -v grep

echo ""
echo "端口监听状态:"
netstat -tlnp | grep :3000

# 8. 测试API端点
echo ""
echo "=== API测试结果 ==="

echo "主页测试:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/
echo ""

echo ""
echo "健康检查API:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/api/health
echo ""

echo ""
echo "商品列表API:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/api/get-products
echo ""

echo ""
echo "管理面板测试:"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/admin
echo ""

# 9. 查看应用日志（如果有错误）
echo ""
echo "=== 应用日志检查 ==="
echo "最后10行日志:"
tail -10 app.log

echo ""
echo "=== 最终状态确认 ==="
echo "主页: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "健康检查: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"

echo ""
echo "=== 修复完成 ==="
echo "完成时间: $(date)"