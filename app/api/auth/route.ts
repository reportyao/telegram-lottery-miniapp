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
      // 创建新用户 - 使用实际数据库字段
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: id,
          username: username || null,
          first_name: first_name || null,
          last_name: last_name || null,
          preferred_language: 'zh-CN', // 默认语言
          coin_balance: 0,
          platform_balance: 0,
          vip_level: 0,
          total_spent: 0,
          free_daily_count: 3,
          trust_score: 0,
          is_suspicious: false,
          has_first_lottery: false
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