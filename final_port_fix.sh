# 彻底解决端口冲突，让应用真正运行在3000端口
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 1. 彻底清理所有占用3000-3004端口的进程 ==="
# 清理所有可能的端口占用进程
pkill -9 -f npm
pkill -9 -f node
pkill -9 -f next
pkill -9 -f dev

# 使用多种方法清理端口
fuser -k 3000/tcp 2>/dev/null || echo "3000端口清理完成"
fuser -k 3001/tcp 2>/dev/null || echo "3001端口清理完成" 
fuser -k 3002/tcp 2>/dev/null || echo "3002端口清理完成"
fuser -k 3003/tcp 2>/dev/null || echo "3003端口清理完成"
fuser -k 3004/tcp 2>/dev/null || echo "3004端口清理完成"

# 额外的lsof清理
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
lsof -ti:3004 | xargs kill -9 2>/dev/null

echo "等待所有进程完全清理..."
sleep 8

echo "=== 2. 验证端口清理结果 ==="
echo "检查3000-3004端口占用情况："
for port in 3000 3001 3002 3003 3004; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "端口 $port 仍有占用: $(lsof -i:$port | grep LISTEN)"
    else
        echo "端口 $port 已清理"
    fi
done

echo "=== 3. 清理Next.js缓存 ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

echo "=== 4. 强制在3000端口启动应用 ==="
# 使用前台启动以确保看到完整的启动过程
PORT=3000 timeout 30 npm run dev > app.log 2>&1 &
NEW_PID=$!
echo "应用启动中，PID: $NEW_PID"

echo "=== 5. 等待应用启动并监控 ==="
for i in {1..15}; do
    echo "等待启动中... ($i/15)"
    if [ -f "app.log" ]; then
        if grep -q "Ready in" app.log; then
            echo "✅ 应用启动完成！"
            break
        fi
    fi
    sleep 2
done

echo "=== 6. 验证应用启动状态 ==="
echo "检查应用进程："
ps aux | grep "npm run dev" | grep -v grep || echo "无npm进程"

echo ""
echo "检查端口监听："
netstat -tlnp | grep :3000 || echo "3000端口无监听"

echo ""
echo "查看启动日志："
tail -10 app.log

echo "=== 7. 现在测试正确的API端点 ==="
sleep 3
echo "测试3000端口的API："
echo "主页: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/)"
echo "健康检查: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/admin)"

echo ""
echo "=== 8. 如果3000端口仍然失败，测试3004端口 ==="
echo "测试3004端口的API："
echo "主页: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3004/)"
echo "健康检查: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3004/api/health)"
echo "商品列表: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3004/api/get-products)"
echo "管理面板: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3004/admin)"

echo ""
echo "=== 9. 获取详细API响应 ==="
echo "3000端口健康API响应："
curl -s http://localhost:3000/api/health | head -5 || echo "3000端口健康API无法访问"

echo ""
echo "3000端口商品API响应："
curl -s http://localhost:3000/api/get-products | head -5 || echo "3000端口商品API无法访问"

echo ""
echo "=== 最终诊断结果 ==="
echo "如果3000端口的API返回200，问题解决！"
echo "如果3004端口的API返回200，说明仍有端口冲突，需要进一步清理。"
echo "如果都返回404，说明API文件路径或配置有问题。"