import { supabase, handleDatabaseError, withRetry, withTransaction } from '@/lib/supabase'

// Mock Supabase
const mockSupabase = {
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
    order: jest.fn().mockReturnThis(),
  })),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  supabaseConfig: {},
  TABLES: {
    USERS: 'users',
    LOTTERIES: 'lotteries',
    PARTICIPATIONS: 'participations',
    WINNERS: 'winners',
  },
  auth: {
    getUser: jest.fn(),
    signInWithTelegram: jest.fn(),
    signInAnonymously: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  handleDatabaseError: jest.fn(),
  withRetry: jest.fn(),
  withTransaction: jest.fn(),
}))

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Operations', () => {
    test('db.users.getByTelegramId should work correctly', async () => {
      const mockUser = {
        id: '1',
        telegram_id: 123456,
        username: 'testuser',
        full_name: 'Test User',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.users.getByTelegramId(123456)

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('telegram_id', 123456)
      expect(result).toEqual(mockUser)
    })

    test('db.users.create should work correctly', async () => {
      const newUser = {
        telegram_id: 123456,
        username: 'testuser',
        full_name: 'Test User',
        language: 'en',
      }

      const mockCreatedUser = {
        id: '1',
        ...newUser,
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedUser, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.users.create(newUser)

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.insert).toHaveBeenCalledWith([newUser])
      expect(mockQuery.select).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedUser)
    })

    test('db.users.update should work correctly', async () => {
      const updates = {
        username: 'newusername',
        full_name: 'New User',
      }

      const mockUpdatedUser = {
        id: '1',
        ...updates,
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedUser, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.users.update('1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdatedUser)
    })

    test('db.users.getByTelegramId should handle not found error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.users.getByTelegramId(999999)

      expect(result).toBeNull()
    })
  })

  describe('Lottery Operations', () => {
    test('db.lotteries.getActive should work correctly', async () => {
      const mockLotteries = [
        { id: '1', title: 'Active Lottery 1', status: 'active' },
        { id: '2', title: 'Active Lottery 2', status: 'active' },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockLotteries, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.lotteries.getActive()

      expect(mockSupabase.from).toHaveBeenCalledWith('lotteries')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockLotteries)
    })

    test('db.lotteries.getById should work correctly', async () => {
      const mockLottery = {
        id: '1',
        title: 'Test Lottery',
        status: 'active',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockLottery, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.lotteries.getById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('lotteries')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockLottery)
    })

    test('db.lotteries.create should work correctly', async () => {
      const newLottery = {
        title: 'New Lottery',
        description: 'A new lottery',
        ticket_price: 10.00,
        total_tickets: 100,
        end_time: '2024-12-31T23:59:59Z',
      }

      const mockCreatedLottery = {
        id: '1',
        ...newLottery,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedLottery, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await supabase.lotteries.create(newLottery)

      expect(mockSupabase.from).toHaveBeenCalledWith('lotteries')
      expect(mockQuery.insert).toHaveBeenCalledWith([newLottery])
      expect(mockQuery.select).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedLottery)
    })
  })

  describe('Participation Operations', () => {
    test('db.participations.getByUserAndLottery should work correctly', async () => {
      const mockParticipations = [
        {
          id: '1',
          user_id: '1',
          lottery_id: '1',
          ticket_count: 5,
          total_amount: 50.00,
        },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockResolvedValue: jest.fn().mockResolvedValue({ data: mockParticipations, error: null }),
      }

      // 由于我们需要返回this，我们需要模拟链式调用
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              mockResolvedValue: jest.fn().mockResolvedValue({ data: mockParticipations, error: null }),
            }),
          }),
        }),
      })

      const result = await supabase.participations.getByUserAndLottery('1', '1')

      expect(mockSupabase.from).toHaveBeenCalledWith('participations')
      expect(result).toEqual(mockParticipations)
    })

    test('db.participations.getLotteryStats should work correctly', async () => {
      const mockData = [
        { ticket_count: 5 },
        { ticket_count: 3 },
        { ticket_count: 2 },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockResolvedValue: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            mockResolvedValue: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      const result = await supabase.participations.getLotteryStats('1')

      expect(result).toBe(10) // 5 + 3 + 2
    })

    test('db.participations.getLotteryStats should handle empty data', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            mockResolvedValue: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })

      const result = await supabase.participations.getLotteryStats('1')

      expect(result).toBe(0)
    })
  })
})

describe('Database Error Handling', () => {
  test('handleDatabaseError should handle PostgreSQL errors', () => {
    expect(handleDatabaseError({ code: '23505' })).toBe('该记录已存在')
    expect(handleDatabaseError({ code: '23503' })).toBe('外键约束错误')
    expect(handleDatabaseError({ code: '23502' })).toBe('必填字段不能为空')
    expect(handleDatabaseError({ code: '23514' })).toBe('数据验证失败')
    expect(handleDatabaseError({ code: 'PGRST116' })).toBe('记录不存在')
    expect(handleDatabaseError({ code: 'PGRST301' })).toBe('权限不足')
    expect(handleDatabaseError({ code: '42501' })).toBe('权限被拒绝')
    expect(handleDatabaseError({ code: '42P01' })).toBe('数据表不存在')
    expect(handleDatabaseError({ code: '42703' })).toBe('字段不存在')
    expect(handleDatabaseError({ code: '22P02' })).toBe('数据类型错误')
    expect(handleDatabaseError({ code: '23501' })).toBe('唯一约束冲突')
  })

  test('handleDatabaseError should handle Supabase-specific errors', () => {
    expect(handleDatabaseError({ message: 'fetch error' })).toBe('网络连接失败，请检查网络设置')
    expect(handleDatabaseError({ message: 'timeout error' })).toBe('请求超时，请稍后重试')
    expect(handleDatabaseError({ message: 'Unauthorized' })).toBe('身份验证失败，请重新登录')
    expect(handleDatabaseError({ message: 'Forbidden' })).toBe('权限不足，无法执行此操作')
  })

  test('handleDatabaseError should return default message for unknown errors', () => {
    expect(handleDatabaseError({ code: 'UNKNOWN', message: 'Unknown error' }))
      .toBe('Unknown error')
    expect(handleDatabaseError({ message: 'Some error' }))
      .toBe('Some error')
    expect(handleDatabaseError({}))
      .toBe('未知数据库错误')
  })
})

describe('withRetry Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should succeed on first attempt', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success')
    const result = await withRetry(mockOperation, 3, 100)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(1)
  })

  test('should retry and then succeed', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValue('success')

    const result = await withRetry(mockOperation, 3, 100)

    expect(result).toBe('success')
    expect(mockOperation).toHaveBeenCalledTimes(3)
  })

  test('should fail after max retries', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent error'))

    await expect(withRetry(mockOperation, 2, 100)).rejects.toThrow('Persistent error')
    expect(mockOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
  })

  test('should not retry non-retryable errors', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Validation failed'))

    await expect(withRetry(mockOperation, 3, 100)).rejects.toThrow('Validation failed')
    expect(mockOperation).toHaveBeenCalledTimes(1) // Only the initial attempt
  })

  test('should use exponential backoff', async () => {
    jest.useFakeTimers()
    
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success')

    const promise = withRetry(mockOperation, 3, 100)

    // Fast-forward through the retry delays
    jest.advanceTimersByTime(100) // First retry delay
    jest.advanceTimersByTime(200) // Second retry delay

    const result = await promise

    expect(result).toBe('success')
    jest.useRealTimers()
  })
})

describe('withTransaction Function', () => {
  test('should execute operation successfully', async () => {
    const mockOperation = jest.fn().mockResolvedValue('transaction result')

    const result = await withTransaction(mockOperation)

    expect(result).toBe('transaction result')
    expect(mockOperation).toHaveBeenCalledWith(supabase)
  })

  test('should handle operation errors', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Transaction failed'))

    await expect(withTransaction(mockOperation)).rejects.toThrow('Transaction failed')
    expect(mockOperation).toHaveBeenCalledWith(supabase)
  })
})

describe('Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('auth.getUser should work correctly', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const result = await supabase.auth.getUser()

    expect(result).toEqual(mockUser)
    expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
  })

  test('auth.getUser should handle errors', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

    await expect(supabase.auth.getUser()).rejects.toThrow('Auth error')
  })

  test('auth.signInWithTelegram should work correctly', async () => {
    const mockSession = { access_token: 'mock_token' }
    
    mockSupabase.auth.signInWithIdToken.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const result = await supabase.auth.signInWithTelegram('test_init_data')

    expect(result).toEqual({ session: mockSession })
    expect(mockSupabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'telegram',
      token: 'test_init_data',
    })
  })

  test('auth.signInAnonymously should work correctly', async () => {
    const mockSession = { access_token: 'anonymous_token' }
    
    mockSupabase.auth.signInAnonymously.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const result = await supabase.auth.signInAnonymously()

    expect(result).toEqual({ session: mockSession })
    expect(mockSupabase.auth.signInAnonymously).toHaveBeenCalledTimes(1)
  })

  test('auth.signOut should work correctly', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    await supabase.auth.signOut()

    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
  })

  test('auth.getSession should work correctly', async () => {
    const mockSession = { access_token: 'session_token' }
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const result = await supabase.auth.getSession()

    expect(result).toEqual(mockSession)
    expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1)
  })

  test('auth.onAuthStateChange should work correctly', async () => {
    const mockCallback = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: {} } })

    const result = supabase.auth.onAuthStateChange(mockCallback)

    expect(result).toBeDefined()
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
  })
})