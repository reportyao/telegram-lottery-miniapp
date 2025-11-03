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

describe('ProductCard', () => {
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

  test('should render product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        user={mockUser}
        onParticipate={jest.fn()}
      />
    )
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('A test product description')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })

  test('should display active lottery round information', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        user={mockUser}
        onParticipate={jest.fn()}
      />
    )
    
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('50/100')).toBeInTheDocument()
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  test('should handle participate button click', async () => {
    const mockOnParticipate = jest.fn()
    render(
      <ProductCard 
        product={mockProduct} 
        user={mockUser}
        onParticipate={mockOnParticipate}
      />
    )
    
    const participateButton = screen.getByText('Participate')
    fireEvent.click(participateButton)
    
    await waitFor(() => {
      expect(mockOnParticipate).toHaveBeenCalledWith(mockProduct, expect.any(Object))
    })
  })

  test('should display loading state when image is loading', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        user={mockUser}
        onParticipate={jest.fn()}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  test('should prevent event propagation when clicking on card', () => {
    const mockOnParticipate = jest.fn()
    render(
      <ProductCard 
        product={mockProduct} 
        user={mockUser}
        onParticipate={mockOnParticipate}
      />
    )
    
    const card = screen.getByText('Test Product').closest('div')
    fireEvent.click(card!)
    
    // 事件应该被阻止冒泡，所以onParticipate不应该被调用
    expect(mockOnParticipate).not.toHaveBeenCalled()
  })
})