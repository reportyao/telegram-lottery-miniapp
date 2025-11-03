import { supabase, SUPABASE_URL } from './supabase'
import type { TelegramUser, TelegramThemeParams } from '@/types/telegram'

// 认证结果类型
export interface AuthResult {
  user: any
  session?: any
  error?: string
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