'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useTelegram } from '@/hooks/useTelegram'

interface Post {
  id: string
  title: string
  content: string
  author_name: string
  created_at: string
  likes_count: number
  comments_count: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useTelegram()

  useEffect(() => {
    async function loadPosts() {
      try {
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            users!posts_user_id_fkey(first_name, username)
          `)
          .order('created_at', { ascending: false })

        if (postsData) {
          const formattedPosts = postsData.map(post => ({
            ...post,
            author_name: post.users?.first_name || post.users?.username || '匿名用户'
          }))
          setPosts(formattedPosts)
        }
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">社区动态</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无动态</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {post.author_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>👍 {post.likes_count || 0}</span>
                  <span>💬 {post.comments_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}