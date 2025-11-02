// 数据库类型定义 - 修复版本
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
  status: 'active' | 'inactive' | 'out_of_stock'
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
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  payment_method: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'topup' | 'purchase' | 'refund' | 'referral' | 'prize' | 'withdrawal'
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
  status: 'pending' | 'completed' | 'cancelled'
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

// 支持的语言类型
export type SupportedLanguage = 'en' | 'zh' | 'ru' | 'tg'

// 时间类型别名（可选）
export type DateString = string

// 抽奖状态常量
export const LotteryStatus = {
  ACTIVE: 'active' as const,
  READY_TO_DRAW: 'ready_to_draw' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const
} as const

// 产品状态常量
export const ProductStatus = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  OUT_OF_STOCK: 'out_of_stock' as const
} as const

// 订单状态常量
export const OrderStatus = {
  PENDING: 'pending' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  REFUNDED: 'refunded' as const
} as const

// 交易类型常量
export const TransactionType = {
  TOPUP: 'topup' as const,
  PURCHASE: 'purchase' as const,
  REFUND: 'refund' as const,
  REFERRAL: 'referral' as const,
  PRIZE: 'prize' as const,
  WITHDRAWAL: 'withdrawal' as const
} as const