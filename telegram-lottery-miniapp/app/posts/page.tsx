'use client'

import { useEffect, useState } from 'react'
import { telegram } from '@/lib/telegram'
import { supabase, SUPABASE_URL } from '@/lib/supabase'
import { User } from '@/types/database'
import Navigation from '@/components/Navigation'
import Image from 'next/image'

interface Post {
  id: string
  user_id: string
  title: string
  content: string
  images: string[]
  likes_count: number
  comments_count: number
  created_at: string
  users?: {
    full_name: string
    username: string
  }
}

export default function PostsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const authData = await telegram.authenticateUser()
      setUser(authData.user)

      const url = `${SUPABASE_URL}/functions/v1/posts-manage?action=list&status=approved`
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

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase.functions.invoke('posts-manage', {
        body: {
          action: 'like',
          post_id: postId,
          user_id: user.id
        }
      })

      if (!error) {
        loadData()
      }
    } catch (err) {
      console.error('Like error:', err)
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Community Posts</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary px-4 py-2 rounded-lg font-semibold"
          >
            + Create
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="p-4 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* User Info */}
              <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  {post.users?.full_name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-semibold">
                    {post.users?.full_name || post.users?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <h3 className="font-bold mb-1">{post.title}</h3>
                {post.content && (
                  <p className="text-gray-700 text-sm">{post.content}</p>
                )}
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {post.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="relative h-48 bg-gray-200">
                      <Image
                        src={img}
                        alt={`Post image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center space-x-6 border-t pt-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
                >
                  <span className="text-xl">❤️</span>
                  <span className="text-sm font-medium">{post.likes_count}</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="text-xl">💬</span>
                  <span className="text-sm font-medium">{post.comments_count}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}

      <Navigation />
    </div>
  )
}

interface CreatePostModalProps {
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

// Create Post Modal Component
function CreatePostModal({ user, onClose, onSuccess }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user || !title) return

    try {
      setLoading(true)

      const { data, error } = await supabase.functions.invoke('posts-manage', {
        body: {
          action: 'create',
          user_id: user.id,
          title,
          content,
          images: []
        }
      })

      if (error) {
        throw error
      }

      alert('Post created successfully!')
      onSuccess()
    } catch (err: any) {
      console.error('Create post error:', err)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your win story..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !title}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
