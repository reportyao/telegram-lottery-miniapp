# Telegram Lottery MiniApp - Hooks 和 Lib 目录文件

本文档包含了 `/workspace/telegram-lottery-miniapp/hooks/` 和 `/workspace/telegram-lottery-miniapp/lib/` 目录下的所有文件内容。

## 目录结构

### hooks 目录
- `useTelegram.ts` - Telegram WebApp React Hook

### lib 目录  
- `performance.ts` - 性能优化和网络状态管理
- `supabase.ts` - Supabase 数据库配置和操作
- `telegram.ts` - Telegram WebApp 服务类
- `utils.ts` - 通用工具函数

---

## 文件内容

### hooks/useTelegram.ts

```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'

// Telegram用户类型定义
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

// Telegram主题参数类型
export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
}

// Telegram WebApp上下文类型
export interface TelegramContext {
  user: TelegramUser | null
  themeParams: TelegramThemeParams
  isExpanded: boolean
  initData: string
  initDataUnsafe: any
}

// Telegram WebApp全局类型声明
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
          auth_date?: number
          hash?: string
        }
        ready: () => void
        expand: () => void
        close: () => void
        showAlert: (message: string) => void
        showPopup: (params: {
          title?: string
          message: string
          buttons?: Array<{ type?: 'ok' | 'cancel' | 'default'; text: string; id?: string }>
        }) => void
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        themeParams: TelegramThemeParams
        colorScheme: 'light' | 'dark'
        isClosingConfirmationEnabled: boolean
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
      }
    }
  }
}

// 检查是否在Telegram WebApp环境中
function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.Telegram?.WebApp
}

/**
 * Telegram WebApp Hook
 * 提供对Telegram Mini App API的安全访问
 */
export function useTelegram(): TelegramContext {
  const [context, setContext] = useState<TelegramContext>(() => {
    if (!isTelegramWebApp()) {
      return {
        user: null,
        themeParams: {},
        isExpanded: false,
        initData: '',
        initDataUnsafe: null
      }
    }

    const webApp = window.Telegram.WebApp
    
    return {
      user: webApp.initDataUnsafe.user || null,
      themeParams: webApp.themeParams || {},
      isExpanded: webApp.isExpanded,
      initData: webApp.initData,
      initDataUnsafe: webApp.initDataUnsafe
    }
  })

  // 更新上下文数据
  const updateContext = useCallback(() => {
    if (!isTelegramWebApp()) return

    const webApp = window.Telegram.WebApp
    setContext({
      user: webApp.initDataUnsafe.user || null,
      themeParams: webApp.themeParams || {},
      isExpanded: webApp.isExpanded,
      initData: webApp.initData,
      initDataUnsafe: webApp.initDataUnsafe
    })
  }, [])

  useEffect(() => {
    // 初始化Telegram WebApp
    if (isTelegramWebApp()) {
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      
      // 监听主题变化
      const handleThemeChange = () => {
        updateContext()
      }

      // 监听扩展状态变化
      const handleViewportChanged = () => {
        updateContext()
      }

      // 添加事件监听
      document.addEventListener('themeChanged', handleThemeChange)
      window.addEventListener('resize', handleViewportChanged)

      // 清理函数
      return () => {
        document.removeEventListener('themeChanged', handleThemeChange)
        window.removeEventListener('resize', handleViewportChanged)
      }
    }
  }, [updateContext])

  // 提供便捷方法
  const closeApp = useCallback(() => {
    if (isTelegramWebApp()) {
      (window as any).Telegram.WebApp.close()
    }
  }, [])

  const showMainButton = useCallback((
    text: string,
    onClick: () => void,
    options?: {
      color?: string
      textColor?: string
      isVisible?: boolean
      isActive?: boolean
    }
  ) => {
    if (!isTelegramWebApp()) return

    const webApp = window.Telegram.WebApp
    if (webApp.MainButton) {
      webApp.MainButton.setText(text)
      if (options?.color) webApp.MainButton.color = options.color
      if (options?.textColor) webApp.MainButton.textColor = options.textColor
      webApp.MainButton.onClick(onClick)
      webApp.MainButton.show()
    }
  }, [])

  const hideMainButton = useCallback(() => {
    if (isTelegramWebApp()) {
      (window as any).Telegram.WebApp.MainButton.hide()
    }
  }, [])

  const hapticFeedback = useCallback((
    type: 'impact' | 'notification' | 'selection',
    style?: string
  ) => {
    if (!isTelegramWebApp()) return

    const webApp = window.Telegram.WebApp
    if (webApp.HapticFeedback) {
      switch (type) {
        case 'impact':
          webApp.HapticFeedback.impactOccurred(
            (style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'light'
          )
          break
        case 'notification':
          webApp.HapticFeedback.notificationOccurred(
            (style as 'error' | 'success' | 'warning') || 'success'
          )
          break
        case 'selection':
          webApp.HapticFeedback.selectionChanged()
          break
      }
    }
  }, [])

  // 返回上下文和方法
  return {
    ...context,
    closeApp,
    showMainButton,
    hideMainButton,
    hapticFeedback,
    isTelegramAvailable: isTelegramWebApp()
  }
}
```

---

### lib/performance.ts

```typescript
// 性能优化和弱网环境配置

import { useState, useEffect } from 'react'

// 网络状态类型
export interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

// 简化的网络状态检测函数 (用于非React环境)
export function getNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined') {
    return { 
      isOnline: true, 
      connectionType: 'unknown',
      downlink: undefined,
      rtt: undefined,
      saveData: false
    }
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    isOnline: navigator.onLine,
    connectionType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData
  }
}

// React Hook (仅在客户端组件中使用)
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    // 服务器端渲染时的默认值
    if (typeof window === 'undefined') {
      return { 
        isOnline: true, 
        connectionType: 'unknown',
        downlink: undefined,
        rtt: undefined,
        saveData: false
      }
    }
    return getNetworkStatus()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }))
    }

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      if (connection) {
        setStatus(prev => ({
          ...prev,
          connectionType: connection.effectiveType || 'unknown',
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }))
      }
    }

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // 监听连接信息变化（如果支持）
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo)
    }

    // 初始化状态
    updateOnlineStatus()
    updateConnectionInfo()

    // 清理函数
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  return status
}

// 智能重试机制
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        break
      }

      // 指数退避
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// 图片优化配置
export const imageConfig = {
  formats: ['image/webp', 'image/avif'] as const,
  quality: 75,
  placeholder: 'blur',
  priority: false,
}

// API 请求超时配置
export const requestConfig = {
  timeout: 10000, // 10秒
  retries: 3,
  retryDelay: 1000,
}

// 缓存配置
export const cacheConfig = {
  // 产品数据缓存5分钟
  productsTTL: 5 * 60 * 1000,
  // 用户数据缓存1分钟
  userDataTTL: 1 * 60 * 1000,
}

// 弱网优化配置
export const weakNetworkConfig = {
  // 慢连接阈值 (网络类型)
  slowConnections: ['slow-2g', '2g'],
  // 低质量图片阈值
  lowQualityThreshold: 50, // KB
  // 预加载延迟
  preloadDelay: 2000,
  // 懒加载阈值
  lazyLoadThreshold: 100, // viewport百分比
}

// 性能监控
export function trackPerformance() {
  if (typeof window === 'undefined') return

  // 页面加载时间
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    console.log('Page Load Performance:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart,
    })
  })

  // 首次内容绘制
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      console.log('First Contentful Paint:', entry.startTime)
    })
  }).observe({ entryTypes: ['paint'] })

  // 长期任务监控
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.duration > 50) {
        console.warn('Long Task Detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
        })
      }
    })
  }).observe({ entryTypes: ['longtask'] })
}

// 资源预加载
export function preloadResource(url: string, type: 'script' | 'style' | 'image' = 'image') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  if (type === 'image') {
    link.as = 'image'
  } else if (type === 'script') {
    link.as = 'script'
  } else if (type === 'style') {
    link.as = 'style'
  }
  document.head.appendChild(link)
}

// 智能图片加载
export function shouldLoadHighQualityImage(connectionType: string): boolean {
  return !weakNetworkConfig.slowConnections.includes(connectionType)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
```

---

### lib/supabase.ts

```typescript
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
    getByUserAndLottery: async (userId: string, lotteryId: string) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('lottery_id', lotteryId)
      
      if (error) throw error
      return data
    },

    create: async (participation: {
      user_id: string
      lottery_id: string
      ticket_count: number
      total_amount: number
    }) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .insert([participation])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    getLotteryStats: async (lotteryId: string) => {
      const { data, error } = await supabase
        .from(TABLES.PARTICIPATIONS)
        .select('ticket_count')
        .eq('lottery_id', lotteryId)
      
      if (error) throw error
      
      const totalTickets = data?.reduce((sum, p) => sum + p.ticket_count, 0) || 0
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
```

---

### lib/telegram.ts

```typescript
import { supabase, SUPABASE_URL } from './supabase'

// Telegram用户类型定义
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

// Telegram主题参数类型
export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
}

// 认证结果类型
export interface AuthResult {
  user: any
  session?: any
  error?: string
}

// 全局Telegram WebApp类型声明
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
          auth_date?: number
          hash?: string
        }
        ready: () => void
        expand: () => void
        close: () => void
        showAlert: (message: string) => void
        showPopup: (params: {
          title?: string
          message: string
          buttons?: Array<{ type?: 'ok' | 'cancel' | 'default'; text: string; id?: string }>
        }) => void
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        themeParams: TelegramThemeParams
        colorScheme: 'light' | 'dark'
        isClosingConfirmationEnabled: boolean
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: string | null) => void) => void
          getItem: (key: string, callback: (error: string | null, result?: string) => void) => void
          getItems: (keys: string[], callback: (error: string | null, result?: { [key: string]: string }) => void) => void
          removeItem: (key: string, callback?: (error: string | null) => void) => void
          removeItems: (keys: string[], callback?: (error: string | null) => void) => void
          getKeys: (callback: (error: string | null, result?: string[]) => void) => void
        }
      }
    }
  }
}

/**
 * Telegram WebApp服务类
 * 提供对Telegram Mini App API的安全访问和管理
 */
export class TelegramService {
  private webApp: typeof window.Telegram.WebApp | null = null
  private initialized = false

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    if (typeof window === 'undefined') return

    try {
      if (window.Telegram?.WebApp) {
        this.webApp = window.Telegram.WebApp
        
        // 初始化WebApp
        this.webApp.ready()
        this.webApp.expand()
        
        this.initialized = true
        
        console.log('Telegram WebApp initialized successfully')
      }
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error)
    }
  }

  /**
   * 检查Telegram WebApp是否可用
   */
  isAvailable(): boolean {
    return this.initialized && this.webApp !== null
  }

  /**
   * 获取当前用户信息
   */
  getUser(): TelegramUser | null {
    if (!this.isAvailable()) return null
    return this.webApp!.initDataUnsafe.user || null
  }

  /**
   * 获取用户语言代码
   */
  getLanguage(): string {
    const user = this.getUser()
    const langCode = user?.language_code || 'en'
    
    // 支持的语言映射
    const langMap: Record<string, string> = {
      'zh': 'zh',
      'zh-cn': 'zh',
      'zh-tw': 'zh',
      'en': 'en',
      'ru': 'ru',
      'tg': 'tg',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ja': 'ja',
      'ko': 'ko',
      'tr': 'tr',
      'ar': 'ar',
      'hi': 'hi',
      'id': 'id',
      'ms': 'ms',
      'th': 'th',
      'vi': 'vi',
      'bn': 'bn',
      'ta': 'ta',
      'te': 'te',
      'ml': 'ml',
      'kn': 'kn',
      'gu': 'gu',
      'pa': 'pa',
      'ur': 'ur',
      'fa': 'fa',
      'he': 'he',
      'am': 'am',
      'my': 'my',
      'km': 'km',
      'lo': 'lo',
      'si': 'si',
      'ne': 'ne',
      'ur': 'ur',
    }
    
    return langMap[langCode] || langMap[langCode.split('-')[0]] || 'en'
  }

  /**
   * 用户认证 - 重试机制增强版
   */
  async authenticateUser(retryCount = 3, retryDelay = 1000): Promise<AuthResult> {
    const user = this.getUser()
    
    if (!user) {
      throw new Error('No Telegram user data available')
    }

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    const userData = {
      telegram_id: user.id,
      username: user.username || null,
      full_name: fullName || null,
      language: this.getLanguage(),
      photo_url: user.photo_url || null,
      is_premium: user.is_premium || false
    }

    // 指数退避重试机制
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        // 检查网络状态
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
          throw new Error('网络连接不可用，请检查您的网络设置')
        }

        // 调用认证边缘函数
        const { data, error } = await supabase.functions.invoke('telegram-auth', {
          body: userData,
        })

        if (error) {
          // 如果是最后一次尝试，直接抛出错误
          if (attempt === retryCount - 1) {
            throw new Error(`认证失败: ${error.message}`)
          }

          // 网络相关错误进行重试
          const isNetworkError = 
            error.message?.includes('network') || 
            error.message?.includes('timeout') ||
            error.message?.includes('fetch') ||
            error.message?.includes('connection')
          
          if (isNetworkError) {
            const delay = retryDelay * Math.pow(2, attempt) // 指数退避
            console.log(`网络错误，${delay}ms后重试 (${attempt + 1}/${retryCount})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
          
          // 其他错误直接抛出
          throw new Error(`认证错误: ${error.message}`)
        }

        // 认证成功
        const result = data?.data || data
        console.log('Telegram用户认证成功:', { user: result?.user?.id || user.id })
        
        return {
          user: result?.user || result,
          session: result?.session
        }
      } catch (error) {
        console.error(`认证错误 (尝试 ${attempt + 1}/${retryCount}):`, error)
        
        // 如果是最后一次尝试
        if (attempt === retryCount - 1) {
          return {
            user: null,
            error: error instanceof Error ? error.message : '未知错误'
          }
        }
        
        // 等待重试
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('认证失败，已达到最大重试次数')
  }

  /**
   * 显示主按钮
   */
  showMainButton(
    text: string, 
    onClick: () => void, 
    options: {
      color?: string
      textColor?: string
      isVisible?: boolean
      isActive?: boolean
    } = {}
  ): void {
    if (!this.isAvailable() || !this.webApp?.MainButton) return

    try {
      const mainButton = this.webApp.MainButton
      
      mainButton.setText(text)
      if (options.color) mainButton.color = options.color
      if (options.textColor) mainButton.textColor = options.textColor
      if (options.isActive !== undefined) {
        if (options.isActive) {
          mainButton.enable()
        } else {
          mainButton.disable()
        }
      }
      
      mainButton.onClick(onClick)
      mainButton.show()
    } catch (error) {
      console.error('Failed to show main button:', error)
    }
  }

  /**
   * 隐藏主按钮
   */
  hideMainButton(): void {
    if (!this.isAvailable() || !this.webApp?.MainButton) return

    try {
      this.webApp.MainButton.hide()
    } catch (error) {
      console.error('Failed to hide main button:', error)
    }
  }

  /**
   * 显示返回按钮
   */
  showBackButton(onClick: () => void): void {
    if (!this.isAvailable() || !this.webApp?.BackButton) return

    try {
      this.webApp.BackButton.onClick(onClick)
      this.webApp.BackButton.show()
    } catch (error) {
      console.error('Failed to show back button:', error)
    }
  }

  /**
   * 隐藏返回按钮
   */
  hideBackButton(): void {
    if (!this.isAvailable() || !this.webApp?.BackButton) return

    try {
      this.webApp.BackButton.hide()
    } catch (error) {
      console.error('Failed to hide back button:', error)
    }
  }

  /**
   * 关闭应用
   */
  close(): void {
    if (!this.isAvailable()) return

    try {
      this.webApp!.close()
    } catch (error) {
      console.error('Failed to close app:', error)
    }
  }

  /**
   * 获取主题参数
   */
  getThemeParams(): TelegramThemeParams {
    if (!this.isAvailable()) return {}
    return this.webApp!.themeParams || {}
  }

  /**
   * 获取颜色方案
   */
  getColorScheme(): 'light' | 'dark' {
    if (!this.isAvailable()) return 'light'
    return this.webApp!.colorScheme || 'light'
  }

  /**
   * 设置标题颜色
   */
  setHeaderColor(color: string): void {
    if (!this.isAvailable()) return

    try {
      this.webApp!.setHeaderColor(color)
    } catch (error) {
      console.error('Failed to set header color:', error)
    }
  }

  /**
   * 设置背景颜色
   */
  setBackgroundColor(color: string): void {
    if (!this.isAvailable()) return

    try {
      this.webApp!.setBackgroundColor(color)
    } catch (error) {
      console.error('Failed to set background color:', error)
    }
  }

  /**
   * 触觉反馈
   */
  hapticFeedback(
    type: 'impact' | 'notification' | 'selection',
    style?: string
  ): void {
    if (!this.isAvailable() || !this.webApp?.HapticFeedback) return

    try {
      switch (type) {
        case 'impact':
          this.webApp.HapticFeedback.impactOccurred(
            (style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'light'
          )
          break
        case 'notification':
          this.webApp.HapticFeedback.notificationOccurred(
            (style as 'error' | 'success' | 'warning') || 'success'
          )
          break
        case 'selection':
          this.webApp.HapticFeedback.selectionChanged()
          break
      }
    } catch (error) {
      console.error('Failed to provide haptic feedback:', error)
    }
  }

  /**
   * 启用关闭确认
   */
  enableClosingConfirmation(): void {
    if (!this.isAvailable()) return

    try {
      this.webApp!.enableClosingConfirmation()
    } catch (error) {
      console.error('Failed to enable closing confirmation:', error)
    }
  }

  /**
   * 禁用关闭确认
   */
  disableClosingConfirmation(): void {
    if (!this.isAvailable()) return

    try {
      this.webApp!.disableClosingConfirmation()
    } catch (error) {
      console.error('Failed to disable closing confirmation:', error)
    }
  }

  /**
   * 获取视图端口高度
   */
  getViewportHeight(): number {
    if (!this.isAvailable()) return 0
    return this.webApp!.viewportHeight || 0
  }

  /**
   * 获取稳定视图端口高度
   */
  getStableViewportHeight(): number {
    if (!this.isAvailable()) return 0
    return this.webApp!.viewportStableHeight || 0
  }

  /**
   * 检查是否已展开
   */
  isExpanded(): boolean {
    if (!this.isAvailable()) return false
    return this.webApp!.isExpanded || false
  }
}

// 创建全局实例
export const telegram = new TelegramService()
```

---

### lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSS 类名合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 货币格式化
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyMap: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CNY': '¥',
    'RUB': '₽',
    'USDT': '₮',
    'TON': '🔷',
    'BTC': '₿',
    'ETH': '♦'
  }
  
  const symbol = currencyMap[currency] || '$'
  return `${symbol}${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 8 
  })}`
}

// 数字缩写格式化
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// 延迟函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 安全的ID生成器
export function generateId(): string {
  // 使用更安全的方法生成ID
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint8Array(8)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // 降级方案
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// 类型守卫函数
export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value)
}

// 安全的JSON解析
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

// 字符串截断
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

// 首字母大写
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// 驼峰命名转换
export function toCamelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
}

// 下划线命名转换
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// URL参数解析
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const urlObj = new URL(url)
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

// 本地存储工具
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : (defaultValue || null)
    } catch {
      return defaultValue || null
    }
  },
  
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  
  remove(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
  
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

// 内存缓存工具
class MemoryCache {
  private cache = new Map<string, { value: any; expire: number }>()
  
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      expire: Date.now() + ttl
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expire) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expire) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()

// 移除重复的debounce函数，移至performance.ts
```

---

## 文件概览

这个项目包含以下主要功能模块：

1. **Telegram 集成** (`useTelegram.ts`, `telegram.ts`)
   - 提供 Telegram WebApp API 的 React Hook
   - 包含完整的 Telegram 用户认证流程
   - 支持触觉反馈、主题切换等 UI 交互功能

2. **数据库操作** (`supabase.ts`)
   - Supabase 客户端配置
   - 完整的数据库表操作封装
   - 用户认证和会话管理
   - 错误处理和重试机制

3. **性能优化** (`performance.ts`)
   - 网络状态监控
   - 智能重试和错误处理
   - 性能指标追踪
   - 资源预加载和缓存策略

4. **工具函数** (`utils.ts`)
   - 通用工具函数集合
   - 货币格式化、本地存储等功能
   - 类型守卫和安全操作函数

所有文件都体现了良好的 TypeScript 类型安全设计，提供了完整的错误处理机制，并针对 Telegram Mini App 环境进行了优化。
