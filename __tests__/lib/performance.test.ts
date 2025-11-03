import { debounce, throttle, performance } from '@/lib/performance'

// Mock performance.now
const mockNow = jest.fn()
global.performance = {
  now: mockNow,
} as any

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNow.mockReturnValue(0)
  })

  describe('debounce function', () => {
    test('应该延迟执行函数', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      // 快进时间
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该取消之前的调用', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      // 在延迟时间内再次调用
      mockNow.mockReturnValue(50)
      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      // 快进到第一次调用的延迟
      jest.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      // 快进到第二次调用的延迟
      mockNow.mockReturnValue(100)
      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该传递正确的参数', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    test('应该支持立即执行选项', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100, { leading: true })

      debouncedFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 快进时间，不应该再执行
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 再次调用
      debouncedFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    test('应该支持尾随执行选项', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100, { trailing: true })

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该支持同时禁用领先和尾随执行', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100, { leading: false, trailing: false })

      debouncedFn()
      jest.advanceTimersByTime(100)

      expect(mockFn).not.toHaveBeenCalled()
    })

    test('应该返回可取消的函数', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn.cancel()

      jest.advanceTimersByTime(100)
      expect(mockFn).not.toHaveBeenCalled()
    })

    test('应该处理flush方法', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      debouncedFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该在flush后取消pending调用', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn.flush()

      // flush后应该取消pending的调用
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该正确处理this上下文', () => {
      const mockFn = jest.fn(function(this: any) {
        return this.value
      })
      const debouncedFn = debounce(mockFn, 100)
      const context = { value: 42 }

      const boundFn = debouncedFn.bind(context)
      boundFn()
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalled()
      expect(mockFn.mock.results[0].value).toBe(42)
    })

    test('应该处理异步函数', async () => {
      const mockFn = jest.fn().mockResolvedValue('result')
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)

      const result = await debouncedFn()
      expect(result).toBe('result')
    })
  })

  describe('throttle function', () => {
    test('应该节流函数调用', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 在节流期间调用应该被忽略
      throttledFn()
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      // 快进时间
      mockNow.mockReturnValue(100)
      jest.advanceTimersByTime(100)

      // 现在应该可以调用了
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    test('应该传递正确的参数', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1', 'arg2')
      mockNow.mockReturnValue(100)
      jest.advanceTimersByTime(100)

      throttledFn('arg1', 'arg2')

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    test('应该支持领先选项', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100, { leading: true })

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1) // 仍然只有一次
    })

    test('应该支持尾随选项', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100, { trailing: true })

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      mockNow.mockReturnValue(50)
      throttledFn()

      // 在尾随时间内，函数应该被调用
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    test('应该提供cancel方法', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      throttledFn.cancel()

      mockNow.mockReturnValue(100)
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1) // 仍然只有一次，cancel生效
    })

    test('应该提供flush方法', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('应该正确处理this上下文', () => {
      const mockFn = jest.fn(function(this: any) {
        return this.value
      })
      const throttledFn = throttle(mockFn, 100)
      const context = { value: 42 }

      const boundFn = throttledFn.bind(context)
      boundFn()

      expect(mockFn).toHaveBeenCalled()
      expect(mockFn.mock.results[0].value).toBe(42)
    })

    test('应该处理异步函数', async () => {
      const mockFn = jest.fn().mockResolvedValue('result')
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      const result = await throttledFn()
      expect(result).toBe('result')
    })

    test('应该处理边界情况（零延迟）', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 0)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('performance.now mock', () => {
    test('应该提供递增的时间值', () => {
      mockNow.mockReturnValue(0)
      expect(performance.now()).toBe(0)

      mockNow.mockReturnValue(100)
      expect(performance.now()).toBe(100)

      mockNow.mockReturnValue(250)
      expect(performance.now()).toBe(250)
    })

    test('应该返回高精度时间戳', () => {
      mockNow.mockReturnValue(123.456)
      const start = performance.now()
      expect(start).toBe(123.456)
    })
  })

  describe('Performance Utilities - Edge Cases', () => {
    test('debounce应该处理零延迟', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 0)

      debouncedFn()
      expect(mockFn).toHaveBeenCalled()
    })

    test('debounce应该处理负延迟', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, -100)

      debouncedFn()
      expect(mockFn).toHaveBeenCalled()
    })

    test('throttle应该处理零延迟', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 0)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    test('debounce应该处理多次flush调用', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn.flush()
      debouncedFn.flush()
      debouncedFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('throttle应该处理多次flush调用', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn.flush()
      throttledFn.flush()
      throttledFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('debounce应该在取消后正常重新调用', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn.cancel()

      jest.advanceTimersByTime(100)
      expect(mockFn).not.toHaveBeenCalled()

      debouncedFn()
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('throttle应该在取消后正常重新调用', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn.cancel()

      mockNow.mockReturnValue(100)
      jest.advanceTimersByTime(100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Memory Management', () => {
    test('debounce应该正确清理定时器', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(jest.getTimerCount()).toBe(1)

      debouncedFn.cancel()
      expect(jest.getTimerCount()).toBe(0)
    })

    test('throttle应该正确清理定时器', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100, { trailing: true })

      throttledFn()
      mockNow.mockReturnValue(50)
      throttledFn()
      expect(jest.getTimerCount()).toBe(1)

      throttledFn.cancel()
      expect(jest.getTimerCount()).toBe(0)
    })
  })
})