'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPABASE_URL } from '@/lib/supabase'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  users: {
    full_name: string
    username: string
  }
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin')
      return
    }

    loadPosts()
  }, [router])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const url = `${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=pending`
      const response = await fetch(url)
      const result = await response.json()

      if (result.data?.posts) {
        setPosts(result.data.posts)
      }
    } catch (err) {
      console.error('Load posts error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId: string) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      alert('Post approved!')
      loadPosts()
    } catch (err) {
      console.error('Approve error:', err)
    }
  }

  const handleReject = async (postId: string) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/admin-api?resource=posts&action=reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      alert('Post rejected!')
      loadPosts()
    } catch (err) {
      console.error('Reject error:', err)
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
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Posts Moderation</h1>
          <p className="text-gray-600 text-sm mt-1">Pending posts: {posts.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">No pending posts to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{post.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {post.users?.full_name || post.users?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    {post.status}
                  </span>
                </div>

                {post.content && (
                  <p className="text-gray-700 mb-4">{post.content}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(post.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
