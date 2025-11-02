import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LotteryModal from '@/components/LotteryModal'
import { Product, LotteryRound, User } from '@/types/database'

// Mock Supabase
const mockSupabase = {
  functions: {
    invoke: jest.fn(),
  },
}
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock custom event dispatch
window.dispatchEvent = jest.fn()

// Mock navigator.onLine
const mockNavigator = {
  onLine: true,
}
Object.defineProperty(window.navigator', 'onLine', {
  get: () => mockNavigator.onLine,
})

// 测试数据
const mockProduct: Product = {
  id: '1',
  name: {
    en: 'Test Product',
    zh: '测试产品',
  },
  description: {
    en: 'A test product description',
    zh: '一个测试产品描述',
  },
  image_url: 'https://example.com/image.jpg',
  price: 100.00,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  active_rounds: [],
}

const mockLotteryRound: LotteryRound = {
  id: '1',
  lottery_id: '1',
  status: 'active',
  total_shares: 100,
  sold_shares: 50,
  price_per_share: 10.00,
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-12-31T23:59:59Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUser: User = {
  id: '1',
  telegram_id: 123456,
  username: 'testuser',
  full_name: 'Test User',
  balance: 500.00,
  language: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockPoorUser: User = {
  id: '2',
  telegram_id: 789012,
  username: 'pooruser',
  full_name: 'Poor User',
  balance: 5.00, // 不足以购买10股的测试产品
  language: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('LotteryModal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockOnClose.mockClear()
    mockNavigator.onLine = true
  })

  test('应该正确渲染模态框内容', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Total Shares:')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Sold Shares:')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Available:')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Price per Share:')).toBeInTheDocument()
    expect(screen.getByText('$10')).toBeInTheDocument()
    expect(screen.getByText('Total Amount:')).toBeInTheDocument()
    expect(screen.getByText('$10.00')).toBeInTheDocument()
    expect(screen.getByText('Your Balance:')).toBeInTheDocument()
    expect(screen.getByText('$500.00')).toBeInTheDocument()
  })

  test('应该根据用户语言显示正确的产品名称', () => {
    const productWithChineseName = {
      ...mockProduct,
      name: {
        zh: '中文产品名称',
        en: 'English Product Name',
      },
    }

    render(
      <LotteryModal
        product={productWithChineseName}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('English Product Name')).toBeInTheDocument()
  })

  test('应该默认选中1股', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)
    expect(shareInput).toHaveValue(1)
  })

  test('应该正确计算总金额', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('$10.00')).toBeInTheDocument()

    // 改变股数
    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '5' } })

    expect(screen.getByText('$50.00')).toBeInTheDocument()
  })

  test('应该显示余额不足的红色警告', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockPoorUser}
        onClose={mockOnClose}
      />
    )

    const balanceElement = screen.getByText('$5.00')
    expect(balanceElement).toHaveClass('text-red-600')
  })

  test('应该显示余额充足的绿色警告', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const balanceElement = screen.getByText('$500.00')
    expect(balanceElement).toHaveClass('text-green-600')
  })

  test('应该正确处理股数输入的边界值', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)

    // 测试超出可用股数
    fireEvent.change(shareInput, { target: { value: '100' } })
    expect(shareInput).toHaveValue(50) // 应该被限制为50（可用股数）

    // 测试输入为负数
    fireEvent.change(shareInput, { target: { value: '-5' } })
    expect(shareInput).toHaveValue(1) // 应该被限制为1

    // 测试输入为空
    fireEvent.change(shareInput, { target: { value: '' } })
    expect(shareInput).toHaveValue(1) // 应该重置为1
  })

  test('应该处理空输入', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '' } })

    expect(shareInput).toHaveValue(1) // 应该重置为1
  })

  test('应该阻止在无网络时参与', async () => {
    const user = userEvent.setup()
    mockNavigator.onLine = false

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled()
    expect(screen.getByText('No internet connection. Please check your network.')).toBeInTheDocument()
  })

  test('应该在没有用户时禁用按钮并显示错误', async () => {
    const user = userEvent.setup()

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={null}
        onClose={mockOnClose}
      />
    )

    const button = screen.getByRole('button', { name: /confirm participation/i })
    expect(button).toBeDisabled()

    // 即使没有用户，点击按钮也应该显示错误（通过点击触发）
    await user.click(button)
    expect(screen.getByText('Please login first')).toBeInTheDocument()
  })

  test('应该在余额不足时显示错误', async () => {
    const user = userEvent.setup()

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockPoorUser}
        onClose={mockOnClose}
      />
    )

    // 设置足够高的股数以触发余额不足错误
    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '10' } }) // 需要100，但用户只有5

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled()
    expect(screen.getByText('Insufficient balance')).toBeInTheDocument()
  })

  test('应该在股数无效时显示错误', async () => {
    const user = userEvent.setup()

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    // 通过修改状态来模拟无效股数
    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '0' } })

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled()
    expect(screen.getByText('Invalid number of shares')).toBeInTheDocument()
  })

  test('应该成功参与彩票', async () => {
    const user = userEvent.setup()

    mockSupabase.functions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    })

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '3' } })

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('participate-lottery', {
        body: {
          user_id: '1',
          lottery_round_id: '1',
          shares_count: 3,
        },
      })
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(window.dispatchEvent).toHaveBeenCalledWith(new CustomEvent('lotteryParticipated'))
  })

  test('应该在参与失败时显示适当的错误消息', async () => {
    const user = userEvent.setup()

    // 模拟网络错误
    mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'))

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  test('应该在参与过程中显示加载状态', async () => {
    const user = userEvent.setup()

    // 模拟异步操作
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100))
    )

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /confirm participation/i }))

    // 立即检查加载状态
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm participation/i })).toBeDisabled()
  })

  test('应该正确处理不同的错误类型', async () => {
    const user = userEvent.setup()
    
    const errorCases = [
      { error: new Error('timeout error'), expected: 'Network error. Please try again.' },
      { error: new Error('balance insufficient'), expected: 'Insufficient balance for this transaction' },
      { error: new Error('not enough shares'), expected: 'Not enough shares available' },
      { error: new Error('unknown error'), expected: 'unknown error' },
    ]

    for (const { error, expected } of errorCases) {
      jest.clearAllMocks()
      
      mockSupabase.functions.invoke.mockRejectedValue(error)

      render(
        <LotteryModal
          product={mockProduct}
          lotteryRound={mockLotteryRound}
          user={mockUser}
          onClose={mockOnClose}
        />
      )

      await user.click(screen.getByRole('button', { name: /confirm participation/i }))

      await waitFor(() => {
        expect(screen.getByText(expected)).toBeInTheDocument()
      })
    }
  })

  test('应该在点击关闭按钮时关闭模态框', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('应该显示最多可选择股数的限制', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText(/select shares \(max: 50\)/i)).toBeInTheDocument()
  })

  test('应该处理小数价格计算', () => {
    const roundWithDecimalPrice = {
      ...mockLotteryRound,
      price_per_share: 3.50,
    }

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={roundWithDecimalPrice}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('$3.50')).toBeInTheDocument()

    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '2' } })

    expect(screen.getByText('$7.00')).toBeInTheDocument()
  })
})

describe('LotteryModal Component - Edge Cases', () => {
  test('应该处理可用股数为0的情况', () => {
    const soldOutRound = {
      ...mockLotteryRound,
      sold_shares: 100,
    }

    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={soldOutRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Available:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/select shares \(max: 0\)/i)).toBeInTheDocument()
  })

  test('应该处理小数股数输入', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: '1.5' } })

    // 应该处理为整数
    expect(shareInput).toHaveValue(1)
  })

  test('应该处理非数字输入', () => {
    render(
      <LotteryModal
        product={mockProduct}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    const shareInput = screen.getByLabelText(/select shares/i)
    fireEvent.change(shareInput, { target: { value: 'abc' } })

    // 应该保持原值或处理为默认值
    expect(shareInput).toHaveValue(1)
  })

  test('应该处理缺失的产品名称', () => {
    const productWithoutName = {
      ...mockProduct,
      name: {},
    }

    render(
      <LotteryModal
        product={productWithoutName}
        lotteryRound={mockLotteryRound}
        user={mockUser}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})