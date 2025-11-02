'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/database'
import Navigation from '@/components/Navigation'

interface ReferralData {
  id: string
  reward_amount: string | number
  status: string
  created_at: string
  referred?: {
    full_name: string | null
    username: string | null
  }
}

export default function ReferralPage() {
  const [user, setUser] = useState<User | null>(null)
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [totalRewards, setTotalRewards] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReferrals()
  }, [])

  const loadReferrals = async () => {
    try {
      setLoading(true)
      
      const authData = await telegram.authenticateUser()
      setUser(authData.user)

      const { data, error } = await supabase
        .from('referrals')
        .select('*, referred:users!referred_id(*)')
        .eq('referrer_id', authData.user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReferrals(data)
        const total = data.reduce((sum, ref) => sum + parseFloat(ref.reward_amount || 0), 0)
        setTotalRewards(total)
      }
    } catch (err) {
      console.error('Referrals load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const link = `https://t.me/your_bot?start=${user?.telegram_id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Referral Program</h1>
        <p className="text-sm opacity-90">Invite friends and earn rewards</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg mb-4">
          <p className="text-sm opacity-90 mb-2">Total Earnings</p>
          <p className="text-4xl font-bold">${totalRewards.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-primary">{referrals.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Reward Rate</p>
            <p className="text-3xl font-bold text-green-600">5%</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">Your Referral Link</h3>
          <div className="bg-gray-50 p-3 rounded-lg mb-3 break-all text-sm">
            {`https://t.me/your_bot?start=${user?.telegram_id}`}
          </div>
          <button
            onClick={copyReferralLink}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">How it Works</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium">Share your link</p>
                <p className="text-sm text-gray-600">Send your unique referral link to friends</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium">Friends join</p>
                <p className="text-sm text-gray-600">They sign up using your link</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium">Earn rewards</p>
                <p className="text-sm text-gray-600">Get 5% of their spending as rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length > 0 && (
        <div className="p-4">
          <h3 className="font-bold mb-3">Your Referrals</h3>
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {referral.referred?.full_name || referral.referred?.username || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${parseFloat(referral.reward_amount || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs ${
                      referral.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}
