# Telegram Lottery MiniApp - App Directory Files

本文档包含 `/workspace/telegram-lottery-miniapp/app/` 目录下的所有文件内容，按目录结构组织。

## 目录结构

```
app/
├── globals.css
├── layout.tsx
├── page.tsx
├── admin/
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── lottery-rounds/
│   │   └── page.tsx
│   ├── posts/
│   │   └── page.tsx
│   ├── products/
│   │   └── page.tsx
│   └── users/
│       └── page.tsx
├── api/
│   ├── get-products/
│   │   └── route.ts
│   └── health/
│       └── route.ts
├── my-resales/
│   └── page.tsx
├── orders/
│   └── page.tsx
├── posts/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── referral/
│   └── page.tsx
├── resale-market/
│   └── page.tsx
└── topup/
    └── page.tsx
```

## 文件内容

### 根目录文件

#### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 245, 245, 245;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Telegram theme integration */
.telegram-theme {
  background-color: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #000);
}

.telegram-button {
  background-color: var(--tg-theme-button-color, #0088cc);
  color: var(--tg-theme-button-text-color, #fff);
}
```

#### layout.tsx
```tsx
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
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready()
      (window as any).Telegram.WebApp.expand()
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
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} />
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
```

#### page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { Product, User } from '@/types/database'
import { useNetworkStatus, retryWithBackoff, trackPerformance } from '@/lib/performance'
import ProductCard from '@/components/ProductCard'
import UserBalance from '@/components/UserBalance'
import Navigation from '@/components/Navigation'

// 重试相关常量
const RETRY_BASE_DELAY = 1000 // 基础延迟1秒
const MAX_RETRIES = 3 // 最大重试次数

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, connectionType } = useNetworkStatus()

  useEffect(() => {
    initializeApp()
    trackPerformance()
  }, [])

  // 根据网络状况优化产品数据
  const optimizeProductsForNetwork = (products: Product[], networkType: string): Product[] => {
    // 慢网络环境下的优化
    const slowNetworks = ['slow-2g', '2g']
    
    if (slowNetworks.includes(networkType)) {
      return products.slice(0, 6) // 只加载前6个产品
    }
    
    return products
  }

  const initializeApp = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!isOnline) {
        setError('No internet connection. Please check your network.')
        return
      }
      
      // Authenticate with Telegram
      const authData = await telegram.authenticateUser()
      setUser(authData.user)

      // Load products with retry mechanism and network optimization
      const loadProductsWithRetry = async (retries = MAX_RETRIES) => {
        for (let i = 0; i < retries; i++) {
          try {
            const { data, error } = await supabase.functions.invoke('get-products', {
              headers: {
                'X-Client-Info': 'lottery-miniapp',
                'X-Request-ID': Date.now().toString(),
              },
            })
            
            if (error) {
              if (i === retries - 1) throw error
              // 等待重试 - 指数退避
              await new Promise(resolve => setTimeout(resolve, RETRY_BASE_DELAY * (i + 1)))
              continue
            }

            // 根据网络状况优化产品数据
            const optimizedProducts = optimizeProductsForNetwork(data?.data?.products || [], connectionType)
            setProducts(optimizedProducts)
            return
          } catch (err) {
            if (i === retries - 1) throw err
            await new Promise(resolve => setTimeout(resolve, RETRY_BASE_DELAY * (i + 1)))
          }
        }
      }

      await loadProductsWithRetry()
    } catch (err: any) {
      console.error('Initialization error:', err)
      setError(err.message || 'Failed to initialize app')
    } finally {
      setLoading(false)
    }
  }

  // 重试机制
  const handleRetry = () => {
    initializeApp()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {!isOnline && (
            <p className="text-red-500 text-sm mt-2">Checking network connection...</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
            {!isOnline && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Lottery Platform</h1>
          {/* 网络状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-xs opacity-75">
              {isOnline ? connectionType : 'Offline'}
            </span>
          </div>
        </div>
        {user && <UserBalance user={user} />}
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Hot Products</h2>
          <span className="text-sm text-gray-500">
            {products.length} items
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} user={user} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-lg font-semibold mb-2">No products available</p>
            <p className="text-sm">Check back later for new lotteries</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
```

### admin 目录


#### admin/page.tsx
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Please enter username and password')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 演示版本：简单的用户名密码验证
      // 生产环境应使用proper authentication
      if (username === 'admin' && password === 'admin123') {
        // 保存登录状态
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('admin_username', username)
        
        router.push('/admin/dashboard')
      } else {
        setError('Invalid username or password')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Lottery Platform Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">Demo Credentials:</p>
          <p className="text-sm text-blue-700">Username: admin</p>
          <p className="text-sm text-blue-700">Password: admin123</p>
        </div>
      </div>
    </div>
  )
}
```

#### admin/dashboard/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  total_users: number
  total_products: number
  total_lottery_rounds: number
  total_orders: number
  total_revenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=stats&action=dashboard`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data) {
        setStats(result.data)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load stats error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_username')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Total Products"
              value={stats.total_products}
              icon="📦"
              color="green"
            />
            <StatCard
              title="Lottery Rounds"
              value={stats.total_lottery_rounds}
              icon="🎰"
              color="purple"
            />
            <StatCard
              title="Total Orders"
              value={stats.total_orders}
              icon="🛒"
              color="orange"
            />
            <StatCard
              title="Total Revenue"
              value={`$${typeof stats.total_revenue === 'string' ? parseFloat(stats.total_revenue).toFixed(2) : stats.total_revenue?.toFixed(2) || '0.00'}`}
              icon="💰"
              color="red"
            />
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/products">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🛍️</div>
              <h3 className="text-lg font-bold mb-2">Products Management</h3>
              <p className="text-gray-600 text-sm">Manage products, stock and pricing</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-lg font-bold mb-2">Users Management</h3>
              <p className="text-gray-600 text-sm">View and manage user accounts</p>
            </div>
          </Link>

          <Link href="/admin/lottery-rounds">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="text-lg font-bold mb-2">Lottery Rounds</h3>
              <p className="text-gray-600 text-sm">Manage lottery rounds and draw winners</p>
            </div>
          </Link>

          <Link href="/admin/posts">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold mb-2">Posts Moderation</h3>
              <p className="text-gray-600 text-sm">Review and approve user posts</p>
            </div>
          </Link>

          <Link href="/orders">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold mb-2">Orders</h3>
              <p className="text-gray-600 text-sm">View all orders and transactions</p>
            </div>
          </Link>

          <div
            onClick={() => {
              if (confirm('Trigger auto-draw for all ready lottery rounds?')) {
                fetch(`${SUPABASE_URL}/functions/v1/auto-draw-lottery`, {
                  method: 'POST'
                }).then(() => {
                  alert('Auto-draw triggered successfully!')
                  loadStats()
                })
              }
            }}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold mb-2">Manual Draw</h3>
            <p className="text-gray-600 text-sm">Trigger lottery draw manually</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-6 rounded-lg shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm opacity-90">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
```


#### admin/lottery-rounds/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface LotteryRound {
  id: string
  total_shares: number
  sold_shares: number
  price_per_share: number
  status: string
  draw_date: string | null
  winner_id: string | null
  products: {
    name: Record<string, string>
  }
}

export default function AdminLotteryRoundsPage() {
  const router = useRouter()
  const [rounds, setRounds] = useState<LotteryRound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadRounds()
  }, [router])

  const loadRounds = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=lottery_rounds&action=list`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data?.rounds) {
        setRounds(result.data.rounds)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load rounds error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  const handleManualDraw = async (roundId: string) => {
    if (!confirm('Are you sure you want to draw this lottery now?')) return

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=lottery_rounds&action=manual_draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_id: roundId })
      })

      const result = await response.json()

      if (result.data) {
        alert('Lottery drawn successfully!')
        loadRounds()
      } else {
        alert('Failed to draw lottery')
      }
    } catch (err) {
      console.error('Draw error:', err)
      alert('Failed to draw lottery')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Lottery Rounds Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price/Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rounds.map((round) => (
                <tr key={round.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {round.products?.name?.en || 'Unknown Product'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {round.sold_shares} / {round.total_shares}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(round.sold_shares / round.total_shares) * 100}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${round.price_per_share}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      round.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      round.status === 'ready_to_draw' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {round.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {round.status === 'ready_to_draw' && (
                      <button
                        onClick={() => handleManualDraw(round.id)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        Draw Now
                      </button>
                    )}
                    {round.status === 'completed' && round.winner_id && (
                      <span className="text-green-600">Winner Selected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

#### admin/posts/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  users: {
    full_name: string
    username: string
  }
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadPosts()
  }, [router])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=pending`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data?.posts) {
        setPosts(result.data.posts)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load posts error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId: string) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      alert('Post approved!')
      loadPosts()
    } catch (err) {
      console.error('Approve error:', err)
    }
  }

  const handleReject = async (postId: string) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      alert('Post rejected!')
      loadPosts()
    } catch (err) {
      console.error('Reject error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Posts Moderation</h1>
          <p className="text-gray-600 text-sm mt-1">Pending posts: {posts.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">No pending posts to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{post.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {post.users?.full_name || post.users?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    {post.status}
                  </span>
                </div>

                {post.content && (
                  <p className="text-gray-700 mb-4">{post.content}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```


#### admin/products/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface Product {
  id: string
  name: Record<string, string>
  price: number
  stock: number
  category: string
  status: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=products&action=list`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data?.products) {
        setProducts(result.data.products)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load products error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/admin/dashboard" className="text-primary hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Products Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name.en || product.name.zh || 'Unnamed'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

#### admin/users/page.tsx
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface User {
  id: string
  telegram_id: number
  username: string
  full_name: string
  balance: number
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=users&action=list&limit=100`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data?.users) {
        setUsers(result.data.users)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load users error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Users Management</h1>
          <p className="text-gray-600 text-sm mt-1">Total Users: {users.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telegram ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || user.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.telegram_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${typeof user.balance === 'string'
                        ? parseFloat(user.balance).toFixed(2)
                        : user.balance?.toFixed(2) || '0.00'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

### api 目录

#### api/get-products/route.ts
```ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  console.log('🚀 商品列表API被调用');
  
  try {
    // 从请求中获取参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';

    // 调用Supabase Edge Function获取产品
    const { data, error } = await supabase.functions.invoke('get-products', {
      headers: {
        'X-Client-Info': 'telegram-lottery-miniapp',
        'X-Request-ID': Date.now().toString(),
      },
      body: { category, status }
    });

    if (error) {
      console.error('Supabase Edge Function错误:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'SUPABASE_ERROR',
          message: error.message || '获取产品列表失败'
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const products = data?.data?.products || [];
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      message: '商品列表获取成功',
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || '服务器内部错误'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

#### api/health/route.ts
```ts
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
```
