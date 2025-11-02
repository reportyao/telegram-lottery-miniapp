import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import React from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // 优化字体加载
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

// Telegram WebApp 初始化组件
function TelegramWebAppInit() {
  'use client'
  
  React.useEffect(() => {
    // Telegram WebApp 加载完成后的处理
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
    // 检查是否在客户端环境
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
        {/* 预连接优化 */}
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
