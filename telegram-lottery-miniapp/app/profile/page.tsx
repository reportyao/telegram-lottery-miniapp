'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { User, UserStats, Participation, LotteryRound } from '@/types/database'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      const authData = await telegram.authenticateUser()
      setUser(authData.user)

      // 获取用户统计数据
      const { data, error } = await supabase.functions.invoke('user-profile', {
        body: {
          user_id: authData.user.id
        },
      })

      if (error) {
        throw error
      }

      if (data?.data?.stats) {
        setStats(data.data.stats)
      }
    } catch (err: any) {
      console.error('Profile load error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
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
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name || user?.username || 'User'}</h1>
            <p className="text-sm opacity-90">@{user?.username || 'anonymous'}</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6 shadow-lg">
          <p className="text-sm opacity-90 mb-2">Current Balance</p>
          <p className="text-4xl font-bold">${user ? 
            typeof user.balance === 'string' 
              ? parseFloat(user.balance).toFixed(2)
              : user.balance?.toFixed(2) || '0.00'
            : '0.00'}</p>
          <Link href="/topup">
            <button className="mt-4 bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Top Up
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-primary">${stats.total_spent.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Total Wins</p>
            <p className="text-2xl font-bold text-green-600">{stats.total_wins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Participations</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total_participations}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Referrals</p>
            <p className="text-2xl font-bold text-orange-600">{stats.total_referrals}</p>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        <div className="bg-white rounded-lg shadow">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <span className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <span className="font-medium">Transaction History</span>
            </span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <span className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <span className="font-medium">My Wins</span>
            </span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <span className="flex items-center space-x-3">
              <span className="text-2xl">⚙️</span>
              <span className="font-medium">Settings</span>
            </span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
