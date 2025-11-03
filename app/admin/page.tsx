'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
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
            .eq('status', 'active')
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
                <p className="text-sm text-gray-600">价格: {Object.values(product.name)[0]} - {product.price}T</p>
                <p className="text-sm text-gray-600">
                  状态: {product.status === 'active' ? '活跃' : '已下架'}
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