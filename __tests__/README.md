# 单元测试使用指南

## 快速开始

### 1. 安装依赖

首先安装项目依赖（如果还没有安装）：

```bash
npm install
```

### 2. 运行测试

```bash
# 运行所有测试
npm test

# 监视模式运行（文件变化时自动重新测试）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI环境运行（一次性完成测试）
npm run test:ci
```

## 测试文件结构

```
__tests__/
├── components/          # 组件测试
│   ├── ErrorBoundary.test.tsx
│   ├── LotteryModal.test.tsx
│   └── ProductCard.test.tsx
├── hooks/              # Hook测试
│   └── useTelegram.test.ts
├── lib/               # 库函数测试
│   ├── performance.test.ts
│   ├── supabase.test.ts
│   └── telegram.test.ts
├── utils/             # 工具函数测试
│   └── lib-utils.test.ts
└── TEST_REPORT.md     # 详细测试报告
```

## 测试命令说明

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:watch` | 监视模式，文件变化时自动测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run test:ci` | CI环境运行，禁用监视模式 |

## 测试覆盖率报告

运行 `npm run test:coverage` 后，会在 `coverage/` 目录下生成详细的覆盖率报告：

- `coverage/index.html` - HTML格式报告
- `coverage/lcov.info` - LCOV格式数据
- `coverage/coverage-final.json` - JSON格式数据

## 添加新测试

### 创建测试文件

1. 在对应的 `__tests__` 子目录中创建测试文件
2. 文件名格式：`{组件名}.test.{ts|tsx}`
3. 使用 `describe()` 分组测试用例
4. 使用 `test()` 或 `it()` 定义具体测试

### 测试示例

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  test('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  test('should handle click events', () => {
    const mockClick = jest.fn()
    render(<MyComponent onClick={mockClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockClick).toHaveBeenCalledTimes(1)
  })
})
```

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 遵循 "should..." 格式
- 明确测试的预期行为

### 2. 测试结构
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // 设置测试环境
  })

  afterEach(() => {
    // 清理测试环境
  })

  test('should do something specific', () => {
    // Arrange - 准备测试数据
    const props = { ... }
    
    // Act - 执行操作
    render(<Component {...props} />)
    
    // Assert - 验证结果
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

### 3. Mock使用
```typescript
// Mock外部依赖
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
}))

// Mock特定函数
const mockFunction = jest.fn()
mockFunction.mockReturnValue('mocked result')

// 清除Mock
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 4. 异步测试
```typescript
test('should handle async operation', async () => {
  // 使用async/await
  const result = await asyncFunction()
  expect(result).toBe('expected')

  // 或者使用done回调
  test('should handle promise', (done) => {
    promiseFunction().then(result => {
      expect(result).toBe('expected')
      done()
    })
  })
})
```

## 常见问题

### Q: 测试失败怎么办？
A: 
1. 检查控制台错误信息
2. 验证Mock数据是否正确
3. 确认组件props和状态
4. 检查DOM元素选择器

### Q: 如何测试异步操作？
A: 
1. 使用 `async/await`
2. 或者 `done` 回调
3. 使用 `waitFor` 等待异步变化

### Q: 如何Mock复杂的依赖？
A: 
1. 使用 `jest.mock()` 模拟整个模块
2. 在 `jest.setup.js` 中设置全局Mock
3. 使用 `jest.fn()` 创建模拟函数

### Q: 测试覆盖率不够怎么办？
A: 
1. 运行 `npm run test:coverage` 查看报告
2. 识别未覆盖的代码分支
3. 添加相应的测试用例
4. 重点关注错误处理和边界情况

## 调试测试

### 1. 使用console.log
```typescript
test('debug test', () => {
  console.log('Debug info:', data)
  // 调试代码
})
```

### 2. 使用screen.debug()
```typescript
test('debug DOM', () => {
  render(<Component />)
  screen.debug() // 打印当前DOM
  // 或者
  screen.debug(screen.getByText('Hello')) // 打印特定元素
})
```

### 3. 使用VS Code调试器
- 在测试文件中设置断点
- 使用"Debug Jest Tests"配置
- 逐步执行调试代码

## 性能优化

### 1. 避免不必要的重新渲染
```typescript
// 好的做法：使用testId而不是复杂的查询
<div data-testid="submit-button">Submit</div>

// 避免：使用复杂的CSS选择器
// '.parent .child:nth-child(2) button'
```

### 2. 合理使用Mock
- 只Mock必要的外部依赖
- 避免Mock项目内部的简单函数
- 使用真实的测试数据

### 3. 测试隔离
- 每个测试都是独立的
- 不依赖其他测试的运行结果
- 适当使用beforeEach/afterEach

---

希望这份指南能帮助你更好地编写和维护单元测试！