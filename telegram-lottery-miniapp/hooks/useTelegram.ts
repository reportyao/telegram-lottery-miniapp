'use client'

import { useEffect, useState } from 'react'
import { useTelegram } from '@telegram-apps/sdk'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramContext {
  user: TelegramUser | null
  tg: any
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
}

export function useTelegram(): TelegramContext {
  const [context, setContext] = useState<TelegramContext>({
    user: null,
    tg: null,
    themeParams: {}
  })

  const { user, tg, themeParams } = useTelegram()

  useEffect(() => {
    setContext({
      user: user || null,
      tg: tg || null,
      themeParams: themeParams || {}
    })
  }, [user, tg, themeParams])

  return context
}