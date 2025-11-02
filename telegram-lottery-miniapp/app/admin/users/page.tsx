'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface User {
  id: string
  telegram_id: number
  username: string
  full_name: string
  balance: number
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=users&action=list&limit=100`
      const response = await fetch(url)
      const result = await response.json()

      if (result.data?.users) {
        setUsers(result.data.users)
      }
    } catch (err) {
      console.error('Load users error:', err)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Users Management</h1>
          <p className="text-gray-600 text-sm mt-1">Total Users: {users.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telegram ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || user.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.telegram_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${parseFloat(user.balance.toString()).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
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
