'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { Product, User } from '@/types/database'
import { useNetworkStatus, retryWithBackoff, trackPerformance } from '@/lib/performance'
import ProductCard from '@/components/ProductCard'
import UserBalance from '@/components/UserBalance'
import Navigation from '@/components/Navigation'

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
      const loadProductsWithRetry = async (retries = 3) => {
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
              // 等待重试
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
              continue
            }

            // 根据网络状况优化产品数据
            const optimizedProducts = optimizeProductsForNetwork(data?.data?.products || [], connectionType)
            setProducts(optimizedProducts)
            return
          } catch (err) {
            if (i === retries - 1) throw err
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
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
