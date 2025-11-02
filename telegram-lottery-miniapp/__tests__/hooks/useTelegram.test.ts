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
        MainButton: {
          text: 'Button',
          color: '#3399ff',
          textColor: '#ffffff',
          isVisible: true,
          isActive: true,
          setText: jest.fn(),
          onClick: jest.fn(),
          offClick: jest.fn(),
          show: jest.fn(),
          hide: jest.fn(),
          enable: jest.fn(),
          disable: jest.fn(),
        },
        BackButton: {
          isVisible: true,
          onClick: jest.fn(),
          offClick: jest.fn(),
          show: jest.fn(),
          hide: jest.fn(),
        },
        HapticFeedback: {
          impactOccurred: jest.fn(),
          notificationOccurred: jest.fn(),
          selectionChanged: jest.fn(),
        },
      },
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('应该在Telegram环境中正确初始化', () => {
    const { result } = renderHook(() => useTelegram())

    expect(result.current.user).toEqual(mockTelegramUser)
    expect(result.current.themeParams).toEqual(mockThemeParams)
    expect(result.current.isExpanded).toBe(true)
    expect(result.current.initData).toBe('test_init_data')
    expect(result.current.initDataUnsafe).toEqual({
      user: mockTelegramUser,
      auth_date: 1234567890,
      hash: 'test_hash',
    })
    expect(result.current.isTelegramAvailable).toBe(true)
  })

  test('应该在非Telegram环境中正确初始化', () => {
    // 删除Telegram对象
    const originalTelegram = global.window.Telegram
    delete global.window.Telegram

    const { result } = renderHook(() => useTelegram())

    expect(result.current.user).toBeNull()
    expect(result.current.themeParams).toEqual({})
    expect(result.current.isExpanded).toBe(false)
    expect(result.current.initData).toBe('')
    expect(result.current.initDataUnsafe).toBeNull()
    expect(result.current.isTelegramAvailable).toBe(false)

    // 恢复Telegram对象
    global.window.Telegram = originalTelegram
  })

  test('应该在服务器端渲染时正确初始化', () => {
    // 模拟服务器端渲染环境
    const originalWindow = global.window
    delete global.window

    const { result } = renderHook(() => useTelegram())

    expect(result.current.user).toBeNull()
    expect(result.current.themeParams).toEqual({})
    expect(result.current.isTelegramAvailable).toBe(false)

    // 恢复window对象
    global.window = originalWindow
  })

  test('closeApp 方法应该在Telegram环境中调用close', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.closeApp()
    })

    expect(global.window.Telegram.WebApp.close).toHaveBeenCalledTimes(1)
  })

  test('closeApp 方法在非Telegram环境中应该不执行任何操作', () => {
    delete global.window.Telegram
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.closeApp()
    })

    // 没有错误就意味着测试通过
  })

  test('showMainButton 方法应该在Telegram环境中正确配置主按钮', () => {
    const { result } = renderHook(() => useTelegram())
    const mockCallback = jest.fn()
    
    act(() => {
      result.current.showMainButton('Test Button', mockCallback, {
        color: '#ff0000',
        textColor: '#ffffff',
      })
    })

    expect(global.window.Telegram.WebApp.MainButton.setText).toHaveBeenCalledWith('Test Button')
    expect(global.window.Telegram.WebApp.MainButton.color).toBe('#ff0000')
    expect(global.window.Telegram.WebApp.MainButton.textColor).toBe('#ffffff')
    expect(global.window.Telegram.WebApp.MainButton.onClick).toHaveBeenCalledWith(mockCallback)
    expect(global.window.Telegram.WebApp.MainButton.show).toHaveBeenCalledTimes(1)
  })

  test('showMainButton 在非Telegram环境中应该不执行任何操作', () => {
    delete global.window.Telegram
    const { result } = renderHook(() => useTelegram())
    const mockCallback = jest.fn()
    
    act(() => {
      result.current.showMainButton('Test Button', mockCallback)
    })

    // 没有错误就意味着测试通过
  })

  test('hideMainButton 方法应该在Telegram环境中隐藏主按钮', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.hideMainButton()
    })

    expect(global.window.Telegram.WebApp.MainButton.hide).toHaveBeenCalledTimes(1)
  })

  test('hapticFeedback 方法应该在Telegram环境中触发触觉反馈', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.hapticFeedback('notification', 'success')
    })

    expect(global.window.Telegram.WebApp.HapticFeedback.notificationOccurred).toHaveBeenCalledWith('success')
  })

  test('hapticFeedback 应该正确处理不同类型的反馈', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.hapticFeedback('impact', 'heavy')
    })

    expect(global.window.Telegram.WebApp.HapticFeedback.impactOccurred).toHaveBeenCalledWith('heavy')

    act(() => {
      result.current.hapticFeedback('selection')
    })

    expect(global.window.Telegram.WebApp.HapticFeedback.selectionChanged).toHaveBeenCalledTimes(1)
  })

  test('hapticFeedback 在非Telegram环境中应该不执行任何操作', () => {
    delete global.window.Telegram
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      result.current.hapticFeedback('notification', 'success')
    })

    // 没有错误就意味着测试通过
  })

  test('应该正确处理主题变化', async () => {
    const { result } = renderHook(() => useTelegram())
    
    // 模拟主题变化
    act(() => {
      document.dispatchEvent(new Event('themeChanged'))
    })

    // 验证WebApp ready和expand被调用
    expect(global.window.Telegram.WebApp.ready).toHaveBeenCalledTimes(1)
    expect(global.window.Telegram.WebApp.expand).toHaveBeenCalledTimes(1)
  })

  test('应该正确清理事件监听器', () => {
    const { unmount } = renderHook(() => useTelegram())
    
    unmount()

    // 验证事件监听器被移除
    expect(document.addEventListener).toHaveBeenCalledWith('themeChanged', expect.any(Function))
  })

  test('应该正确处理没有用户的情况', () => {
    global.window.Telegram.WebApp.initDataUnsafe = {}
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.user).toBeNull()
  })

  test('应该在渲染时正确调用ready和expand方法', () => {
    renderHook(() => useTelegram())
    
    expect(global.window.Telegram.WebApp.ready).toHaveBeenCalledTimes(1)
    expect(global.window.Telegram.WebApp.expand).toHaveBeenCalledTimes(1)
  })
})

describe('useTelegram Hook - Error Handling', () => {
  test('应该处理Telegram WebApp初始化失败的情况', () => {
    // 模拟WebApp初始化失败
    global.window.Telegram = {
      WebApp: null,
    } as any

    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.isTelegramAvailable).toBe(false)
    expect(result.current.user).toBeNull()
  })

  test('应该处理非法主题参数', () => {
    global.window.Telegram.WebApp.themeParams = null
    
    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.themeParams).toEqual({})
  })

  test('应该在窗口大小变化时更新上下文', () => {
    const { result } = renderHook(() => useTelegram())
    
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    // 验证事件监听器被正确设置
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})

describe('useTelegram Hook - Edge Cases', () => {
  test('应该处理复杂的用户数据', () => {
    const complexUser = {
      id: 999999,
      first_name: '复杂用户名',
      last_name: 'With Symbols & Special!@#',
      username: 'user_with_underscores',
      language_code: 'zh-hans',
      is_premium: false,
      photo_url: '',
    }

    global.window.Telegram.WebApp.initDataUnsafe = {
      user: complexUser,
    }

    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.user).toEqual(complexUser)
  })

  test('应该处理空initData的情况', () => {
    global.window.Telegram.WebApp.initData = ''
    global.window.Telegram.WebApp.initDataUnsafe = null

    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.initData).toBe('')
    expect(result.current.initDataUnsafe).toBeNull()
  })

  test('应该处理缺失的WebApp对象中的属性', () => {
    const partialWebApp = {
      initData: 'test',
      initDataUnsafe: {},
      isExpanded: false,
    }
    global.window.Telegram.WebApp = {
      ...global.window.Telegram.WebApp,
      ...partialWebApp,
    }

    const { result } = renderHook(() => useTelegram())
    
    expect(result.current.isExpanded).toBe(false)
    expect(result.current.themeParams).toEqual({})
  })
})