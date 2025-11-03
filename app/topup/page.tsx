'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import UserBalance from '@/components/UserBalance'
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
          .select('coin_balance')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          setBalance(userData.coin_balance || 0)
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
            .update({ coin_balance: balance + amount })
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