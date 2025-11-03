#!/bin/bash

echo "🔧 同步修复并重新测试API"
echo "================================"

cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp

echo "步骤1: 停止现有应用..."
ps aux | grep -E "[n]ode.*next|next-server" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 2

echo ""
echo "步骤2: 备份并更新layout.tsx..."
cp app/layout.tsx app/layout.tsx.backup

# 创建修复后的layout.tsx
cat > app/layout.tsx << 'LAYOUT_END'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import React from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Lottery Platform - Telegram MiniApp',
    template: '%s | Lottery Platform'
  },
  description: 'Online lottery platform for Tajikistan',
  keywords: ['lottery', 'telegram', 'miniapp', 'tajikistan'],
  authors: [{ name: 'MiniMax Agent' }],
  creator: 'MiniMax Agent',
  publisher: 'MiniMax Agent',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Lottery Platform - Telegram MiniApp',
    description: 'Online lottery platform for Tajikistan',
    siteName: 'Lottery Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lottery Platform - Telegram MiniApp',
    description: 'Online lottery platform for Tajikistan',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#3B82F6',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
        <link rel="preconnect" href="https://mftfgofnosakobjfpzss.supabase.co" />
        <link rel="dns-prefetch" href="https://mftfgofnosakobjfpzss.supabase.co" />
      </head>
      <body className={`${inter.className} antialiased telegram-theme`}>
        <ErrorBoundary>
          <TelegramWebAppInit />
          <NetworkStatusIndicator />
          <div className="min-h-screen telegram-theme">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}

// Telegram WebApp 初始化组件
function TelegramWebAppInit() {
  'use client'
  
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])
  
  return null
}

// 网络状态指示器组件
function NetworkStatusIndicator() {
  'use client'
  
  const [isOnline, setIsOnline] = React.useState(true)
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    updateOnlineStatus()
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      }
    }
  }, [])
  
  if (isOnline) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50 text-sm">
      ⚠️ No internet connection. Some features may not work properly.
    </div>
  )
}
LAYOUT_END

echo "✅ layout.tsx已更新"

echo ""
echo "步骤3: 清理缓存..."
rm -rf .next

echo ""
echo "步骤4: 启动应用（端口3001）..."
export PORT=3001
nohup npm run dev > app_3001.log 2>&1 &
APP_PID=$!
echo "应用进程ID: $APP_PID"

echo ""
echo "步骤5: 等待应用启动..."
for i in {1..15}; do
    echo -n "."
    sleep 1
done
echo ""

echo ""
echo "步骤6: 测试API（10次）..."
echo "================================"

for i in {1..10}; do
    echo ""
    echo "第 $i 次测试:"
    echo "--- 健康检查API ---"
    HTTP_CODE=$(curl -s -o /tmp/health_$i.json -w "%{http_code}" http://localhost:3001/api/health)
    echo "状态码: $HTTP_CODE"
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ 成功"
        cat /tmp/health_$i.json | head -10
    else
        echo "❌ 失败"
        cat /tmp/health_$i.json | head -30
    fi
    
    echo ""
    echo "--- 商品列表API ---"
    HTTP_CODE=$(curl -s -o /tmp/products_$i.json -w "%{http_code}" http://localhost:3001/api/get-products)
    echo "状态码: $HTTP_CODE"
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ 成功"
        cat /tmp/products_$i.json | head -10
    else
        echo "❌ 失败"
        cat /tmp/products_$i.json | head -30
    fi
    
    sleep 2
done

echo ""
echo "================================"
echo "步骤7: 查看应用日志"
echo "================================"
tail -50 app_3001.log

echo ""
echo "✅ 测试完成！"
echo "应用运行在: http://localhost:3001"
echo "查看完整日志: tail -f /root/telegram-lottery-miniapp/telegram-lottery-miniapp/app_3001.log"
