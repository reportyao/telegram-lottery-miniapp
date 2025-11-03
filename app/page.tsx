'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import UserBalance from '@/components/UserBalance'
import Navigation from '@/components/Navigation'
import { useTelegram } from '@/hooks/useTelegram'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

interface UserInfo {
  id: string
  full_name?: string
  username?: string
  balance: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: telegramUser, isTelegramAvailable } = useTelegram()

  useEffect(() => {
    async function loadData() {
      // 开发模式：如果不在 Telegram 环境中，使用模拟用户
      const isDevelopment = !isTelegramAvailable
      const effectiveUser = telegramUser || (isDevelopment ? { id: 999999999, username: 'dev_user', first_name: 'Dev' } : null)
      
      if (!effectiveUser) {
        setLoading(false)
        return
      }

      try {
        // 获取用户信息
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', effectiveUser.id)
          .single()

        if (userData) {
          setUser({
            id: userData.id,
            full_name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'User',
            username: userData.username,
            balance: userData.coin_balance || 0
          })
        }

        // 获取产品列表
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
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
  }, [telegramUser, isTelegramAvailable])

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
          <UserBalance user={user} />
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