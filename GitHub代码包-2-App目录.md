# GitHub代码包-2-App目录

## 📁 App目录完整代码包

本文档包含Telegram夺宝MiniApp项目app目录下的所有文件的完整代码内容。

---

## 📄 根目录文件

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### layout.tsx
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Telegram夺宝MiniApp',
  description: '基于Telegram的夺宝小程序',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { UserBalance } from '@/components/UserBalance'
import { Navigation } from '@/components/Navigation'
import { useTelegram } from '@/hooks/useTelegram'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

interface UserInfo {
  id: string
  first_name?: string
  username?: string
  balance: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: telegramUser, webApp } = useTelegram()

  useEffect(() => {
    async function loadData() {
      if (!telegramUser) return

      try {
        // 获取用户信息
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramUser.id)
          .single()

        if (userData) {
          setUser({
            id: userData.id,
            first_name: userData.first_name,
            username: userData.username,
            balance: userData.balance
          })
        }

        // 获取产品列表
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsData) {
          setProducts(productsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [telegramUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto p-4">
          <UserBalance balance={user?.balance || 0} />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">夺宝商城</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无夺宝商品</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

---

## 📁 子目录文件

### admin/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'
import type { Product } from '@/types/database'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return

      try {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('telegram_id', user.id)
          .single()

        setIsAdmin(!!adminData)

        if (adminData) {
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

          if (productsData) {
            setProducts(productsData)
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">您没有管理员权限</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">管理员面板</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">商品管理</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border-b pb-4 last:border-b-0">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">价格: {product.price}T</p>
                <p className="text-sm text-gray-600">
                  状态: {product.is_active ? '活跃' : '已下架'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
```

### api/auth/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TelegramService } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json()

    if (!initData) {
      return NextResponse.json({ error: 'No init data provided' }, { status: 400 })
    }

    // 验证Telegram数据
    const telegramService = new TelegramService()
    const userData = await telegramService.authenticateUser(initData)

    if (!userData) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 })
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userData.id)
      .single()

    if (!existingUser) {
      // 创建新用户
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          balance: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      return NextResponse.json({ user: newUser })
    }

    return NextResponse.json({ user: existingUser })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### my-resales/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface Resale {
  id: string
  product_name: string
  original_price: number
  resale_price: number
  status: string
  created_at: string
}

export default function MyResalesPage() {
  const [resales, setResales] = useState<Resale[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadResales() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          const { data: resalesData } = await supabase
            .from('resales')
            .select('*')
            .eq('seller_id', userData.id)
            .order('created_at', { ascending: false })

          if (resalesData) {
            setResales(resalesData)
          }
        }
      } catch (error) {
        console.error('Error loading resales:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResales()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的转售</h1>
        
        {resales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无转售记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resales.map((resale) => (
              <div key={resale.id} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-900">{resale.product_name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    原价: {resale.original_price}T
                  </p>
                  <p className="text-sm text-gray-600">
                    转售价: {resale.resale_price}T
                  </p>
                  <p className="text-sm">
                    状态: <span className={`font-medium ${
                      resale.status === 'active' ? 'text-green-600' : 
                      resale.status === 'sold' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {resale.status === 'active' ? '出售中' : 
                       resale.status === 'sold' ? '已售出' : '已取消'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

### orders/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface Order {
  id: string
  product_name: string
  amount: number
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadOrders() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false })

          if (ordersData) {
            setOrders(ordersData)
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无订单记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-900">{order.product_name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">金额: {order.amount}T</p>
                  <p className="text-sm">
                    状态: <span className={`font-medium ${
                      order.status === 'completed' ? 'text-green-600' : 
                      order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {order.status === 'completed' ? '已完成' : 
                       order.status === 'pending' ? '处理中' : '已取消'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

### posts/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface Post {
  id: string
  title: string
  content: string
  author_name: string
  created_at: string
  likes_count: number
  comments_count: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadPosts() {
      try {
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            users!posts_user_id_fkey(first_name, username)
          `)
          .order('created_at', { ascending: false })

        if (postsData) {
          const formattedPosts = postsData.map(post => ({
            ...post,
            author_name: post.users?.first_name || post.users?.username || '匿名用户'
          }))
          setPosts(formattedPosts)
        }
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">社区动态</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无动态</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {post.author_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>👍 {post.likes_count || 0}</span>
                  <span>💬 {post.comments_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

### profile/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { UserBalance } from '@/components/UserBalance'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface UserProfile {
  id: string
  telegram_id: number
  first_name?: string
  last_name?: string
  username?: string
  balance: number
  created_at: string
}

interface UserStats {
  total_participations: number
  total_wins: number
  total_spent: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    total_participations: 0,
    total_wins: 0,
    total_spent: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          setProfile(userData)

          // 获取用户统计数据
          const { data: participations } = await supabase
            .from('participations')
            .select('*')
            .eq('user_id', userData.id)

          const totalParticipations = participations?.length || 0
          const totalWins = participations?.filter(p => p.is_winner).length || 0
          const totalSpent = participations?.reduce((sum, p) => sum + (p.shares * p.price_per_share), 0) || 0

          setStats({
            total_participations: totalParticipations,
            total_wins: totalWins,
            total_spent: totalSpent
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">无法加载用户信息</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-blue-600">
                {profile.first_name?.charAt(0) || '👤'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {profile.first_name || profile.username || '用户'}
            </h2>
            {profile.username && (
              <p className="text-sm text-gray-600">@{profile.username}</p>
            )}
          </div>
          
          <UserBalance balance={profile.balance} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">参与次数</span>
              <span className="font-medium">{stats.total_participations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">中奖次数</span>
              <span className="font-medium text-green-600">{stats.total_wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总消费</span>
              <span className="font-medium">{stats.total_spent}T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">胜率</span>
              <span className="font-medium">
                {stats.total_participations > 0 
                  ? ((stats.total_wins / stats.total_participations) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">用户ID</span>
              <span className="font-mono text-sm">{profile.telegram_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">注册时间</span>
              <span className="text-sm">
                {new Date(profile.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
```

### referral/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface ReferralStats {
  total_referrals: number
  total_earnings: number
  referral_code: string
}

interface Referral {
  id: string
  referred_user_name: string
  earnings: number
  created_at: string
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    total_earnings: 0,
    referral_code: ''
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadReferralData() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id, telegram_id')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          // 获取推荐统计
          const { data: referralsData } = await supabase
            .from('referrals')
            .select(`
              *,
              referred_user:users!referrals_referred_user_id_fkey(first_name, username)
            `)
            .eq('referrer_id', userData.id)

          if (referralsData) {
            const totalReferrals = referralsData.length
            const totalEarnings = referralsData.reduce((sum, ref) => sum + (ref.reward_amount || 0), 0)
            
            setStats({
              total_referrals: totalReferrals,
              total_earnings: totalEarnings,
              referral_code: userData.telegram_id.toString()
            })

            const formattedReferrals = referralsData.map(ref => ({
              id: ref.id,
              referred_user_name: ref.referred_user?.first_name || ref.referred_user?.username || '用户',
              earnings: ref.reward_amount || 0,
              created_at: ref.created_at
            }))

            setReferrals(formattedReferrals)
          }
        }
      } catch (error) {
        console.error('Error loading referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReferralData()
  }, [user])

  const shareReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=${stats.referral_code}`
    if (navigator.share) {
      navigator.share({
        title: '邀请好友参与夺宝',
        text: '快来一起夺宝赢奖品！',
        url: referralLink
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      alert('推荐链接已复制到剪贴板')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">推荐奖励</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_referrals}</div>
              <div className="text-sm text-gray-600">推荐人数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total_earnings}T</div>
              <div className="text-sm text-gray-600">累计收益</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">邀请好友</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的推荐码
            </label>
            <div className="flex">
              <input
                type="text"
                value={stats.referral_code}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(stats.referral_code)}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                复制
              </button>
            </div>
          </div>
          <button
            onClick={shareReferralLink}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            分享推荐链接
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐记录</h2>
            {referrals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无推荐记录</p>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{referral.referred_user_name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-green-600 font-medium">+{referral.earnings}T</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

### resale-market/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface ResaleItem {
  id: string
  product_name: string
  original_price: number
  resale_price: number
  seller_name: string
  created_at: string
}

export default function ResaleMarketPage() {
  const [resaleItems, setResaleItems] = useState<ResaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadResaleItems() {
      try {
        const { data: resalesData } = await supabase
          .from('resales')
          .select(`
            *,
            seller:users!resales_seller_id_fkey(first_name, username)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (resalesData) {
          const formattedItems = resalesData.map(item => ({
            ...item,
            seller_name: item.seller?.first_name || item.seller?.username || '匿名卖家'
          }))
          setResaleItems(formattedItems)
        }
      } catch (error) {
        console.error('Error loading resale items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResaleItems()
  }, [])

  const handlePurchase = async (resaleId: string, price: number) => {
    if (!user) return

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, balance')
        .eq('telegram_id', user.id)
        .single()

      if (!userData) {
        alert('用户信息获取失败')
        return
      }

      if (userData.balance < price) {
        alert('余额不足')
        return
      }

      // 购买转售商品的逻辑
      const { error } = await supabase
        .rpc('purchase_resale_item', {
          resale_id: resaleId,
          buyer_id: userData.id
        })

      if (error) {
        console.error('Purchase error:', error)
        alert('购买失败')
      } else {
        alert('购买成功！')
        // 重新加载数据
        window.location.reload()
      }
    } catch (error) {
      console.error('Error purchasing resale item:', error)
      alert('购买失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">转售市场</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : resaleItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无转售商品</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resaleItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">卖家: {item.seller_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {item.resale_price}T
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      原价: {item.original_price}T
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    onClick={() => handlePurchase(item.id, item.resale_price)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    立即购买
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
```

### topup/page.tsx
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { UserBalance } from '@/components/UserBalance'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

const TOPUP_AMOUNTS = [10, 50, 100, 200, 500, 1000]

export default function TopupPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadBalance() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('balance')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          setBalance(userData.balance)
        }
      } catch (error) {
        console.error('Error loading balance:', error)
      }
    }

    loadBalance()
  }, [user])

  const handleTopup = async () => {
    if (!user) return

    const amount = selectedAmount || parseInt(customAmount)
    if (!amount || amount <= 0) {
      alert('请选择或输入有效的充值金额')
      return
    }

    setLoading(true)

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single()

      if (userData) {
        // 创建充值订单
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            user_id: userData.id,
            product_name: `充值 ${amount}T`,
            amount: amount,
            type: 'topup',
            status: 'pending'
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating topup order:', error)
          alert('充值失败')
        } else {
          // 模拟支付成功，直接更新余额
          const { error: updateError } = await supabase
            .from('users')
            .update({ balance: balance + amount })
            .eq('id', userData.id)

          if (updateError) {
            console.error('Error updating balance:', error)
            alert('充值失败')
          } else {
            // 更新订单状态
            await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('id', order.id)

            alert('充值成功！')
            setBalance(balance + amount)
            setSelectedAmount(null)
            setCustomAmount('')
          }
        }
      }
    } catch (error) {
      console.error('Error processing topup:', error)
      alert('充值失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">账户充值</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <UserBalance balance={balance} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">选择充值金额</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {TOPUP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                className={`p-3 rounded-lg border text-center ${
                  selectedAmount === amount
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {amount}T
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义金额
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="输入充值金额"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleTopup}
            disabled={loading || (!selectedAmount && !customAmount)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : '确认充值'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">充值说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 充值后金额立即到账</li>
            <li>• 支持多种支付方式</li>
            <li>• 1T = 1 Telegram币</li>
            <li>• 最低充值金额为10T</li>
          </ul>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
```

---

## 📋 总结

本文档包含了Telegram夺宝MiniApp项目app目录下的所有页面和API路由的完整代码：

- **根目录文件**: globals.css, layout.tsx, page.tsx
- **页面路由**: admin, my-resales, orders, posts, profile, referral, resale-market, topup
- **API路由**: auth认证接口

所有代码都使用TypeScript + React + Next.js 14，集成了Supabase后端服务和Telegram Mini App SDK。