// Telegram WebApp相关类型定义

// Telegram用户类型
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

// Telegram主题参数
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

// Telegram WebApp上下文
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