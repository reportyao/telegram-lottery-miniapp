import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 环境变量类型
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 环境变量验证
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// 导出环境变量
export const SUPABASE_URL = supabaseUrl
export const SUPABASE_ANON_KEY = supabaseAnonKey

// Supabase客户端配置选项
export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'telegram-lottery-auth',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'telegram-lottery-miniapp'
    }
  }
}

// 初始化 Supabase 客户端
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseConfig
)

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  LOTTERY_ROUNDS: 'lottery_rounds',
  PARTICIPATIONS: 'participations',
  TRANSACTIONS: 'transactions',
  ORDERS: 'orders',
  REFERRALS: 'referrals',
  POSTS: 'posts',
  POST_LIKES: 'post_likes',
  POST_COMMENTS: 'post_comments',
  RESALES: 'resales',
  RESALE_TRANSACTIONS: 'resale_transactions',
  SYSTEM_SETTINGS: 'system_settings',
  ADMINS: 'admins',
} as const

// 通用数据库操作函数
export const db = {
  // 用户相关操作
  users: {
    getByTelegramId: async (telegramId: number) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('telegram_id', telegramId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    create: async (user: {
      telegram_id: number
      username?: string
      full_name: string
      language: string
    }) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([user])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    update: async (id: string, updates: Partial<{
      username: string
      full_name: string
      language: string
    }>) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
  },

  // 彩票轮次相关操作
  lotteryRounds: {
    getActive: async () => {
      const { data, error } = await supabase
        .from(TABLES.LOTTERY_ROUNDS)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from(TABLES.LOTTERY_ROUNDS)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    create: async (lotteryRound: {
      product_id: string
      total_shares: number
      sold_shares: number
      price_per_share: number
      status: string
      draw_date?: string
    }) => {
      const { data, error } = await supabase
        .from(TABLES.LOTTERY_ROUNDS)
        .insert([lotteryRound])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    update: async (id: string, updates: Partial<{
      total_shares: number
      sold_shares: number
      price_per_share: number
      status: string
      draw_date: string
      winner_id: string
    }>) => {
      const { data, error } = await supabase
        .from(TABLES.LOTTERY_ROUNDS)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
  },

  // 产品相关操作
  products: {
    getActive: async () => {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    create: async (product: {
      name: Record<string, string>
      description: Record<string, string>
      price: number
      stock: number
      category: string
      image_url: string
      status: string
    }) => {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert([product])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
  },

  // 交易相关操作
  transactions: {
    create: async (transaction: {
      user_id: string
      type: string
      amount: number
      description: string
      reference_id?: string
    }) => {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert([transaction])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    getByUser: async (userId: string, limit = 10) => {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },
  },

  // 参与记录相关操作
  participations: {
    getByUserAndLottery: async (userId: string, lotteryRoundId: string) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('lottery_round_id', lotteryRoundId)
      
      if (error) throw error
      return data
    },

    create: async (participation: {
      user_id: string
      lottery_round_id: string
      shares_count: number
      amount_paid: number
    }) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .insert([participation])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    getLotteryStats: async (lotteryRoundId: string) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .select('shares_count')
        .eq('lottery_round_id', lotteryRoundId)
      
      if (error) throw error
      
      const totalTickets = data?.reduce((sum, p) => sum + p.shares_count, 0) || 0
      return totalTickets
    },
  },

}

// RLS 策略辅助函数 - 增强版
export const auth = {
  // 获取当前用户
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // Telegram身份验证登录
  signInWithTelegram: async (initData: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'telegram',
        token: initData,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Telegram登录失败:', error)
      throw error
    }
  },

  // 匿名登录（用于访客模式）
  signInAnonymously: async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data
    } catch (error) {
      console.error('匿名登录失败:', error)
      throw error
    }
  },

  // 退出登录
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  },

  // 获取会话信息
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('获取会话信息失败:', error)
      throw error
    }
  },

  // 监听认证状态变化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 数据库错误处理工具
export const handleDatabaseError = (error: any): string => {
  // Supabase错误码映射
  const errorMessages: Record<string, string> = {
    '23505': '该记录已存在',
    '23503': '外键约束错误',
    '23502': '必填字段不能为空',
    '23514': '数据验证失败',
    'PGRST116': '记录不存在',
    'PGRST301': '权限不足',
    '42501': '权限被拒绝',
    '42P01': '数据表不存在',
    '42703': '字段不存在',
    '22P02': '数据类型错误',
    '23501': '唯一约束冲突'
  }

  // 处理PostgreSQL错误
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code]
  }

  // 处理Supabase特定错误
  if (error.message) {
    if (error.message.includes('fetch')) {
      return '网络连接失败，请检查网络设置'
    }
    if (error.message.includes('timeout')) {
      return '请求超时，请稍后重试'
    }
    if (error.message.includes('Unauthorized')) {
      return '身份验证失败，请重新登录'
    }
    if (error.message.includes('Forbidden')) {
      return '权限不足，无法执行此操作'
    }
  }

  // 返回通用错误消息
  return error.message || '未知数据库错误'
}

// 智能重试机制
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // 如果是最后一次尝试或错误不可重试，则抛出错误
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error
      }

      // 计算延迟时间（指数退避）
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`操作失败，${delay}ms后重试 (${attempt + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// 检查错误是否可重试
function isRetryableError(error: any): boolean {
  const retryableErrorMessages = [
    'fetch',
    'timeout',
    'network',
    'connection',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND'
  ]

  return retryableErrorMessages.some(message => 
    error.message?.toLowerCase().includes(message.toLowerCase())
  )
}

// 事务包装器
export async function withTransaction<T>(
  operations: (supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  try {
    return await operations(supabase)
  } catch (error) {
    console.error('事务操作失败:', error)
    throw error
  }
}