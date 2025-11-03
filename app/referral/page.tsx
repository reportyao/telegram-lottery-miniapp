'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface ReferralStats {
  total_referrals: number
  total_earnings: number
  referral_code: string
}

interface Referral {
  id: string
  referred_user_name: string
  earnings: number
  created_at: string
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    total_earnings: 0,
    referral_code: ''
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadReferralData() {
      if (!user) return

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id, telegram_id')
          .eq('telegram_id', user.id)
          .single()

        if (userData) {
          // 获取推荐统计
          const { data: referralsData } = await supabase
            .from('referrals')
            .select(`
              *,
              referred_user:users!referrals_referred_user_id_fkey(first_name, username)
            `)
            .eq('referrer_id', userData.id)

          if (referralsData) {
            const totalReferrals = referralsData.length
            const totalEarnings = referralsData.reduce((sum, ref) => sum + (ref.reward_amount || 0), 0)
            
            setStats({
              total_referrals: totalReferrals,
              total_earnings: totalEarnings,
              referral_code: userData.telegram_id.toString()
            })

            const formattedReferrals = referralsData.map(ref => ({
              id: ref.id,
              referred_user_name: ref.referred_user?.first_name || ref.referred_user?.username || '用户',
              earnings: ref.reward_amount || 0,
              created_at: ref.created_at
            }))

            setReferrals(formattedReferrals)
          }
        }
      } catch (error) {
        console.error('Error loading referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReferralData()
  }, [user])

  const shareReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=${stats.referral_code}`
    if (navigator.share) {
      navigator.share({
        title: '邀请好友参与夺宝',
        text: '快来一起夺宝赢奖品！',
        url: referralLink
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      alert('推荐链接已复制到剪贴板')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">推荐奖励</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_referrals}</div>
              <div className="text-sm text-gray-600">推荐人数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total_earnings}T</div>
              <div className="text-sm text-gray-600">累计收益</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">邀请好友</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的推荐码
            </label>
            <div className="flex">
              <input
                type="text"
                value={stats.referral_code}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(stats.referral_code)}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                复制
              </button>
            </div>
          </div>
          <button
            onClick={shareReferralLink}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            分享推荐链接
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐记录</h2>
            {referrals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无推荐记录</p>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{referral.referred_user_name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-green-600 font-medium">+{referral.earnings}T</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}