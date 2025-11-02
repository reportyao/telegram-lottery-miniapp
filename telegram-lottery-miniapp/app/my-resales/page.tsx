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
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
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
  lottery_round: {
    status: string
    product: {
      name: string
      image_url: string
      price: number
    }
  }
}

interface Participation {
  id: string
  shares_count: number
  amount_paid: number
  is_resaleable: boolean
  lottery_round: {
    status: string
    product: {
      name: string
      image_url: string
      price: number
    }
  }
}

export default function MyResalesPage() {
  const router = useRouter()
  const { user } = useTelegram()
  const [myResales, setMyResales] = useState<Resale[]>([])
  const [myParticipations, setMyParticipations] = useState<Participation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModal, setCreateModal] = useState<Participation | null>(null)
  const [sharesToSell, setSharesToSell] = useState(1)
  const [pricePerShare, setPricePerShare] = useState('')
  const [creating, setCreating] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMyData()
    }
  }, [user])

  const loadMyData = async () => {
    try {
      setLoading(true)
      
      // 加载我的转售单
      const resalesResponse = await fetch(`/functions/v1/resale-api?action=my_resales&user_id=${user?.id}`)
      const resalesData = await resalesResponse.json()
      
      if (resalesData.success) {
        setMyResales(resalesData.data)
      }

      // 加载我的参与记录
      const participationResponse = await fetch(`/functions/v1/user-profile?user_id=${user?.id}`)
      const participationData = await participationResponse.json()
      
      if (participationData.success) {
        const participations = participationData.data.participations || []
        setMyParticipations(participations.filter((p: Participation) => 
          p.is_resaleable && p.lottery_round.status === 'active'
        ))
      }
      
    } catch (err) {
      setError('Network error')
      console.error('Error loading my data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResale = async () => {
    if (!user || !createModal) return

    const price = parseFloat(pricePerShare)
    if (isNaN(price) || price <= 0) {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: '价格无效',
          message: '请输入有效的价格',
          buttons: [{ type: 'ok' }]
        })
      }
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/functions/v1/resale-api?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participation_id: createModal.id,
          shares_to_sell: sharesToSell,
          price_per_share: price
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showPopup({
            title: '创建成功！',
            message: '转售单创建成功！',
            buttons: [{ type: 'ok' }]
          })
        }
        
        setCreateModal(null)
        setSharesToSell(1)
        setPricePerShare('')
        loadMyData() // 刷新数据
      } else {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showPopup({
            title: '创建失败',
            message: data.error || '创建转售单失败',
            buttons: [{ type: 'ok' }]
          })
        }
      }
    } catch (err) {
      console.error('Create resale error:', err)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: '错误',
          message: '网络错误，请重试',
          buttons: [{ type: 'ok' }]
        })
      }
    } finally {
      setCreating(false)
    }
  }

  const handleCancelResale = async (resaleId: string) => {
    if (!user) return

    try {
      setCancelling(resaleId)
      const response = await fetch('/functions/v1/resale-api?action=cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resale_id: resaleId,
          seller_id: user.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showPopup({
            title: '取消成功！',
            message: '转售单已取消',
            buttons: [{ type: 'ok' }]
          })
        }
        loadMyData() // 刷新数据
      } else {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showPopup({
            title: '取消失败',
            message: data.error || '取消失败',
            buttons: [{ type: 'ok' }]
          })
        }
      }
    } catch (err) {
      console.error('Cancel resale error:', err)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showPopup({
          title: '错误',
          message: '网络错误，请重试',
          buttons: [{ type: 'ok' }]
        })
      }
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'sold': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />
      case 'sold': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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
            <h1 className="text-2xl font-bold text-gray-900">我的转售</h1>
            <p className="text-gray-600">管理您的转售单和份额</p>
          </div>
          <Button onClick={loadMyData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">转售单</p>
                  <p className="text-xl font-bold">{myResales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">总价值</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(myResales.reduce((sum, r) => sum + r.total_amount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">可转售</p>
                  <p className="text-xl font-bold">{myParticipations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">已售出</p>
                  <p className="text-xl font-bold">
                    {myResales.filter(r => r.status === 'sold').length}
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

        {/* My Resales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>我的转售单</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myResales.length === 0 ? (
              <div className="text-center py-8">
                <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无转售单</h3>
                <p className="text-gray-600 mb-4">您还没有发布任何转售单</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myResales.map((resale) => (
                  <div key={resale.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded">
                          {resale.lottery_round.product.image_url && (
                            <img 
                              src={resale.lottery_round.product.image_url} 
                              alt={resale.lottery_round.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{resale.lottery_round.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            发布于 {new Date(resale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(resale.status)} text-white`}>
                          {getStatusIcon(resale.status)}
                          <span className="ml-1">{resale.status}</span>
                        </Badge>
                        
                        {resale.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelResale(resale.id)}
                            disabled={cancelling === resale.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">剩余份额</p>
                        <p className="font-bold">{resale.shares_to_sell}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">单价</p>
                        <p className="font-bold text-green-600">{formatCurrency(resale.price_per_share)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">总价</p>
                        <p className="font-bold text-purple-600">{formatCurrency(resale.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available for Resale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>可转售份额</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myParticipations.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无可转售份额</h3>
                <p className="text-gray-600 mb-4">购买份额后即可发布转售单</p>
                <Button onClick={() => router.push('/')}>
                  去购买
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myParticipations.map((participation) => (
                  <div key={participation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded">
                          {participation.lottery_round.product.image_url && (
                            <img 
                              src={participation.lottery_round.product.image_url} 
                              alt={participation.lottery_round.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{participation.lottery_round.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            持有 {participation.shares_count} 份额
                          </p>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setCreateModal(participation)
                              setSharesToSell(Math.min(5, participation.shares_count))
                              setPricePerShare(participation.lottery_round.product.price.toString())
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            转为转售
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>创建转售单</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">{participation.lottery_round.product.name}</h4>
                              <p className="text-sm text-gray-600">
                                当前持有: {participation.shares_count} 份额
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">转售份数</label>
                              <Input
                                type="number"
                                min="1"
                                max={participation.shares_count}
                                value={sharesToSell}
                                onChange={(e) => setSharesToSell(Math.max(1, Math.min(participation.shares_count, parseInt(e.target.value) || 1)))}
                              />
                              <p className="text-sm text-gray-600">
                                最多可转售: {participation.shares_count} 份
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">单价 ({participation.lottery_round.product.currency})</label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={pricePerShare}
                                onChange={(e) => setPricePerShare(e.target.value)}
                                placeholder="输入单价"
                              />
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>份数:</span>
                                <span>{sharesToSell}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>单价:</span>
                                <span>{formatCurrency(parseFloat(pricePerShare) || 0)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span>总价:</span>
                                <span>{formatCurrency(sharesToSell * (parseFloat(pricePerShare) || 0))}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={handleCreateResale}
                                disabled={creating || !pricePerShare || parseFloat(pricePerShare) <= 0}
                                className="flex-1"
                              >
                                {creating ? '创建中...' : '确认创建'}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setCreateModal(null)
                                  setSharesToSell(1)
                                  setPricePerShare('')
                                }}
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
              onClick={() => router.push('/resale-market')}
            >
              转售市场
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