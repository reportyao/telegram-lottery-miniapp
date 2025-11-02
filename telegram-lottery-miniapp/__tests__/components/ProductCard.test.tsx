import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/components/ProductCard'
import { Product, User } from '@/types/database'

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
  active_rounds: [
    {
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
    },
  ],
}

const mockUser: User = {
  id: '1',
  telegram_id: 123456,
  username: 'testuser',
  full_name: 'Test User',
  balance: 1000.00,
  language: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockEmptyUser: User = {
  id: '2',
  telegram_id: 789012,
  username: 'emptyuser',
  full_name: 'Empty User',
  balance: 0.00,
  language: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock Image component
jest.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} alt={props.alt} />
  },
}))

// Mock LotteryModal
jest.mock('@/components/LotteryModal', () => {
  return function MockLotteryModal({ onClose }: { onClose: () => void }) {
    return <div data-testid="lottery-modal">Lottery Modal</div>
  }
})

describe('ProductCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('en')
  })

  test('应该正确渲染产品信息', () => {
    render(<ProductCard product={mockProduct} user={mockUser} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('A test product description')).toBeInTheDocument()
    expect(screen.getByText('Per Share: $10')).toBeInTheDocument()
    expect(screen.getByText('50/100 Sold')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Participate Now')).toBeInTheDocument()
  })

  test('应该根据用户语言显示正确的产品名称', () => {
    localStorageMock.getItem.mockReturnValue('zh')
    
    render(<ProductCard product={mockProduct} user={mockUser} />)

    expect(screen.getByText('测试产品')).toBeInTheDocument()
    expect(screen.getByText('一个测试产品描述')).toBeInTheDocument()
  })

  test('应该在没有活跃轮次时显示"没有活跃彩票"', () => {
    const productWithoutRounds = {
      ...mockProduct,
      active_rounds: [],
    }

    render(<ProductCard product={productWithoutRounds} user={mockUser} />)

    expect(screen.getByText('No active lottery')).toBeInTheDocument()
    expect(screen.queryByText('Participate Now')).not.toBeInTheDocument()
  })

  test('应该在没有活跃轮次状态时禁用参与按钮', () => {
    const productWithInactiveRound = {
      ...mockProduct,
      active_rounds: [
        {
          ...mockProduct.active_rounds[0],
          status: 'finished',
        },
      ],
    }

    render(<ProductCard product={productWithInactiveRound} user={mockUser} />)

    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view details/i })).toBeDisabled()
  })

  test('应该在点击产品卡片时打开模态框（如果有活跃轮次）', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /participate now/i }))
    
    await waitFor(() => {
      expect(screen.getByTestId('lottery-modal')).toBeInTheDocument()
    })
  })

  test('应该在点击参与按钮时打开模态框', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /participate now/i }))
    
    await waitFor(() => {
      expect(screen.getByTestId('lottery-modal')).toBeInTheDocument()
    })
  })

  test('应该在没有活跃轮次时不打开模态框', async () => {
    const user = userEvent.setup()
    const productWithoutRounds = {
      ...mockProduct,
      active_rounds: [],
    }

    render(<ProductCard product={productWithoutRounds} user={mockUser} />)

    await user.click(screen.getByText('No active lottery'))
    
    await waitFor(() => {
      expect(screen.queryByTestId('lottery-modal')).not.toBeInTheDocument()
    })
  })

  test('应该正确处理图像加载状态', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} user={mockUser} />)

    // 检查加载占位符
    expect(screen.getByTestId('image-loading')).toBeInTheDocument()

    const imageElement = screen.getByAltText('Test Product')
    fireEvent.load(imageElement)

    // 检查加载状态是否消失
    await waitFor(() => {
      expect(screen.queryByTestId('image-loading')).not.toBeInTheDocument()
    })
  })

  test('应该在图像加载失败时显示占位符', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} user={mockUser} />)

    const imageElement = screen.getByAltText('Test Product')
    fireEvent.error(imageElement)

    await waitFor(() => {
      expect(screen.getByText('📦')).toBeInTheDocument()
      expect(screen.getByText('No Image')).toBeInTheDocument()
    })
  })

  test('应该显示正确的销售进度条', () => {
    render(<ProductCard product={mockProduct} user={mockUser} />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  test('应该显示不同的状态颜色', () => {
    const productWithInactiveRound = {
      ...mockProduct,
      active_rounds: [
        {
          ...mockProduct.active_rounds[0],
          status: 'finished',
        },
      ],
    }

    render(<ProductCard product={productWithInactiveRound} user={mockUser} />)

    const statusElement = screen.getByText('Ready to Draw')
    expect(statusElement).toHaveClass('text-orange-600')
  })

  test('应该处理缺失的产品属性', () => {
    const incompleteProduct = {
      ...mockProduct,
      name: {},
      description: {},
      active_rounds: null,
    }

    render(<ProductCard product={incompleteProduct} user={mockUser} />)

    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('No active lottery')).toBeInTheDocument()
  })

  test('应该处理多语言本地化fallback', () => {
    localStorageMock.getItem.mockReturnValue('fr') // 不支持的语言
    
    render(<ProductCard product={mockProduct} user={mockUser} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  test('应该处理没有用户的情况', () => {
    render(<ProductCard product={mockProduct} user={null} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Participate Now')).toBeInTheDocument()
  })

  test('应该正确计算和显示销售百分比', () => {
    const productWithDifferentProgress = {
      ...mockProduct,
      active_rounds: [
        {
          ...mockProduct.active_rounds[0],
          sold_shares: 25, // 25%
        },
      ],
    }

    render(<ProductCard product={productWithDifferentProgress} user={mockUser} />)

    expect(screen.getByText('25/100 Sold')).toBeInTheDocument()
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({ width: '25%' })
  })

  test('应该处理满售情况', () => {
    const soldOutProduct = {
      ...mockProduct,
      active_rounds: [
        {
          ...mockProduct.active_rounds[0],
          sold_shares: 100, // 100%
        },
      ],
    }

    render(<ProductCard product={soldOutProduct} user={mockUser} />)

    expect(screen.getByText('100/100 Sold')).toBeInTheDocument()
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  test('应该防止事件冒泡', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} user={mockUser} />)

    // 模拟阻止冒泡的按钮点击
    await user.click(screen.getByRole('button', { name: /participate now/i }))
    
    await waitFor(() => {
      expect(screen.getByTestId('lottery-modal')).toBeInTheDocument()
    })
  })

  test('应该在图像未加载时显示加载动画', () => {
    render(<ProductCard product={mockProduct} user={mockUser} />)

    expect(screen.getByTestId('image-loading')).toBeInTheDocument()
  })
})

describe('ProductCard Component - Error Handling', () => {
  test('应该处理无效的产品数据', () => {
    const invalidProduct = {
      ...mockProduct,
      name: null as any,
      description: null as any,
      active_rounds: undefined as any,
    }

    render(<ProductCard product={invalidProduct} user={mockUser} />)

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  test('应该处理空的产品数据', () => {
    const emptyProduct = {} as Product

    render(<ProductCard product={emptyProduct} user={mockUser} />)

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  test('应该处理无效的轮次数据', () => {
    const productWithInvalidRound = {
      ...mockProduct,
      active_rounds: [
        null as any,
      ],
    }

    render(<ProductCard product={productWithInvalidRound} user={mockUser} />)

    // 应该正常渲染，即使轮次数据有问题
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  test('应该处理localStorage访问错误', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage is not available')
    })

    render(<ProductCard product={mockProduct} user={mockUser} />)

    // 应该降级到默认语言
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })
})