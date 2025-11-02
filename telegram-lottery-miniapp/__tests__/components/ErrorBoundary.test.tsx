import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '@/components/ErrorBoundary'

// Mock console methods
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

beforeEach(() => {
  jest.clearAllMocks()
})

// Test components
const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div data-testid="test-component">Test Component</div>
}

const TestComponentWithProps = ({ name }: { name: string }) => {
  return <div data-testid="test-component">Hello {name}</div>
}

const TestComponentWithChildren = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-component">{children}</div>
}

describe('ErrorBoundary Component', () => {
  test('应该正确渲染子组件（没有错误时）', () => {
    const { container } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  test('应该在捕获到错误时显示错误界面', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument()
  })

  test('应该显示错误详情', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/error details/i)).toBeInTheDocument()
  })

  test('应该提供重试按钮', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()

    // 点击重试按钮
    fireEvent.click(reerender(() => (
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    )))
  })

  test('应该在点击重试后重新渲染子组件', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // 模拟重试成功
    rerender(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    )

    // 手动触发重新渲染
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  test('应该正确处理组件中的props', () => {
    render(
      <ErrorBoundary>
        <TestComponentWithProps name="World" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  test('应该正确处理子组件', () => {
    render(
      <ErrorBoundary>
        <TestComponentWithChildren>
          <span data-testid="child-component">Child Content</span>
        </TestComponentWithChildren>
      </ErrorBoundary>
    )

    expect(screen.getByTestId('child-component')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  test('应该处理复杂错误信息', () => {
    const ComplexErrorComponent = () => {
      throw new Error('Complex error with details: User data not found')
    }

    render(
      <ErrorBoundary>
        <ComplexErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/complex error with details/i)).toBeInTheDocument()
  })

  test('应该处理异步错误', async () => {
    const AsyncErrorComponent = () => {
      // 在下一个tick中抛出错误
      setTimeout(() => {
        throw new Error('Async error')
      }, 0)
      return <div>Loading...</div>
    }

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    )

    // 初始渲染应该正常
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // 等待异步错误发生
    await new Promise(resolve => setTimeout(resolve, 0))

    // ErrorBoundary应该捕获异步错误
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  test('应该处理多个错误边界嵌套', () => {
    const InnerErrorComponent = () => {
      throw new Error('Inner error')
    }

    render(
      <ErrorBoundary>
        <ErrorBoundary>
          <InnerErrorComponent />
        </ErrorBoundary>
      </ErrorBoundary>
    )

    // 最近的ErrorBoundary应该处理错误
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  test('应该处理自定义错误信息', () => {
    const CustomErrorComponent = () => {
      const error = new Error('Network connection failed')
      error.name = 'NetworkError'
      throw error
    }

    render(
      <ErrorBoundary>
        <CustomErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/network connection failed/i)).toBeInTheDocument()
    expect(screen.getByText(/networkerror/i)).toBeInTheDocument()
  })

  test('应该处理null/undefined错误', () => {
    const NullErrorComponent = () => {
      throw null
    }

    render(
      <ErrorBoundary>
        <NullErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/an unknown error occurred/i)).toBeInTheDocument()
  })

  test('应该处理字符串错误', () => {
    const StringErrorComponent = () => {
      throw 'String error'
    }

    render(
      <ErrorBoundary>
        <StringErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  test('应该提供错误报告功能（如果存在）', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // 检查是否有错误报告相关的UI
    const errorReportElements = screen.queryAllByText(/report/i)
    expect(errorReportElements.length).toBeGreaterThan(0)
  })

  test('应该在生产模式下隐藏错误详情', () => {
    // 模拟生产模式
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // 在生产模式下，错误详情应该被隐藏
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.queryByText(/error details/i)).not.toBeInTheDocument()

    // 恢复环境
    process.env.NODE_ENV = originalEnv
  })

  test('应该在开发模式下显示错误详情', () => {
    // 确保在开发模式
    expect(process.env.NODE_ENV).not.toBe('production')

    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
  })

  test('应该正确处理class组件错误', () => {
    class ClassErrorComponent extends React.Component {
      constructor(props: any) {
        super(props)
      }

      render() {
        throw new Error('Class component error')
      }
    }

    render(
      <ErrorBoundary>
        <ClassErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  test('应该正确处理React错误边界生命周期方法', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // 验证React调用了componentDidCatch
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  test('应该防止错误向外传播', () => {
    const ParentComponent = () => (
      <div>
        <ErrorBoundary>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
        <div data-testid="parent-content">Parent Content</div>
      </div>
    )

    render(<ParentComponent />)

    // 错误应该被ErrorBoundary捕获，父组件的其余部分应该正常渲染
    expect(screen.getByTestId('parent-content')).toBeInTheDocument()
    expect(screen.getByText('Parent Content')).toBeInTheDocument()
  })
})

describe('ErrorBoundary Component - Accessibility', () => {
  test('错误界面应该具有适当的ARIA属性', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
    expect(errorContainer).toHaveAttribute('aria-live', 'polite')
  })

  test('重试按钮应该具有适当的ARIA标签', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveAttribute('aria-label', '重试加载组件')
  })
})