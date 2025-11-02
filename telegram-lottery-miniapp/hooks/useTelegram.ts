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
      window.Telegram.WebApp.close()
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
      window.Telegram.WebApp.MainButton.hide()
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