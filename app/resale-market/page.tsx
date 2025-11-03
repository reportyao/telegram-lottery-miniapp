'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
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
            seller:users!resales_seller_id_fkey(full_name, username)
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