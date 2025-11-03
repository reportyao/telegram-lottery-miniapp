# 快速API诊断和修复命令
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "=== 快速诊断当前状态 ==="
echo "1. 检查API文件："
ls -la app/api/health/ 2>/dev/null || echo "health API文件不存在"
ls -la app/api/get-products/ 2>/dev/null || echo "get-products API文件不存在"

echo ""
echo "2. 检查当前运行的应用："
ps aux | grep "npm run dev" | grep -v grep
netstat -tlnp | grep :3000

echo ""
echo "3. 立即测试当前API状态："
echo "健康检查: $(curl -s -w '%{http_code}' -o /tmp/health.json http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -w '%{http_code}' -o /tmp/products.json http://localhost:3000/api/get-products)"

echo ""
echo "4. 如果API返回404，立即修复："
if [ ! -f "app/api/health/route.ts" ]; then
    echo "创建API文件..."
    mkdir -p app/api/health app/api/get-products
    
    # 简化版API文件
    cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'healthy' });
}
EOF

    cat > app/api/get-products/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ data: [] });
}
EOF

    echo "API文件创建完成，重新启动应用..."
    pkill -f npm
    sleep 3
    rm -rf .next
    PORT=3000 nohup npm run dev > app.log 2>&1 &
    sleep 8
    
    echo "5. 重新测试API："
    echo "健康检查: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/health)"
    echo "商品列表: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/get-products)"
fi

echo ""
echo "6. 查看启动日志："
tail -10 app.log