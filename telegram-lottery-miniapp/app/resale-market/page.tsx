'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegram } from '@/hooks/useTelegram'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  Eye
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Resale {
  id: string
  shares_to_sell: number
  price_per_share: number
  total_amount: number
  status: string
  created_at: string
  seller: {
    username: string
    avatar_url?: string
  }
  lottery_round: {
    status: string
    product: {
      name: string
      image_url: string
      price: number
    }
  }
}

export default function ResaleMarketPage() {
  const router = useRouter()
  const { user, tg } = useTelegram()
  const [resales, setResales] = useState<Resale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseModal, setPurchaseModal] = useState<Resale | null>(null)
  const [sharesToBuy, setSharesToBuy] = useState(1)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    loadResales()
  }, [])

  const loadResales = async () => {
    try {
      setLoading(true)
      const response = await fetch('/functions/v1/resale-api?action=list')
      const data = await response.json()
      
      if (data.success) {
        setResales(data.data)
      } else {
        setError(data.error || 'Failed to load resales')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error loading resales:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!user || !purchaseModal) return

    try {
      setPurchasing(true)
      const response = await fetch('/functions/v1/resale-api?action=purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resale_id: purchaseModal.id,
          shares_to_buy: sharesToBuy,
          buyer_id: user.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // 发送成功消息到 Telegram
        if (tg) {
          tg.showPopup({
            title: '购买成功！',
            message: `成功购买 ${sharesToBuy} 份转售份额！`,
            buttons: [{ type: 'ok' }]
          })
        }
        
        setPurchaseModal(null)
        setSharesToBuy(1)
        loadResales() // 刷新列表
      } else {
        if (tg) {
          tg.showPopup({
            title: '购买失败',
            message: data.error || '购买失败',
            buttons: [{ type: 'ok' }]
          })
        }
      }
    } catch (err) {
      console.error('Purchase error:', err)
      if (tg) {
        tg.showPopup({
          title: '错误',
          message: '网络错误，请重试',
          buttons: [{ type: 'ok' }]
        })
      }
    } finally {
      setPurchasing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'sold': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getLotteryStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500'
      case 'completed': return 'bg-purple-500'
      case 'ready_to_draw': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">转售市场</h1>
            <p className="text-gray-600">买卖抽奖份额</p>
          </div>
          <Button onClick={loadResales} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">活跃转售</p>
                  <p className="text-xl font-bold">
                    {resales.filter(r => r.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">总份额</p>
                  <p className="text-xl font-bold">
                    {resales.reduce((sum, r) => sum + (typeof r.shares_to_sell === 'string' ? parseInt(r.shares_to_sell) : r.shares_to_sell), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">平均价格</p>
                  <p className="text-xl font-bold">
                    {resales.length > 0 
                      ? formatCurrency(resales.reduce((sum, r) => sum + (typeof r.price_per_share === 'string' ? parseFloat(r.price_per_share) : r.price_per_share), 0) / resales.length)
                      : formatCurrency(0)
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">卖家数量</p>
                  <p className="text-xl font-bold">
                    {new Set(resales.map(r => r.seller.username)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resales List */}
        <div className="space-y-4">
          {resales.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无转售单</h3>
                <p className="text-gray-600 mb-4">当前没有可用的转售份额</p>
                <Button 
                  onClick={() => router.push('/my-resales')}
                  variant="outline"
                >
                  我的转售
                </Button>
              </CardContent>
            </Card>
          ) : (
            resales.map((resale) => (
              <Card key={resale.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                      {resale.lottery_round.product.image_url && (
                        <img 
                          src={resale.lottery_round.product.image_url} 
                          alt={resale.lottery_round.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {resale.lottery_round.product.name}
                        </h3>
                        <Badge className={`${getStatusColor(resale.status)} text-white ml-2`}>
                          {resale.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-sm text-gray-600">
                          卖家: {resale.seller.username}
                        </span>
                        <Badge className={`${getLotteryStatusColor(resale.lottery_round.status)} text-white text-xs`}>
                          {resale.lottery_round.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">剩余份额</p>
                            <p className="font-bold text-blue-600">{typeof resale.shares_to_sell === 'string' ? parseInt(resale.shares_to_sell) : resale.shares_to_sell}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">单价</p>
                            <p className="font-bold text-green-600">{formatCurrency(typeof resale.price_per_share === 'string' ? parseFloat(resale.price_per_share) : resale.price_per_share)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">总价</p>
                            <p className="font-bold text-purple-600">{formatCurrency(typeof resale.total_amount === 'string' ? parseFloat(resale.total_amount) : resale.total_amount)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                disabled={resale.status !== 'active'}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>购买转售份额</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">{purchaseModal.lottery_round.product.name}</h4>
                                  <p className="text-sm text-gray-600">卖家: {purchaseModal.seller.username}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">购买份数</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={typeof purchaseModal.shares_to_sell === 'string' ? parseInt(purchaseModal.shares_to_sell) : purchaseModal.shares_to_sell}
                                    value={sharesToBuy}
                                    onChange={(e) => setSharesToBuy(Math.max(1, Math.min(typeof purchaseModal.shares_to_sell === 'string' ? parseInt(purchaseModal.shares_to_sell) : purchaseModal.shares_to_sell, parseInt(e.target.value) || 1)))}
                                  />
                                  <p className="text-sm text-gray-600">
                                    可购买: {typeof purchaseModal.shares_to_sell === 'string' ? parseInt(purchaseModal.shares_to_sell) : purchaseModal.shares_to_sell} 份
                                  </p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between">
                                    <span>单价:</span>
                                    <span>{formatCurrency(typeof purchaseModal.price_per_share === 'string' ? parseFloat(purchaseModal.price_per_share) : purchaseModal.price_per_share)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>份数:</span>
                                    <span>{sharesToBuy}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg">
                                    <span>总计:</span>
                                    <span>{formatCurrency(sharesToBuy * (typeof purchaseModal.price_per_share === 'string' ? parseFloat(purchaseModal.price_per_share) : purchaseModal.price_per_share))}</span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={handlePurchase}
                                    disabled={purchasing || sharesToBuy > (typeof purchaseModal.shares_to_sell === 'string' ? parseInt(purchaseModal.shares_to_sell) : purchaseModal.shares_to_sell)}
                                    className="flex-1"
                                  >
                                    {purchasing ? '购买中...' : '确认购买'}
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      setPurchaseModal(null)
                                      setSharesToBuy(1)
                                    }}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {resale.status === 'active' && (
                            <Button 
                              size="sm"
                              onClick={() => setPurchaseModal(resale)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              购买
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/')}
            >
              首页
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/my-resales')}
            >
              我的转售
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/profile')}
            >
              个人中心
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}