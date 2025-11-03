import { renderHook, act } from '@testing-library/react'
import { useTelegram } from '@/hooks/useTelegram'

// 测试数据
const mockTelegramUser = {
  id: 123456,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en',
  is_premium: true,
  photo_url: 'https://example.com/photo.jpg',
}

const mockThemeParams = {
  bg_color: '#ffffff',
  text_color: '#000000',
  hint_color: '#666666',
  link_color: '#3399ff',
  button_color: '#3399ff',
  button_text_color: '#ffffff',
  secondary_bg_color: '#f8f9fa',
  header_bg_color: '#ffffff',
  accent_text_color: '#000000',
}

describe('useTelegram Hook', () => {
  beforeEach(() => {
    // 重置模拟
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {
          user: mockTelegramUser,
          auth_date: 1234567890,
          hash: 'test_hash',
        },
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        themeParams: mockThemeParams,
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
        setHeaderColor: jest.fn(),
        setBackgroundColor: jest.fn(),
        enableClosingConfirmation: jest.fn(),
        disableClosingConfirmation: jest.fn(),
      },
    }
  })

  test('should initialize Telegram WebApp', () => {
    renderHook(() => useTelegram())
    
    expect(global.window.Telegram.WebApp.ready).toHaveBeenCalled()
    expect(global.window.Telegram.WebApp.expand).toHaveBeenCalled()
  })

  test('should return user data correctly', () => {
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.user).toEqual(mockTelegramUser)
    expect(result.current.isInTelegram).toBe(true)
  })

  test('should return theme parameters', () => {
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.themeParams).toEqual(mockThemeParams)
    expect(result.current.colorScheme).toBe('light')
  })

  test('should handle main button clicks', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.MainButton.show()
    })
    
    expect(global.window.Telegram.WebApp.MainButton.show).toHaveBeenCalled()
    
    act(() => {
      result.current.MainButton.hide()
    })
    
    expect(global.window.Telegram.WebApp.MainButton.hide).toHaveBeenCalled()
  })

  test('should handle back button', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.BackButton.show()
    })
    
    expect(global.window.Telegram.WebApp.BackButton.show).toHaveBeenCalled()
    
    act(() => {
      result.current.BackButton.hide()
    })
    
    expect(global.window.Telegram.WebApp.BackButton.hide).toHaveBeenCalled()
  })

  test('should handle haptic feedback', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.HapticFeedback.notificationOccurred('success')
    })
    
    expect(global.window.Telegram.WebApp.HapticFeedback.notificationOccurred).toHaveBeenCalledWith('success')
  })

  test('should close application', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.close()
    })
    
    expect(global.window.Telegram.WebApp.close).toHaveBeenCalled()
  })

  test('should handle non-Telegram environment gracefully', () => {
    // 清除Telegram模拟
    delete global.window.Telegram
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.isInTelegram).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.themeParams).toEqual({})
  })

  test('should handle user without Telegram WebApp', () => {
    global.window.Telegram = undefined
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.isInTelegram).toBe(false)
    expect(result.current.user).toBeNull()
  })

  test('should handle missing user data', () => {
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {}, // 没有用户数据
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        themeParams: mockThemeParams,
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
      },
    }
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isInTelegram).toBe(true)
  })

  test('should handle missing theme params', () => {
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {
          user: mockTelegramUser,
        },
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        // 缺少themeParams
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
      },
    }
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.themeParams).toEqual({})
  })

  test('should handle viewport dimensions', () => {
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {
          user: mockTelegramUser,
        },
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 750,
        themeParams: mockThemeParams,
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
      },
    }
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.viewportHeight).toBe(800)
    expect(result.current.viewportStableHeight).toBe(750)
  })

  test('should handle haptic feedback types', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.HapticFeedback.impactOccurred('light')
    })
    
    expect(global.window.Telegram.WebApp.HapticFeedback.impactOccurred).toHaveBeenCalledWith('light')
    
    act(() => {
      result.current.HapticFeedback.selectionChanged()
    })
    
    expect(global.window.Telegram.WebApp.HapticFeedback.selectionChanged).toHaveBeenCalled()
  })

  test('should handle theme color changes', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.setHeaderColor('#ff0000')
    })
    
    expect(global.window.Telegram.WebApp.setHeaderColor).toHaveBeenCalledWith('#ff0000')
    
    act(() => {
      result.current.setBackgroundColor('#00ff00')
    })
    
    expect(global.window.Telegram.WebApp.setBackgroundColor).toHaveBeenCalledWith('#00ff00')
  })

  test('should handle closing confirmation', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.enableClosingConfirmation()
    })
    
    expect(global.window.Telegram.WebApp.enableClosingConfirmation).toHaveBeenCalled()
    
    act(() => {
      result.current.disableClosingConfirmation()
    })
    
    expect(global.window.Telegram.WebApp.disableClosingConfirmation).toHaveBeenCalled()
  })

  test('should handle different color schemes', () => {
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {
          user: mockTelegramUser,
        },
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        themeParams: mockThemeParams,
        colorScheme: 'dark',
        isClosingConfirmationEnabled: false,
      },
    }
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.colorScheme).toBe('dark')
  })

  test('should handle multiple hook calls', () => {
    const { result, rerender } = renderHook(() => useTelegram())
    
    const firstUser = result.current.user
    
    // 重新渲染
    rerender()
    
    expect(result.current.user).toEqual(firstUser)
  })
})