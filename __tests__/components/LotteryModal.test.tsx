import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LotteryModal from '@/components/LotteryModal'
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

describe('LotteryModal', () => {
  beforeEach(() => {
    // 模拟Telegram WebApp
    global.window.Telegram = {
      WebApp: {
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        initData: '',
        initDataUnsafe: {
          user: {
            id: 123456,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en',
          },
        },
        themeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#666666',
          link_color: '#3399ff',
          button_color: '#3399ff',
          button_text_color: '#ffffff',
        },
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
      },
    }
  })

  test('should render modal content correctly', () => {
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    )
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('A test product description')).toBeInTheDocument()
    expect(screen.getByText('Total Shares: 100')).toBeInTheDocument()
    expect(screen.getByText('Price per Share: $10.00')).toBeInTheDocument()
  })

  test('should not render when isOpen is false', () => {
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={false}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    )
    
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument()
  })

  test('should handle share selection', async () => {
    const mockOnSubmit = jest.fn()
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={mockOnSubmit}
      />
    )
    
    // 选择更多份额
    const increaseButton = screen.getByTestId('increase-shares')
    fireEvent.click(increaseButton)
    fireEvent.click(increaseButton)
    
    // 检查份额数量变化
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Total: $30.00')).toBeInTheDocument()
  })

  test('should calculate total cost correctly', () => {
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    )
    
    expect(screen.getByText('Total: $10.00')).toBeInTheDocument()
    
    const increaseButton = screen.getByTestId('increase-shares')
    fireEvent.click(increaseButton)
    
    expect(screen.getByText('Total: $20.00')).toBeInTheDocument()
  })

  test('should disable submit button when shares is 0', () => {
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    )
    
    const submitButton = screen.getByText('Confirm Participation')
    expect(submitButton).toBeDisabled()
  })

  test('should show insufficient balance warning', async () => {
    const lowBalanceUser = { ...mockUser, balance: 5.00 }
    const mockOnSubmit = jest.fn()
    
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        user={lowBalanceUser}
        onClose={jest.fn()}
        onSubmit={mockOnSubmit}
      />
    )
    
    const submitButton = screen.getByText('Confirm Participation')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/Insufficient Balance/)).toBeInTheDocument()
  })

  test('should handle submit correctly', async () => {
    const mockOnSubmit = jest.fn()
    const mockOnClose = jest.fn()
    
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        user={mockUser}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    
    // 选择份额
    const increaseButton = screen.getByTestId('increase-shares')
    fireEvent.click(increaseButton)
    
    // 提交表单
    const submitButton = screen.getByText('Confirm Participation')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        product: mockProduct,
        shares: 2,
        totalCost: 20.00,
      })
    })
  })

  test('should close modal when close button is clicked', () => {
    const mockOnClose = jest.fn()
    
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={jest.fn()}
      />
    )
    
    const closeButton = screen.getByTestId('close-modal')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should handle keyboard events', () => {
    const mockOnClose = jest.fn()
    
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={jest.fn()}
      />
    )
    
    // 模拟Escape键
    fireEvent.keyDown(screen.getByTestId('modal-overlay'), { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('should prevent backdrop click when clicking inside modal', () => {
    const mockOnClose = jest.fn()
    
    render(
      <LotteryModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={jest.fn()}
      />
    )
    
    // 点击模态框内容（不是覆盖层）
    const modalContent = screen.getByTestId('modal-content')
    fireEvent.click(modalContent)
    
    // onClose不应该被调用
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})