import * as utils from '@/lib/utils'

// 扩展全局expect类型
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}

describe('Utils Library', () => {
  describe('cn function', () => {
    test('应该合并类名', () => {
      expect(utils.cn('class1', 'class2')).toBe('class1 class2')
    })

    test('应该处理条件类名', () => {
      const condition = true
      expect(utils.cn('base', condition && 'conditional')).toBe('base conditional')
      expect(utils.cn('base', !condition && 'conditional')).toBe('base')
    })

    test('应该处理undefined和null', () => {
      expect(utils.cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(utils.cn('class1', null, 'class2')).toBe('class1 class2')
    })
  })

  describe('formatCurrency function', () => {
    test('应该正确格式化美元', () => {
      expect(utils.formatCurrency(1000)).toBe('$1,000.00')
      expect(utils.formatCurrency(1000.50)).toBe('$1,000.50')
      expect(utils.formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    test('应该处理不同的货币', () => {
      expect(utils.formatCurrency(1000, 'EUR')).toBe('€1,000.00')
      expect(utils.formatCurrency(1000, 'GBP')).toBe('£1,000.00')
      expect(utils.formatCurrency(1000, 'CNY')).toBe('¥1,000.00')
      expect(utils.formatCurrency(1000, 'RUB')).toBe('₽1,000.00')
    })

    test('应该处理数字货币符号', () => {
      expect(utils.formatCurrency(1000, 'TON')).toBe('🔷1,000.00')
      expect(utils.formatCurrency(1000, 'BTC')).toBe('₿1,000.00')
      expect(utils.formatCurrency(1000, 'ETH')).toBe('♦1,000.00')
    })

    test('应该处理小数值', () => {
      expect(utils.formatCurrency(0.5)).toBe('$0.50')
      expect(utils.formatCurrency(0.123456789)).toBe('$0.12345679')
    })

    test('应该处理未知货币', () => {
      expect(utils.formatCurrency(1000, 'UNKNOWN')).toBe('$1,000.00')
    })

    test('应该处理零值', () => {
      expect(utils.formatCurrency(0)).toBe('$0.00')
    })

    test('应该处理负值', () => {
      expect(utils.formatCurrency(-1000)).toBe('-$1,000.00')
    })
  })

  describe('formatNumber function', () => {
    test('应该格式化大数字', () => {
      expect(utils.formatNumber(1000000000)).toBe('1.0B')
      expect(utils.formatNumber(100000000)).toBe('100.0M')
      expect(utils.formatNumber(1000000)).toBe('1.0M')
      expect(utils.formatNumber(100000)).toBe('100.0K')
      expect(utils.formatNumber(1000)).toBe('1.0K')
    })

    test('应该处理小数字', () => {
      expect(utils.formatNumber(999)).toBe('999')
      expect(utils.formatNumber(500)).toBe('500')
      expect(utils.formatNumber(1)).toBe('1')
    })

    test('应该处理零值', () => {
      expect(utils.formatNumber(0)).toBe('0')
    })

    test('应该处理负数', () => {
      expect(utils.formatNumber(-1000)).toBe('-1.0K')
      expect(utils.formatNumber(-1000000)).toBe('-1.0M')
    })
  })

  describe('sleep function', () => {
    test('应该等待指定时间', async () => {
      const start = Date.now()
      await utils.sleep(100)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(95) // 允许一些误差
      expect(elapsed).toBeLessThan(110)
    })
  })

  describe('generateId function', () => {
    test('应该生成唯一ID', () => {
      const id1 = utils.generateId()
      const id2 = utils.generateId()
      expect(id1).not.toBe(id2)
    })

    test('应该生成正确长度的ID', () => {
      const id = utils.generateId()
      expect(id.length).toBe(16) // 8 bytes in hex = 16 chars
    })

    test('应该只包含十六进制字符', () => {
      const id = utils.generateId()
      expect(id).toMatch(/^[a-f0-9]+$/)
    })

    test('应该处理window.crypto不可用的情况', () => {
      // 模拟crypto不可用
      const originalCrypto = global.crypto
      global.crypto = undefined as any

      const id = utils.generateId()
      expect(id.length).toBeGreaterThan(0)

      // 恢复
      global.crypto = originalCrypto
    })
  })

  describe('deepClone function', () => {
    test('应该深拷贝对象', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } }
      const cloned = utils.deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.b.d).not.toBe(original.b.d)
    })

    test('应该处理数组', () => {
      const original = [1, 2, { a: 3 }, [4, 5]]
      const cloned = utils.deepClone(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned[2]).not.toBe(original[2])
      expect(cloned[3]).not.toBe(original[3])
    })

    test('应该处理基本类型', () => {
      expect(utils.deepClone(42)).toBe(42)
      expect(utils.deepClone('string')).toBe('string')
      expect(utils.deepClone(true)).toBe(true)
      expect(utils.deepClone(null)).toBe(null)
      expect(utils.deepClone(undefined)).toBe(undefined)
    })

    test('应该处理Date对象', () => {
      const date = new Date('2024-01-01')
      const cloned = utils.deepClone(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
      expect(cloned).toBeInstanceOf(Date)
    })

    test('应该处理循环引用（应该抛出错误）', () => {
      const obj: any = { a: 1 }
      obj.self = obj

      expect(() => utils.deepClone(obj)).toThrow()
    })
  })

  describe('Type guards', () => {
    test('isString should work correctly', () => {
      expect(utils.isString('hello')).toBe(true)
      expect(utils.isString(123)).toBe(false)
      expect(utils.isString(null)).toBe(false)
      expect(utils.isString(undefined)).toBe(false)
      expect(utils.isString({})).toBe(false)
      expect(utils.isString([])).toBe(false)
    })

    test('isNumber should work correctly', () => {
      expect(utils.isNumber(123)).toBe(true)
      expect(utils.isNumber(0)).toBe(true)
      expect(utils.isNumber(-123)).toBe(true)
      expect(utils.isNumber(1.23)).toBe(true)
      expect(utils.isNumber(NaN)).toBe(false)
      expect(utils.isNumber(Infinity)).toBe(false)
      expect(utils.isNumber('123')).toBe(false)
      expect(utils.isNumber(null)).toBe(false)
    })

    test('isObject should work correctly', () => {
      expect(utils.isObject({})).toBe(true)
      expect(utils.isObject({ a: 1 })).toBe(true)
      expect(utils.isObject([])).toBe(false)
      expect(utils.isObject(null)).toBe(false)
      expect(utils.isObject(undefined)).toBe(false)
      expect(utils.isObject('string')).toBe(false)
      expect(utils.isObject(123)).toBe(false)
      expect(utils.isObject(new Date())).toBe(true)
    })

    test('isArray should work correctly', () => {
      expect(utils.isArray([])).toBe(true)
      expect(utils.isArray([1, 2, 3])).toBe(true)
      expect(utils.isArray(new Array(5))).toBe(true)
      expect(utils.isArray({})).toBe(false)
      expect(utils.isArray(null)).toBe(false)
      expect(utils.isArray('string')).toBe(false)
      expect(utils.isArray(123)).toBe(false)
      expect(utils.isArray(arguments)).toBe(false)
    })
  })

  describe('safeJsonParse function', () => {
    test('应该正确解析有效的JSON', () => {
      const result = utils.safeJsonParse('{"a": 1}', {})
      expect(result).toEqual({ a: 1 })
    })

    test('应该在JSON无效时返回fallback', () => {
      const fallback = { b: 2 }
      const result = utils.safeJsonParse('invalid json', fallback)
      expect(result).toEqual(fallback)
    })

    test('应该处理空字符串', () => {
      const fallback = { c: 3 }
      const result = utils.safeJsonParse('', fallback)
      expect(result).toEqual(fallback)
    })

    test('应该处理null', () => {
      const fallback = { d: 4 }
      const result = utils.safeJsonParse('null', fallback)
      expect(result).toBeNull()
    })
  })

  describe('String utilities', () => {
    test('truncate should work correctly', () => {
      expect(utils.truncate('hello world', 5)).toBe('he...')
      expect(utils.truncate('hello world', 20)).toBe('hello world')
      expect(utils.truncate('hello world', 5, '***')).toBe('he***')
      expect(utils.truncate('hi', 5)).toBe('hi')
    })

    test('capitalize should work correctly', () => {
      expect(utils.capitalize('hello')).toBe('Hello')
      expect(utils.capitalize('HELLO')).toBe('Hello')
      expect(utils.capitalize('hELLO')).toBe('Hello')
      expect(utils.capitalize('')).toBe('')
      expect(utils.capitalize('h')).toBe('H')
    })

    test('toCamelCase should work correctly', () => {
      expect(utils.toCamelCase('hello world')).toBe('helloWorld')
      expect(utils.toCamelCase('HELLO_WORLD')).toBe('helloWorld')
      expect(utils.toCamelCase('Hello-World')).toBe('helloWorld')
      expect(utils.toCamelCase('hELLO wORLD')).toBe('helloWorld')
    })

    test('toSnakeCase should work correctly', () => {
      expect(utils.toSnakeCase('helloWorld')).toBe('hello_world')
      expect(utils.toSnakeCase('HelloWorld')).toBe('hello_world')
      expect(utils.toSnakeCase('HELLO_WORLD')).toBe('h_e_l_l_o__w_o_r_l_d')
    })

    test('parseUrlParams should work correctly', () => {
      const url = 'https://example.com?a=1&b=test&c=true'
      const params = utils.parseUrlParams(url)
      expect(params).toEqual({
        a: '1',
        b: 'test',
        c: 'true',
      })
    })
  })

  describe('storage utilities', () => {
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })
      jest.clearAllMocks()
    })

    test('storage.get should work correctly', () => {
      mockLocalStorage.getItem.mockReturnValue('{"test": true}')
      const result = utils.storage.get('test')
      expect(result).toEqual({ test: true })
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test')
    })

    test('storage.get should return default value when item not found', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const result = utils.storage.get('test', 'default')
      expect(result).toBe('default')
    })

    test('storage.set should work correctly', () => {
      utils.storage.set('test', { test: true })
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', '{"test":true}')
    })

    test('storage.remove should work correctly', () => {
      utils.storage.remove('test')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test')
    })

    test('storage.clear should work correctly', () => {
      utils.storage.clear()
      expect(mockLocalStorage.clear).toHaveBeenCalled()
    })

    test('storage should handle errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage not available')
      })
      
      const result = utils.storage.get('test', 'fallback')
      expect(result).toBe('fallback')
    })

    test('storage should handle undefined window', () => {
      // 模拟服务器端渲染
      const originalWindow = global.window
      delete (global as any).window

      expect(utils.storage.get('test')).toBeNull()
      utils.storage.set('test', 'value') // 不应该抛出错误
      utils.storage.remove('test') // 不应该抛出错误
      utils.storage.clear() // 不应该抛出错误

      // 恢复
      global.window = originalWindow
    })
  })

  describe('memoryCache utilities', () => {
    beforeEach(() => {
      utils.memoryCache.clear()
    })

    test('memoryCache should work correctly', () => {
      utils.memoryCache.set('test', 'value', 1000)
      expect(utils.memoryCache.get('test')).toBe('value')
      expect(utils.memoryCache.has('test')).toBe(true)
    })

    test('memoryCache should expire items', async () => {
      utils.memoryCache.set('test', 'value', 100) // 100ms
      expect(utils.memoryCache.get('test')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(utils.memoryCache.get('test')).toBeNull()
    })

    test('memoryCache.delete should work correctly', () => {
      utils.memoryCache.set('test', 'value')
      expect(utils.memoryCache.delete('test')).toBe(true)
      expect(utils.memoryCache.has('test')).toBe(false)
      expect(utils.memoryCache.get('test')).toBeNull()
    })

    test('memoryCache.clear should work correctly', () => {
      utils.memoryCache.set('test1', 'value1')
      utils.memoryCache.set('test2', 'value2')
      utils.memoryCache.clear()
      
      expect(utils.memoryCache.has('test1')).toBe(false)
      expect(utils.memoryCache.has('test2')).toBe(false)
    })

    test('memoryCache should handle null/undefined values', () => {
      utils.memoryCache.set('null', null)
      utils.memoryCache.set('undefined', undefined)
      
      expect(utils.memoryCache.get('null')).toBeNull()
      expect(utils.memoryCache.get('undefined')).toBeUndefined()
    })
  })
})