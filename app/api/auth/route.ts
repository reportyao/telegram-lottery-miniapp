import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { telegramUserData } = await request.json()

    if (!telegramUserData) {
      return NextResponse.json({ error: 'No telegram user data provided' }, { status: 400 })
    }

    const { id, first_name, last_name, username } = telegramUserData

    if (!id) {
      return NextResponse.json({ error: 'Invalid Telegram user data' }, { status: 400 })
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', id)
      .single()

    if (!existingUser) {
      // 创建新用户
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: id,
          username: username || null,
          full_name: [first_name, last_name].filter(Boolean).join(' ') || null,
          balance: 0,
          language: 'en' // 默认语言
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      return NextResponse.json({ user: newUser, isNewUser: true })
    }

    return NextResponse.json({ user: existingUser, isNewUser: false })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}