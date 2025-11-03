'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
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