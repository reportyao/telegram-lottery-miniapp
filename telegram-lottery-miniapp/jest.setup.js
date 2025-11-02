import '@testing-library/jest-dom'

// 模拟全局环境变量
global.process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}

// 模拟window对象
global.window = {
  ...global.window,
  Telegram: {
    WebApp: {
      initData: 'test_init_data',
      initDataUnsafe: {
        user: {
          id: 123456,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en',
          is_premium: true,
          photo_url: 'https://example.com/photo.jpg',
        },
        auth_date: 1234567890,
        hash: 'test_hash',
      },
      ready: jest.fn(),
      expand: jest.fn(),
      close: jest.fn(),
      isExpanded: true,
      viewportHeight: 800,
      viewportStableHeight: 800,
      themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#666666',
        link_color: '#3399ff',
        button_color: '#3399ff',
        button_text_color: '#ffffff',
        secondary_bg_color: '#f8f9fa',
        header_bg_color: '#ffffff',
        accent_text_color: '#000000',
      },
      colorScheme: 'light' as const,
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
  },
}

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// 模拟Supabase客户端
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithIdToken: jest.fn(),
      signInAnonymously: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
  handleDatabaseError: jest.fn(),
  withRetry: jest.fn(),
  withTransaction: jest.fn(),
}))

// 模拟本地存储
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// 模拟crypto
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }),
}

// 模拟performance.now
global.performance = {
  now: jest.fn(() => Date.now()),
}

// 清除所有mock
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})

// 扩展匹配器
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})