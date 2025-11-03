'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
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