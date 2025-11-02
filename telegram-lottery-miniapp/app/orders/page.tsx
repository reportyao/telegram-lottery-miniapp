'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase } from '@/lib/supabase'
import { User, Participation } from '@/types/database'
import Navigation from '@/components/Navigation'

interface ParticipationData extends Participation {
  lottery_rounds?: {
    products?: {
      name: Record<string, string>
    }
    winner_id: string | null
    status: string
  }
}

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [participations, setParticipations] = useState<ParticipationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      const authData = await telegram.authenticateUser()
      setUser(authData.user)

      const { data, error } = await supabase
        .from('participations')
        .select(`
          *,
          lottery_rounds (
            *,
            products (*)
          )
        `)
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setParticipations(data)
      }
    } catch (err) {
      console.error('Orders load error:', err)
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
        <h1 className="text-2xl font-bold">My Participations</h1>
        <p className="text-sm opacity-90">View all your lottery entries</p>
      </div>

      {/* Participations List */}
      <div className="p-4 space-y-3">
        {participations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">No participations yet</p>
          </div>
        ) : (
          participations.map((participation) => {
            const product = participation.lottery_rounds?.products
            const round = participation.lottery_rounds
            const isWinner = round?.winner_id === user?.id

            return (
              <div key={participation.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">
                      {product?.name?.en || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(participation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isWinner && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Won!
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Shares:</span>
                    <span className="ml-2 font-semibold">{participation.shares_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-semibold text-primary">
                      ${parseFloat(participation.amount_paid).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className={`text-xs font-medium ${
                    round?.status === 'completed' ? 'text-gray-600' :
                    round?.status === 'ready_to_draw' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {round?.status === 'completed' ? 'Completed' :
                     round?.status === 'ready_to_draw' ? 'Ready to Draw' :
                     'Active'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Navigation />
    </div>
  )
}
