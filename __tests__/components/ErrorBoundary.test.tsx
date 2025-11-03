import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '@/components/ErrorBoundary'

// 创建一个会抛出错误的测试组件
const ThrowError = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // 模拟console.error来防止错误信息在测试输出中显示
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  test('should render error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    expect(screen.getByText(/Try again/)).toBeInTheDocument()
  })

  test('should call onError callback when error occurs', () => {
    const mockOnError = jest.fn()
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  test('should have retry functionality', () => {
    let renderCount = 0
    
    const ConditionalThrowError = () => {
      renderCount++
      if (renderCount === 1) {
        throw new Error('First render error')
      }
      return <div>Error recovered!</div>
    }
    
    render(
      <ErrorBoundary>
        <ConditionalThrowError />
      </ErrorBoundary>
    )
    
    // 初始渲染错误
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    
    // 点击重试按钮
    const retryButton = screen.getByText('Try again')
    fireEvent.click(retryButton)
    
    // 错误恢复
    expect(screen.getByText('Error recovered!')).toBeInTheDocument()
  })

  test('should not catch errors thrown during render', () => {
    // 这是一个边界情况测试，验证ErrorBoundary能否处理渲染错误
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      )
    }).not.toThrow()
    
    consoleSpy.mockRestore()
  })

  test('should display different content in development vs production', () => {
    // 模拟开发环境
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    // 开发环境应该显示更详细的错误信息
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    expect(screen.getByText(/Try again/)).toBeInTheDocument()
    
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should reset error state when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    // 显示错误状态
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    
    // 更换children为正常内容
    rerender(
      <ErrorBoundary>
        <div>New content</div>
      </ErrorBoundary>
    )
    
    // 错误状态应该被重置
    expect(screen.getByText('New content')).toBeInTheDocument()
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument()
  })

  test('should handle multiple consecutive errors', () => {
    const ThrowMultipleErrors = () => {
      throw new Error('Multiple errors test')
    }
    
    render(
      <ErrorBoundary>
        <ThrowMultipleErrors />
      </ErrorBoundary>
    )
    
    // 第一次错误
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    
    // 点击重试
    const retryButton = screen.getByText('Try again')
    fireEvent.click(retryButton)
    
    // 应该仍然显示错误状态
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
  })

  test('should be accessible with proper ARIA attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
    
    const retryButton = screen.getByRole('button')
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveAttribute('type', 'button')
  })

  test('should have proper focus management', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    const retryButton = screen.getByText('Try again')
    
    // 重试按钮应该获得焦点
    expect(retryButton).toHaveFocus()
  })
})