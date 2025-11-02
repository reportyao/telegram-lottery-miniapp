'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  total_users: number
  total_products: number
  total_lottery_rounds: number
  total_orders: number
  total_revenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=stats&action=dashboard`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data) {
        setStats(result.data)
      } else if (result.error) {
        console.error('API Error:', result.error)
      }
    } catch (err: any) {
      console.error('Load stats error:', err)
      // 可以添加错误状态处理
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_username')
    router.push('/admin')
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Total Products"
              value={stats.total_products}
              icon="📦"
              color="green"
            />
            <StatCard
              title="Lottery Rounds"
              value={stats.total_lottery_rounds}
              icon="🎰"
              color="purple"
            />
            <StatCard
              title="Total Orders"
              value={stats.total_orders}
              icon="🛒"
              color="orange"
            />
            <StatCard
              title="Total Revenue"
              value={`$${typeof stats.total_revenue === 'string' ? parseFloat(stats.total_revenue).toFixed(2) : stats.total_revenue?.toFixed(2) || '0.00'}`}
              icon="💰"
              color="red"
            />
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/products">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🛍️</div>
              <h3 className="text-lg font-bold mb-2">Products Management</h3>
              <p className="text-gray-600 text-sm">Manage products, stock and pricing</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-lg font-bold mb-2">Users Management</h3>
              <p className="text-gray-600 text-sm">View and manage user accounts</p>
            </div>
          </Link>

          <Link href="/admin/lottery-rounds">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="text-lg font-bold mb-2">Lottery Rounds</h3>
              <p className="text-gray-600 text-sm">Manage lottery rounds and draw winners</p>
            </div>
          </Link>

          <Link href="/admin/posts">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold mb-2">Posts Moderation</h3>
              <p className="text-gray-600 text-sm">Review and approve user posts</p>
            </div>
          </Link>

          <Link href="/orders">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold mb-2">Orders</h3>
              <p className="text-gray-600 text-sm">View all orders and transactions</p>
            </div>
          </Link>

          <div
            onClick={() => {
              if (confirm('Trigger auto-draw for all ready lottery rounds?')) {
                fetch(`${SUPABASE_URL}/functions/v1/auto-draw-lottery`, {
                  method: 'POST'
                }).then(() => {
                  alert('Auto-draw triggered successfully!')
                  loadStats()
                })
              }
            }}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold mb-2">Manual Draw</h3>
            <p className="text-gray-600 text-sm">Trigger lottery draw manually</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-6 rounded-lg shadow-lg`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm opacity-90">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
