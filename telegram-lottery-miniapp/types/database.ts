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
  WITHDRAWAL: 'withdrawal' as const,
  RESALE_PURCHASE: 'resale_purchase' as const,
  RESALE_PURCHASE_FEE: 'resale_purchase_fee' as const,
  RESALE_SALE: 'resale_sale' as const,
  RESALE_SALE_FEE: 'resale_sale_fee' as const,
  RESALE_CANCELLATION: 'resale_cancellation' as const
} as const

// 转售相关接口定义
export interface Resale {
  id: string
  seller_id: string
  participation_id: string
  lottery_round_id: string
  shares_to_sell: number
  price_per_share: number
  total_amount: number
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  created_at: string
  updated_at: string
  completed_at: string | null
  
  // 关联数据
  seller?: User
  participation?: Participation
  lottery_round?: LotteryRound & {
    product?: Product
  }
}

export interface ResaleTransaction {
  id: string
  resale_id: string
  buyer_id: string
  seller_id: string
  participation_id: string
  shares_count: number
  price_per_share: number
  total_amount: number
  status: 'completed' | 'cancelled' | 'refunded'
  transaction_fee: number // 卖家手续费
  buyer_fee: number // 买家手续费
  created_at: string
  completed_at: string | null
  
  // 关联数据
  buyer?: User
  seller?: User
  resale?: Resale
}

export interface ShareLock {
  id: string
  resale_id: string
  shares_to_lock: number
  transaction_id: string | null
  locked_by: string | null
  locked_at: string
  expires_at: string
  status: 'locked' | 'released' | 'expired'
  released_at: string | null
}

export interface RefundRecord {
  id: string
  original_participation_id: string | null
  refunded_shares: number
  refund_amount: number
  refund_type: 'resale_cancellation' | 'lottery_cancellation' | 'system_refund'
  status: 'pending' | 'processed' | 'completed'
  created_at: string
  processed_at: string | null
}

export interface SystemTransaction {
  id: string
  amount: number
  type: 'resale_fee' | 'system_income' | 'refund_credit'
  description: string | null
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

// 扩展Participation接口以支持转售字段
export interface Participation {
  id: string
  user_id: string
  lottery_round_id: string
  shares_count: number
  amount_paid: number
  created_at: string
  // 新增转售相关字段
  is_resaleable?: boolean
  original_participation_id?: string | null
  resale_transaction_id?: string | null
  
  // 关联数据
  user?: User
  lottery_round?: LotteryRound & {
    product?: Product
  }
}

// 转售市场相关类型
export interface ResaleMarketItem {
  resale: Resale
  seller: User
  lottery_round: LotteryRound & {
    product: Product
  }
  time_remaining?: string // 剩余时间格式化字符串
  is_expired?: boolean
}

export interface CreateResaleRequest {
  participation_id: string
  shares_to_sell: number
  price_per_share: number
}

export interface PurchaseResaleRequest {
  resale_id: string
  shares_to_buy: number
  buyer_id: string
}

export interface CancelResaleRequest {
  resale_id: string
  seller_id: string
}

// API响应类型
export interface ResaleApiResponse<T = any> extends ApiResponse<T> {
  error?: {
    code: string
    message: string
    timestamp: string
  }
}

export interface PurchaseResaleResponse {
  success: boolean
  data?: {
    transaction_id: string
    new_participation_id: string
    remaining_shares: number
    total_cost: number
    buyer_fee: number
    seller_amount: number
    seller_fee: number
    resale_status: 'active' | 'sold'
  }
  error?: {
    code: string
    message: string
    timestamp: string
  }
}

export interface CancelResaleResponse {
  success: boolean
  data?: {
    cancelled_shares: number
    refundable_shares: number
    refund_amount: number
    status: 'fully_cancelled' | 'partially_cancelled'
  }
  error?: {
    code: string
    message: string
    timestamp: string
  }
}

// 转售状态常量
export const ResaleStatus = {
  ACTIVE: 'active' as const,
  SOLD: 'sold' as const,
  CANCELLED: 'cancelled' as const,
  EXPIRED: 'expired' as const
} as const

// 转售交易状态常量
export const ResaleTransactionStatus = {
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  REFUNDED: 'refunded' as const
} as const

// 返还记录状态常量
export const RefundRecordStatus = {
  PENDING: 'pending' as const,
  PROCESSED: 'processed' as const,
  COMPLETED: 'completed' as const
} as const

// 份额锁定状态常量
export const ShareLockStatus = {
  LOCKED: 'locked' as const,
  RELEASED: 'released' as const,
  EXPIRED: 'expired' as const
} as const

// 数据库表常量
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  LOTTERY_ROUNDS: 'lottery_rounds',
  PARTICIPATIONS: 'participations',
  ORDERS: 'orders',
  TRANSACTIONS: 'transactions',
  REFERRALS: 'referrals',
  POSTS: 'posts',
  POST_LIKES: 'post_likes',
  POST_COMMENTS: 'post_comments',
  SYSTEM_SETTINGS: 'system_settings',
  // 转售相关表
  RESALES: 'resales',
  RESALE_TRANSACTIONS: 'resale_transactions',
  SHARE_LOCKS: 'share_locks',
  REFUND_RECORDS: 'refund_records',
  SYSTEM_TRANSACTIONS: 'system_transactions'
} as const

// 转售业务常量
export const RESALE_CONSTANTS = {
  DEFAULT_SELLER_FEE_RATE: 0.02, // 2%
  DEFAULT_BUYER_FEE_RATE: 0.01,  // 1%
  SHARE_LOCK_TIMEOUT_MINUTES: 10,
  MAX_RESALE_PRICE_MULTIPLIER: 5.0 // 最大转售价格倍数为原价的5倍
} as const