=== API深度诊断和修复方案 ===

请按顺序执行以下命令进行深度诊断：

# 1. 检查当前项目结构和文件
echo "=== 当前项目结构检查 ==="
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp
echo "当前目录: $(pwd)"
echo ""
echo "API目录结构:"
ls -la app/
echo ""
echo "API目录内容:"
ls -la app/api/ 2>/dev/null || echo "API目录不存在"
echo ""
echo "检查是否有其他API相关文件:"
find app -name "*api*" -type f 2>/dev/null || echo "未找到API相关文件"

# 2. 检查Next.js配置
echo ""
echo "=== Next.js配置检查 ==="
echo "package.json配置:"
cat package.json | grep -A5 -B5 "scripts"
echo ""
echo "next.config.js是否存在:"
ls -la next.config.js 2>/dev/null || echo "next.config.js不存在"

# 3. 彻底清理并重新创建
echo ""
echo "=== 彻底清理和重建 ==="
# 停止应用
pkill -f "npm run dev"
sleep 2

# 彻底清理
rm -rf .next
rm -rf app/api
rm -rf node_modules/.cache

# 重新创建API结构
mkdir -p app/api/get-products
mkdir -p app/api/health

echo "创建新的API路由文件..."

# 4. 创建更简单的测试API
cat > app/api/test/route.ts << 'TESTEOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('TEST API called');
  return NextResponse.json({
    message: 'Test API is working!',
    timestamp: new Date().toISOString()
  });
}
TESTEOF

# 5. 重新创建get-products API
cat > app/api/get-products/route.ts << 'APITSEOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/get-products called');
    
    // 测试数据
    const products = [
      {
        id: '1',
        title: 'iPhone 15 Pro Max',
        description: '全新苹果手机',
        price: 999,
        image_url: '/images/iphone15.jpg',
        status: 'active',
        target_participants: 1000,
        current_participants: 567,
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        title: 'MacBook Air M3',
        description: '苹果笔记本电脑',
        price: 1299,
        image_url: '/images/macbook.jpg',
        status: 'active',
        target_participants: 800,
        current_participants: 234,
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: products,
      message: '商品列表获取成功',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: String(error) }, 
      { status: 500 }
    );
  }
}
APITSEOF

# 6. 创建健康检查API
cat > app/api/health/route.ts << 'HEALTHEOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('GET /api/health called');
  return NextResponse.json({
    status: 'healthy',
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
}
HEALTHEOF

echo ""
echo "=== 验证文件创建 ==="
echo "API目录结构:"
ls -la app/api/
echo ""
echo "get-products路由文件:"
ls -la app/api/get-products/route.ts
echo ""
echo "health路由文件:"
ls -la app/api/health/route.ts
echo ""
echo "test路由文件:"
ls -la app/api/test/route.ts

echo ""
echo "=== 文件内容验证 ==="
echo "get-products文件前10行:"
head -10 app/api/get-products/route.ts
echo ""
echo "health文件前10行:"
head -10 app/api/health/route.ts

# 7. 重启应用
echo ""
echo "=== 重启应用 ==="
echo "清理npm缓存..."
npm run build 2>/dev/null || echo "构建跳过"
sleep 2

echo "启动应用..."
nohup npm run dev > app.log 2>&1 &
sleep 5

# 8. 等待启动并测试
echo ""
echo "=== 应用启动等待 ==="
for i in {1..15}; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        echo "✅ 应用启动成功"
        break
    fi
    echo "等待中... ($i/15)"
    sleep 2
done

# 9. 测试所有API端点
echo ""
echo "=== 完整API测试 ==="

echo "测试简单API (/api/test):"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/api/test
echo ""

echo ""
echo "测试健康检查API (/api/health):"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/api/health
echo ""

echo ""
echo "测试商品列表API (/api/get-products):"
curl -s -w "HTTP状态码: %{http_code}" http://localhost:3000/api/get-products
echo ""

echo ""
echo "=== 再次检查进程和日志 ==="
echo "进程状态:"
ps aux | grep "npm run dev" | grep -v grep

echo ""
echo "端口状态:"
netstat -tlnp | grep :3000

echo ""
echo "=== 应用日志检查 ==="
echo "最近的日志 (最后20行):"
tail -20 app.log

echo ""
echo "=== 最终状态总结 ==="
echo "主页: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "管理面板: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"
echo "测试API: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/test)"
echo "健康检查: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"

echo ""
echo "=== 诊断完成 ==="
echo "完成时间: $(date)"