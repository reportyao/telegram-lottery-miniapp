'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import UserBalance from '@/components/UserBalance'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface UserProfile {
  id: string
  telegram_id: number
  first_name?: string
  last_name?: string
  username?: string
  coin_balance: number
  created_at: string
}

interface UserStats {
  total_participations: number
  total_wins: number
  total_spent: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({
    total_participations: 0,
    total_wins: 0,
    total_spent: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          setProfile(userData)

          // 获取用户统计数据
          const { data: participations } = await supabase
            .from('participations')
            .select('*')
            .eq('user_id', userData.id)

          const totalParticipations = participations?.length || 0
          const totalWins = 0 // 需要通过join lottery_rounds表获取winner_id
          const totalSpent = participations?.reduce((sum, p) => sum + p.amount_paid, 0) || 0

          setStats({
            total_participations: totalParticipations,
            total_wins: totalWins,
            total_spent: totalSpent
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">无法加载用户信息</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-blue-600">
                {profile.first_name?.charAt(0) || profile.username?.charAt(0) || '👤'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '用户'}
            </h2>
            {profile.username && (
              <p className="text-sm text-gray-600">@{profile.username}</p>
            )}
          </div>
          
          <UserBalance user={profile} balance={profile.coin_balance} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">参与次数</span>
              <span className="font-medium">{stats.total_participations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">中奖次数</span>
              <span className="font-medium text-green-600">{stats.total_wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总消费</span>
              <span className="font-medium">{stats.total_spent}T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">胜率</span>
              <span className="font-medium">
                {stats.total_participations > 0 
                  ? ((stats.total_wins / stats.total_participations) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">用户ID</span>
              <span className="font-mono text-sm">{profile.telegram_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">注册时间</span>
              <span className="text-sm">
                {new Date(profile.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
}