'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface LotteryRound {
  id: string
  total_shares: number
  sold_shares: number
  price_per_share: number
  status: string
  draw_date: string | null
  winner_id: string | null
  products: {
    name: Record<string, string>
  }
}

export default function AdminLotteryRoundsPage() {
  const router = useRouter()
  const [rounds, setRounds] = useState<LotteryRound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadRounds()
  }, [router])

  const loadRounds = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=lottery_rounds&action=list`
      const response = await fetch(url)
      const result = await response.json()

      if (result.data?.rounds) {
        setRounds(result.data.rounds)
      }
    } catch (err) {
      console.error('Load rounds error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualDraw = async (roundId: string) => {
    if (!confirm('Are you sure you want to draw this lottery now?')) return

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=lottery_rounds&action=manual_draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_id: roundId })
      })

      const result = await response.json()

      if (result.data) {
        alert('Lottery drawn successfully!')
        loadRounds()
      } else {
        alert('Failed to draw lottery')
      }
    } catch (err) {
      console.error('Draw error:', err)
      alert('Failed to draw lottery')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Lottery Rounds Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price/Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rounds.map((round) => (
                <tr key={round.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {round.products?.name?.en || 'Unknown Product'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {round.sold_shares} / {round.total_shares}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(round.sold_shares / round.total_shares) * 100}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${round.price_per_share}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      round.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      round.status === 'ready_to_draw' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {round.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {round.status === 'ready_to_draw' && (
                      <button
                        onClick={() => handleManualDraw(round.id)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        Draw Now
                      </button>
                    )}
                    {round.status === 'completed' && round.winner_id && (
                      <span className="text-green-600">Winner Selected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
