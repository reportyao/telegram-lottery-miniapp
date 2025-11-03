'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TelegramUser, TelegramThemeParams, TelegramContext } from '@/types/telegram'

// 检查是否在Telegram WebApp环境中
function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.Telegram?.WebApp
}

/**
 * Telegram WebApp Hook
 * 提供对Telegram Mini App API的安全访问
 */
export function useTelegram(): TelegramContext & {
  closeApp: () => void
  showMainButton: (
    text: string,
    onClick: () => void,
    options?: {
      color?: string
      textColor?: string
      isVisible?: boolean
      isActive?: boolean
    }
  ) => void
  hideMainButton: () => void
  hapticFeedback: (type: 'impact' | 'notification' | 'selection', style?: string) => void
  isTelegramAvailable: boolean
} {
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
      window.Telegram?.WebApp?.close()
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
    if (!isTelegramWebApp() || !window.Telegram?.WebApp?.MainButton) return

    const webApp = window.Telegram.WebApp
    try {
      webApp.MainButton.setText(text)
      if (options?.color) webApp.MainButton.color = options.color
      if (options?.textColor) webApp.MainButton.textColor = options.textColor
      if (options?.isActive !== undefined) {
        if (options.isActive) {
          webApp.MainButton.enable()
        } else {
          webApp.MainButton.disable()
        }
      }
      webApp.MainButton.onClick(onClick)
      webApp.MainButton.show()
    } catch (error) {
      console.error('Failed to show main button:', error)
    }
  }, [])

  const hideMainButton = useCallback(() => {
    if (isTelegramWebApp()) {
      window.Telegram?.WebApp?.MainButton?.hide()
    }
  }, [])

  const hapticFeedback = useCallback((
    type: 'impact' | 'notification' | 'selection',
    style?: string
  ) => {
    if (!isTelegramWebApp() || !window.Telegram?.WebApp?.HapticFeedback) return

    try {
      switch (type) {
        case 'impact':
          window.Telegram.WebApp.HapticFeedback.impactOccurred(
            (style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'light'
          )
          break
        case 'notification':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(
            (style as 'error' | 'success' | 'warning') || 'success'
          )
          break
        case 'selection':
          window.Telegram.WebApp.HapticFeedback.selectionChanged()
          break
      }
    } catch (error) {
      console.error('Failed to provide haptic feedback:', error)
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