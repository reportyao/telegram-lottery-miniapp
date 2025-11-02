#!/bin/bash

echo "🚀 开始修复Telegram彩票小程序API问题..."

# 1. 清理可能的进程和端口
echo "📋 步骤1: 清理进程和端口..."
pkill -f "next dev" || true
pkill -f "node.*next" || true
sleep 2

# 2. 检查和修复package.json版本
echo "📋 步骤2: 修复package.json依赖版本..."
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp || cd telegram-lottery-miniapp

# 创建正确的package.json
cat > package.json << 'EOF'
{
  "name": "telegram-lottery-miniapp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  },
  "dependencies": {
    "next": "^14.2.33",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@telegram-apps/sdk": "^1.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.1",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.33",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "testMatch": [
      "**/__tests__/**/*.(test|spec).(ts|tsx)",
      "**/*.(test|spec).(ts|tsx)"
    ]
  }
}
EOF

echo "✅ package.json已修复为Next.js 14.2.33版本"

# 3. 简化next.config.js
echo "📋 步骤3: 修复next.config.js..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mftfgofnosakobjfpzss.supabase.co', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  generateEtags: false,
  output: 'standalone',
}

module.exports = nextConfig
EOF

echo "✅ next.config.js已简化"

# 4. 创建API目录结构
echo "📋 步骤4: 创建API目录结构..."
mkdir -p app/api/health
mkdir -p app/api/get-products

# 5. 创建健康检查API
echo "📋 步骤5: 创建健康检查API..."
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 健康检查API被调用');
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API服务正常运行',
    port: '3000',
    version: '1.0.0'
  }, { status: 200 });
}
EOF

echo "✅ 健康检查API已创建"

# 6. 创建商品列表API
echo "📋 步骤6: 创建商品列表API..."
cat > app/api/get-products/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 商品列表API被调用');
  const products = [
    { 
      id: '1', 
      title: 'iPhone 15 Pro Max', 
      price: 9999, 
      description: '最新款苹果手机',
      image: '/api/placeholder/300/200'
    },
    { 
      id: '2', 
      title: 'MacBook Air M3', 
      price: 8999, 
      description: '轻薄便携笔记本',
      image: '/api/placeholder/300/200'
    },
    { 
      id: '3', 
      title: 'AirPods Pro 3', 
      price: 1899, 
      description: '主动降噪无线耳机',
      image: '/api/placeholder/300/200'
    }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功',
    count: products.length,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
EOF

echo "✅ 商品列表API已创建"

# 7. 验证API文件结构
echo "📋 步骤7: 验证API文件结构..."
echo "API目录结构:"
find app/api -type f | sort

# 8. 清理缓存和依赖
echo "📋 步骤8: 清理缓存和重新安装依赖..."
rm -rf .next node_modules package-lock.json
npm cache clean --force || true

echo "重新安装依赖..."
npm install

echo "✅ 依赖安装完成"

# 9. 创建启动脚本
echo "📋 步骤9: 创建启动脚本..."
cat > start_app.sh << 'EOF'
#!/bin/bash
echo "🚀 启动Telegram彩票小程序..."

# 设置环境变量
export NODE_OPTIONS="--max_old_space_size=2048"
export PORT=3000

# 启动应用
npm run dev
EOF

chmod +x start_app.sh
echo "✅ 启动脚本已创建"

echo ""
echo "🎉 代码修复完成！"
echo ""
echo "📋 修复内容总结:"
echo "✅ 1. 修复了Next.js版本冲突问题（统一到14.2.33）"
echo "✅ 2. 创建了完整的API目录结构"
echo "✅ 3. 创建了健康检查API (app/api/health/route.ts)"
echo "✅ 4. 创建了商品列表API (app/api/get-products/route.ts)"
echo "✅ 5. 简化了next.config.js配置"
echo "✅ 6. 清理了所有缓存和依赖"
echo "✅ 7. 创建了启动脚本"
echo ""
echo "🚀 下一步执行:"
echo "   ./start_app.sh"
echo ""
echo "📍 测试API:"
echo "   curl http://localhost:3000/api/health"
echo "   curl http://localhost:3000/api/get-products"