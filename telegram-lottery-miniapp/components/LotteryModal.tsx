'use client'

import { Product, LotteryRound, User } from '@/types/database'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LotteryModalProps {
  product: Product
  lotteryRound: LotteryRound
  user: User | null
  onClose: () => void
}

export default function LotteryModal({ product, lotteryRound, user, onClose }: LotteryModalProps) {
  const [shares, setShares] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableShares = lotteryRound.total_shares - lotteryRound.sold_shares
  const totalAmount = shares * parseFloat(lotteryRound.price_per_share.toString())

  const handleParticipate = async () => {
    // 检查网络状态
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network.')
      return
    }

    if (!user) {
      setError('Please login first')
      return
    }

    if (shares < 1 || shares > availableShares) {
      setError('Invalid number of shares')
      return
    }

    if (parseFloat(user.balance.toString()) < totalAmount) {
      setError('Insufficient balance')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: participateError } = await supabase.functions.invoke('participate-lottery', {
        body: {
          user_id: user.id,
          lottery_round_id: lotteryRound.id,
          shares_count: shares,
        },
      })

      if (participateError) {
        throw participateError
      }

      // 显示成功消息而不是alert
      setError(null)
      setLoading(false)
      
      // 触发重新加载页面数据
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lotteryParticipated'))
      }
      
      onClose()
    } catch (err: any) {
      console.error('Participation error:', err)
      
      // 更好的错误处理
      if (err.message?.includes('network') || err.message?.includes('timeout')) {
        setError('Network error. Please try again.')
      } else if (err.message?.includes('balance')) {
        setError('Insufficient balance for this transaction')
      } else if (err.message?.includes('shares')) {
        setError('Not enough shares available')
      } else {
        setError(err.message || 'Failed to participate. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getProductName = (names: Record<string, string>) => {
    return names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{getProductName(product.name)}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Shares:</span>
              <span className="font-semibold">{lotteryRound.total_shares}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sold Shares:</span>
              <span className="font-semibold">{lotteryRound.sold_shares}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Available:</span>
              <span className="font-semibold text-green-600">{availableShares}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per Share:</span>
              <span className="font-semibold text-primary">${lotteryRound.price_per_share}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Shares (Max: {Math.min(availableShares, 50)})
            </label>
            <input
              type="number"
              min="1"
              max={Math.min(availableShares, 50)}
              value={shares}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setShares(1)
                } else {
                  const numValue = parseInt(value)
                  if (!isNaN(numValue)) {
                    setShares(Math.max(1, Math.min(numValue, availableShares, 50)))
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="bg-primary-light bg-opacity-20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
            </div>
            {user && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600">Your Balance:</span>
                <span className={`font-semibold ${
                  parseFloat(user.balance.toString()) >= totalAmount ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${parseFloat(user.balance.toString()).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleParticipate}
            disabled={loading || !user}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Participation'}
          </button>
        </div>
      </div>
    </div>
  )
}
