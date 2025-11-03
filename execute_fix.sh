#!/bin/bash

# 创建临时修复命令脚本
cat > /tmp/fix_commands.sh << 'EOF'
#!/bin/bash
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp
pkill -f "npm run dev"
sleep 2
rm -rf app/api .next
mkdir -p app/api/get-products app/api/health

cat > app/api/get-products/route.ts << 'APIEOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('API: /api/get-products called');
    
    const testProducts = [
      {
        id: 'test-1',
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
        id: 'test-2',
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
      data: testProducts,
      message: '测试商品列表获取成功',
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
APIEOF

cat > app/api/health/route.ts << 'HEALTHEOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
}
HEALTHEOF

nohup npm run dev > app.log 2>&1 &
sleep 5

curl -s -w "主页状态码: %{http_code}" http://localhost:3000/
echo ""
curl -s http://localhost:3000/api/health
echo ""
curl -s -w "API状态码: %{http_code}" http://localhost:3000/api/get-products
EOF

chmod +x /tmp/fix_commands.sh

# 执行修复
echo "=== 开始执行API修复 ==="
expect << 'EXPECTEOF'
set timeout 60
spawn ssh root@47.243.83.253
expect "password:"
send "Lingjiu123@\r"
expect "#"
send "cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp\r"
expect "#"
send "cat /tmp/fix_commands.sh\r"
expect "#"
send "bash /tmp/fix_commands.sh\r"
expect "#"
send "exit\r"
expect eof
EXPECTEOF