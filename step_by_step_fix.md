# 分步骤API修复方案

## 第一步：停止当前应用并验证API文件

```bash
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

# 停止当前应用
pkill -f "npm"
sleep 3

# 检查API文件是否存在
echo "=== 检查API目录结构 ==="
ls -la app/api/
echo ""

# 如果目录不存在或为空，重新创建
if [ ! -d "app/api/health" ] || [ ! -f "app/api/health/route.ts" ]; then
    echo "API文件不存在，需要重新创建..."
else
    echo "API文件存在，检查内容："
    cat app/api/health/route.ts
    cat app/api/get-products/route.ts
fi
```

## 第二步：重新创建API文件（如果需要）

```bash
# 创建API目录结构
mkdir -p app/api/health
mkdir -p app/api/get-products

# 创建健康检查API
cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('健康检查API被调用');
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API服务正常运行'
  });
}
EOF

# 创建商品列表API  
cat > app/api/get-products/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('商品列表API被调用');
  
  const products = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      description: '最新款苹果手机',
      price: 9999,
      image: '/images/iphone15.jpg',
      category: '手机'
    }
  ];

  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功'
  });
}
EOF

echo "API文件重新创建完成"
```

## 第三步：清理并重新启动

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules/.cache
rm -rf app.log

# 检查Next.js配置
echo "=== 检查Next.js版本 ==="
cat package.json | grep -A5 -B5 "next"

# 在3000端口启动
PORT=3000 nohup npm run dev > app.log 2>&1 &
sleep 10

echo "=== 检查启动状态 ==="
ps aux | grep "npm run dev" | grep -v grep
netstat -tlnp | grep :3000
```

## 第四步：测试API并获取详细日志

```bash
echo "=== API测试结果 ==="
echo "主页: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
echo "健康检查: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health)"
echo "商品列表: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/get-products)"
echo "管理面板: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin)"

echo ""
echo "=== 详细日志 ==="
tail -15 app.log

echo ""
echo "=== 如果仍然404，获取更详细错误信息 ==="
echo "健康检查API详细响应："
curl -v http://localhost:3000/api/health 2>&1 | head -15
```

## 第五步：可能的配置问题检查

如果API仍然404，可能需要检查以下配置：

```bash
echo "=== 检查TypeScript配置 ==="
cat tsconfig.json

echo ""
echo "=== 检查package.json中的配置 ==="
cat package.json | grep -A10 -B10 "next"

echo ""
echo "=== 检查app目录结构 ==="
find app -type f -name "*.ts" -o -name "*.tsx" | head -10

echo ""
echo "=== 检查是否存在不兼容的配置 ==="
cat next.config.js 2>/dev/null || echo "next.config.js不存在，使用默认配置"

echo ""
echo "=== 检查是否需要添加export配置 ==="
grep -r "export" next.config.js 2>/dev/null || echo "未发现export配置"
```

## 预期结果

执行完成后，你应该看到：
- 主页返回200 ✅
- 健康检查API返回200 ✅  
- 商品列表API返回200 ✅
- 管理面板返回200 ✅

如果仍有问题，日志会显示具体的错误信息。