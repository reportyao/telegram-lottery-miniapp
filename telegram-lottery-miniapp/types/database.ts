export interface User {
  id: string
  telegram_id: number
  username: string | null
  full_name: string | null
  balance: number
  language: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  price: number
  stock: number
  category: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
  active_rounds?: LotteryRound[]
}

export interface LotteryRound {
  id: string
  product_id: string
  total_shares: number
  sold_shares: number
  price_per_share: number
  status: 'active' | 'ready_to_draw' | 'completed' | 'cancelled'
  draw_date: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}

export interface Participation {
  id: string
  user_id: string
  lottery_round_id: string
  shares_count: number
  amount_paid: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  description: string
  reference_id: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: string
  created_at: string
}

export interface UserStats {
  total_participations: number
  total_wins: number
  total_spent: number
  total_referrals: number
  total_referral_rewards: number
}

// 增强的类型定义
export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: User
  is_liked?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// 分页类型
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// 表单验证类型
export interface FormError {
  field: string
  message: string
}

// 网络状态类型
export interface NetworkStatus {
  isOnline: boolean
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown'
  effectiveType?: string
  downlink?: number
  rtt?: number
}
