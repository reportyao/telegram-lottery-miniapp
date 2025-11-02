'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/database'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'

export default function TopUpPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const presetAmounts = [10, 50, 100, 500, 1000]

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const authData = await telegram.authenticateUser()
      setUser(authData.user)
    } catch (err) {
      console.error('Load user error:', err)
    }
  }

  const handleTopUp = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: topUpError } = await supabase.functions.invoke('create-order', {
        body: {
          user_id: user.id,
          amount: parseFloat(amount),
          payment_method: 'demo'
        }
      })

      if (topUpError) {
        throw topUpError
      }

      alert(`Successfully added $${amount} to your balance!`)
      router.push('/profile')
    } catch (err: any) {
      console.error('Top up error:', err)
      setError(err.message || 'Failed to top up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-white text-lg"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Top Up Balance</h1>
        {user && (
          <p className="text-sm opacity-90 mt-2">
            Current Balance: ${typeof user.balance === 'string'
              ? parseFloat(user.balance).toFixed(2)
              : user.balance?.toFixed(2) || '0.00'
            }
          </p>
        )}
      </div>

      <div className="p-4">
        {/* Preset Amounts */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="font-bold mb-4">Quick Select</h3>
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                  amount === preset.toString()
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="font-bold mb-4">Custom Amount</h3>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl">
              $
            </span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> In this demo version, payments are simulated. 
            In production, this will integrate with Tajikistan local payment methods.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleTopUp}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Top Up $${amount || '0'}`}
        </button>

        {/* Payment Methods (Future) */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Future Payment Methods:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Local Bank Cards (Tajikistan)</li>
            <li>• Mobile Money</li>
            <li>• Cash Payment Centers</li>
            <li>• International Cards (Visa/MasterCard)</li>
          </ul>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
