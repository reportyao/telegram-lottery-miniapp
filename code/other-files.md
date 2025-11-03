# Telegram夺宝系统 - 其他重要文件

本文档包含了telegram-lottery-miniapp项目中其他重要目录和文件的详细内容。

## 目录

- [测试文件](#测试文件-__tests__)
- [机器人配置](#机器人配置-bot)
- [文档](#文档-docs)
- [国际化文件](#国际化文件-locales)
- [类型定义](#类型定义-types)
- [公共资源](#公共资源-public)

---

## 测试文件 (__tests__)

### 测试文档

#### README.md - 单元测试使用指南
```markdown
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
```

#### SUMMARY.md - 单元测试完成总结报告
```markdown
# 单元测试完成总结报告

## 项目概述

为telegram-lottery-miniapp项目成功创建了完整的单元测试体系，使用Jest和React Testing Library，覆盖主要组件、Hook和API功能。

## 完成的工作

### 1. 测试环境配置
- ✅ 配置Jest测试框架
- ✅ 设置React Testing Library
- ✅ 配置测试环境模拟（jsdom）
- ✅ 设置全局Mock（Telegram WebApp、Supabase等）
- ✅ 配置TypeScript支持

### 2. 测试文件创建

#### 配置文件
- `jest.config.js` - Jest主配置文件
- `jest.setup.js` - 测试环境设置和全局Mock

#### 测试文件
1. **Hook测试** (`__tests__/hooks/`)
   - `useTelegram.test.ts` - 28个测试用例

2. **组件测试** (`__tests__/components/`)
   - `ProductCard.test.tsx` - 23个测试用例
   - `LotteryModal.test.tsx` - 35个测试用例  
   - `ErrorBoundary.test.tsx` - 17个测试用例

3. **库函数测试** (`__tests__/lib/`)
   - `supabase.test.ts` - 31个测试用例
   - `performance.test.ts` - 26个测试用例
   - `telegram.test.ts` - 24个测试用例

4. **工具函数测试** (`__tests__/utils/`)
   - `lib-utils.test.ts` - 56个测试用例

### 3. 测试覆盖率统计

| 测试类型 | 文件数 | 测试用例数 | 覆盖率目标 |
|----------|--------|------------|------------|
| Hook测试 | 1 | 28 | ≥70% |
| 组件测试 | 3 | 75 | ≥70% |
| API测试 | 3 | 81 | ≥70% |
| 工具函数测试 | 1 | 56 | ≥70% |
| **总计** | **8** | **240** | **≥70%** |

### 4. 测试功能覆盖

#### useTelegram Hook
- ✅ Telegram环境检测和初始化
- ✅ 用户数据和主题处理
- ✅ 主按钮、返回按钮控制
- ✅ 触觉反馈和应用关闭
- ✅ 事件监听器管理
- ✅ 边界情况和错误处理

#### ProductCard组件
- ✅ 产品信息渲染和多语言支持
- ✅ 活跃轮次检测和状态显示
- ✅ 图像加载和错误处理
- ✅ 销售进度和状态颜色
- ✅ 模态框打开逻辑

#### LotteryModal组件
- ✅ 模态框渲染和内容显示
- ✅ 股数选择和金额计算
- ✅ 余额检查和网络状态验证
- ✅ 参与逻辑和错误处理
- ✅ 加载状态和重试机制

#### ErrorBoundary组件
- ✅ 错误捕获和显示
- ✅ 错误重试功能
- ✅ 开发/生产模式差异
- ✅ 无障碍访问支持

#### 数据库操作
- ✅ 用户、彩票、参与记录的CRUD操作
- ✅ 错误处理和重试机制
- ✅ 认证功能和权限验证
- ✅ 数据库错误映射

#### 性能工具函数
- ✅ 防抖和节流函数
- ✅ 参数传递和上下文
- ✅ 内存管理和异步支持

#### Telegram工具
- ✅ initData解析和验证
- ✅ HMAC签名和API集成
- ✅ 安全验证和错误处理

#### 通用工具函数
- ✅ 类名合并、货币格式化
- ✅ ID生成、深拷贝
- ✅ 类型守卫、JSON解析
- ✅ 字符串处理、存储工具

### 5. 测试质量保证

#### 错误处理测试
- ✅ 网络连接失败
- ✅ 请求超时和服务器错误
- ✅ 权限错误和认证失败
- ✅ 余额不足和业务逻辑错误
- ✅ TypeScript类型错误
- ✅ React组件错误

#### 边界情况测试
- ✅ 空值和undefined处理
- ✅ 极值数据和无效格式
- ✅ 超长字符串和复杂数据
- ✅ 服务端渲染和不同模式
- ✅ 异步操作和竞态条件

#### 环境模拟测试
- ✅ Telegram WebApp API
- ✅ Next.js路由系统
- ✅ Supabase客户端
- ✅ 本地存储和缓存
- ✅ Crypto和Performance API

### 6. 文档和配置

- ✅ `TEST_REPORT.md` - 详细测试报告
- ✅ `README.md` - 测试使用指南
- ✅ `package.json` - 测试脚本配置

### 7. 测试运行命令

```bash
npm test                    # 运行所有测试
npm run test:watch         # 监视模式运行
npm run test:coverage      # 生成覆盖率报告
npm run test:ci           # CI环境运行
```

## 技术特点

### 1. 现代化测试栈
- **Jest 29.7.0** - 成熟的JavaScript测试框架
- **React Testing Library** - 专注于用户行为的测试
- **TypeScript支持** - 类型安全的测试代码
- **jsdom环境** - 模拟浏览器环境

### 2. 完整的Mock系统
- Telegram WebApp API完整模拟
- Supabase客户端Mock
- Next.js路由系统Mock
- 全局环境变量和API Mock

### 3. 全面覆盖测试类型
- **单元测试** - 函数和组件级别的独立测试
- **集成测试** - 组件间交互测试
- **错误边界测试** - 错误处理和恢复测试
- **边界情况测试** - 异常情况处理测试

### 4. 最佳实践应用
- 测试隔离和独立性
- 清晰的测试描述
- 合理的Mock使用
- 异步操作正确处理
- 性能考虑和优化

## 项目价值

### 1. 质量保证
- **240个测试用例**确保代码质量
- **≥70%覆盖率**保证代码完整性
- **全面的错误处理测试**提升稳定性

### 2. 开发效率
- 快速反馈和错误定位
- 重构时的安全保障
- 新功能的可靠验证

### 3. 维护性
- 清晰的测试文档
- 标准化的测试结构
- 易扩展的测试框架

### 4. 团队协作
- 统一的测试规范
- 易于理解和维护的测试代码
- 完善的文档支持

## 未来改进方向

### 1. 测试扩展
- [ ] 集成测试编写
- [ ] E2E测试添加
- [ ] 视觉回归测试

### 2. 工具优化
- [ ] 测试数据生成器
- [ ] Mock服务完善
- [ ] 性能测试工具

### 3. 覆盖率提升
- [ ] 目标提升至80%
- [ ] 复杂逻辑覆盖
- [ ] 错误边界测试

## 结论

本次为telegram-lottery-miniapp项目创建的单元测试体系是一个完整、高质量、可持续的测试解决方案。通过240个测试用例全面覆盖了项目的核心功能，为项目的稳定性和可维护性提供了坚实保障。

测试体系遵循了行业最佳实践，具有良好的可扩展性和维护性，将为项目的长期发展提供重要支持。
```

#### TEST_REPORT.md - 详细测试报告
```markdown
# Telegram Lottery Miniapp - 单元测试报告

## 测试概述

本项目为telegram-lottery-miniapp创建了完整的单元测试覆盖，使用Jest和React Testing Library进行测试。

## 测试配置

### 环境配置
- **测试框架**: Jest 29.7.0
- **测试环境**: jsdom
- **测试库**: React Testing Library
- **测试类型**: 组件测试、Hook测试、API测试、工具函数测试

### 测试配置文件
- `jest.config.js` - Jest主配置文件
- `jest.setup.js` - 测试环境设置文件

## 测试覆盖范围

### 1. Hook 测试 (`__tests__/hooks/`)

#### useTelegram Hook (`useTelegram.test.ts`)
- ✅ Telegram环境检测和初始化
- ✅ 用户数据获取和处理
- ✅ 主题参数处理
- ✅ 主按钮控制方法
- ✅ 返回按钮控制
- ✅ 触觉反馈控制
- ✅ 应用关闭功能
- ✅ 事件监听器管理
- ✅ 边界情况和错误处理
- ✅ 非Telegram环境降级处理

**测试用例**: 28个测试用例

### 2. 组件测试 (`__tests__/components/`)

#### ProductCard组件 (`ProductCard.test.tsx`)
- ✅ 产品信息正确渲染
- ✅ 多语言本地化支持
- ✅ 活跃轮次检测
- ✅ 模态框打开逻辑
- ✅ 图像加载状态处理
- ✅ 错误图像处理
- ✅ 销售进度显示
- ✅ 状态颜色变化
- ✅ 事件冒泡防止
- ✅ 边界情况处理

**测试用例**: 23个测试用例

#### LotteryModal组件 (`LotteryModal.test.tsx`)
- ✅ 模态框内容渲染
- ✅ 股数选择和计算
- ✅ 金额计算和格式化
- ✅ 余额检查和警告
- ✅ 股票选择边界控制
- ✅ 网络状态检查
- ✅ 用户登录状态验证
- ✅ 参与逻辑实现
- ✅ 错误处理和显示
- ✅ 加载状态管理
- ✅ 重试机制
- ✅ 异步操作处理

**测试用例**: 35个测试用例

#### ErrorBoundary组件 (`ErrorBoundary.test.tsx`)
- ✅ 错误捕获和显示
- ✅ 错误重试功能
- ✅ 开发/生产模式差异
- ✅ React错误生命周期
- ✅ 无障碍访问支持
- ✅ 错误隔离功能
- ✅ 多种错误类型处理

**测试用例**: 17个测试用例

### 3. 库函数测试 (`__tests__/lib/`)

#### Supabase数据库操作 (`supabase.test.ts`)
- ✅ 用户操作CRUD
- ✅ 彩票操作CRUD
- ✅ 参与记录操作
- ✅ 错误处理机制
- ✅ 重试机制withRetry
- ✅ 事务处理withTransaction
- ✅ 认证功能
- ✅ 数据库错误映射

**测试用例**: 31个测试用例

#### 性能工具函数 (`performance.test.ts`)
- ✅ 防抖函数debounce
- ✅ 节流函数throttle
- ✅ 参数传递和上下文
- ✅ 边界情况处理
- ✅ 内存管理
- ✅ 异步函数支持
- ✅ 取消和刷新功能

**测试用例**: 26个测试用例

#### Telegram工具函数 (`telegram.test.ts`)
- ✅ initData解析
- ✅ HMAC签名生成
- ✅ 数据验证机制
- ✅ API集成测试
- ✅ 安全验证
- ✅ 错误处理
- ✅ 性能考虑

**测试用例**: 24个测试用例

### 4. 工具函数测试 (`__tests__/utils/`)

#### 通用工具函数 (`lib-utils.test.ts`)
- ✅ 类名合并cn()
- ✅ 货币格式化formatCurrency()
- ✅ 数字格式化formatNumber()
- ✅ ID生成器generateId()
- ✅ 深拷贝deepClone()
- ✅ 类型守卫函数
- ✅ 安全JSON解析
- ✅ 字符串工具函数
- ✅ 本地存储工具
- ✅ 内存缓存工具
- ✅ 睡眠函数sleep()

**测试用例**: 56个测试用例

## 测试统计

### 总体测试覆盖
- **总测试文件**: 8个
- **总测试用例**: 240个
- **组件测试**: 75个用例
- **Hook测试**: 28个用例
- **API测试**: 31个用例
- **工具函数测试**: 106个用例

### 代码覆盖率目标
- **分支覆盖率**: ≥70%
- **函数覆盖率**: ≥70%
- **行覆盖率**: ≥70%
- **语句覆盖率**: ≥70%

## 测试运行方式

### 安装依赖（需要手动执行）
```bash
npm install
```

### 运行所有测试
```bash
npm test
```

### 监视模式运行
```bash
npm run test:watch
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

### CI环境运行
```bash
npm run test:ci
```

## 测试环境模拟

### 全局模拟
- ✅ Telegram WebApp API
- ✅ Next.js路由
- ✅ Supabase客户端
- ✅ 本地存储
- ✅ Crypto API
- ✅ 性能API

### 测试数据
- ✅ 模拟用户数据
- ✅ 模拟产品数据
- ✅ 模拟彩票轮次数据
- ✅ 模拟错误情况

## 错误处理测试

### 网络错误
- ✅ 网络连接失败
- ✅ 请求超时
- ✅ 服务器错误
- ✅ 权限错误

### 业务逻辑错误
- ✅ 余额不足
- ✅ 股票不足
- ✅ 无效参数
- ✅ 用户未登录

### 系统错误
- ✅ TypeScript类型错误
- ✅ React组件错误
- ✅ 异步操作错误
- ✅ 内存泄漏

## 边界情况测试

### 输入验证
- ✅ 空值和undefined
- ✅ 极值数据
- ✅ 无效格式数据
- ✅ 超长字符串

### 环境差异
- ✅ 服务端渲染
- ✅ 开发/生产模式
- ✅ 不同浏览器环境
- ✅ 网络状况差异

### 性能边界
- ✅ 大量数据处理
- ✅ 频繁调用
- ✅ 内存使用
- ✅ 响应时间

## 测试最佳实践

### 1. 隔离性
- 每个测试用例都是独立的
- 使用beforeEach/afterEach进行清理
- Mock外部依赖

### 2. 可读性
- 使用描述性的测试名称
- 测试代码注释清晰
- 测试数据结构清晰

### 3. 可靠性
- 避免依赖特定顺序
- 处理异步操作
- 错误情况覆盖完整

### 4. 维护性
- 测试数据集中管理
- 公共工具函数抽取
- 配置集中管理

## 持续集成

### 质量门禁
- 所有测试必须通过
- 代码覆盖率不能下降
- 新功能必须有相应测试

### 性能监控
- 测试执行时间监控
- 内存使用监控
- 覆盖率趋势监控

## 未来改进

### 测试扩展
- 集成测试编写
- E2E测试添加
- 视觉回归测试

### 工具优化
- 测试数据生成器
- Mock服务完善
- 性能测试工具

### 覆盖率提升
- 目标提升至80%
- 复杂逻辑覆盖
- 错误边界测试

---

## 结论

本项目已建立了完整的单元测试体系，覆盖了主要组件、Hook、API和工具函数。测试代码质量高，覆盖面广，为项目的稳定性和可维护性提供了坚实保障。通过这些测试，可以有效预防回归错误，确保代码质量和用户体验。
```

### 测试组件示例

#### ErrorBoundary.test.tsx
```typescript
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
  // ... 更多测试用例
})
```

#### LotteryModal.test.tsx
```typescript
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
Object.defineProperty(window.navigator, 'onLine', {
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
  stock: 10,
  category: 'electronics',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  active_rounds: [],
}

const mockLotteryRound: LotteryRound = {
  id: '1',
  status: 'active',
  // ... 更多属性
}

describe('LotteryModal Component', () => {
  // ... 测试用例
})
```

#### useTelegram.test.ts
```typescript
import { renderHook, act } from '@testing-library/react'
import { useTelegram } from '@/hooks/useTelegram'

// 测试数据
const mockTelegramUser = {
  id: 123456,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en',
  is_premium: true,
  photo_url: 'https://example.com/photo.jpg',
}

const mockThemeParams = {
  bg_color: '#ffffff',
  text_color: '#000000',
  hint_color: '#666666',
  link_color: '#3399ff',
  button_color: '#3399ff',
  button_text_color: '#ffffff',
  secondary_bg_color: '#f8f9fa',
  header_bg_color: '#ffffff',
  accent_text_color: '#000000',
}

describe('useTelegram Hook', () => {
  beforeEach(() => {
    // 重置模拟
    global.window.Telegram = {
      WebApp: {
        initData: 'test_init_data',
        initDataUnsafe: {
          user: mockTelegramUser,
          auth_date: 1234567890,
          hash: 'test_hash',
        },
        ready: jest.fn(),
        expand: jest.fn(),
        close: jest.fn(),
        isExpanded: true,
        viewportHeight: 800,
        viewportStableHeight: 800,
        themeParams: mockThemeParams,
        colorScheme: 'light',
        isClosingConfirmationEnabled: false,
        setHeaderColor: jest.fn(),
        setBackgroundColor: jest.fn(),
        enableClosingConfirmation: jest.fn(),
        disableClosingConfirmation: jest.fn(),
        // ... 更多模拟方法
      },
    }
  })

  test('应该正确初始化Telegram WebApp', () => {
    // ... 测试用例
  })
})
```

---

## 机器人配置 (bot)

### bot_config.py
```python
# 增强版 Telegram Bot 配置

import os
import asyncio
from enhanced_bot import TelegramBot

# 环境变量配置
class BotConfig:
    # Bot Token
    BOT_TOKEN = os.getenv('BOT_TOKEN', 'your_bot_token_here')
    
    # Supabase 配置
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'your_supabase_url')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'your_service_role_key')
    
    # Web App URL
    WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://your-domain.vercel.app')
    
    # 支持的语言
    SUPPORTED_LANGUAGES = ['zh', 'en', 'ru', 'tg']
    
    # 默认设置
    DEFAULT_LANGUAGE = 'en'
    DEFAULT_BALANCE = 0.0
    REFERRAL_BONUS_PERCENT = 5.0
    RESALE_FEE_PERCENT = 2.0
    
    # 通知设置
    LOW_BALANCE_THRESHOLD = 5.0  # $5
    LOTTERY_CHECK_INTERVAL = 3600  # 1小时
    BALANCE_CHECK_INTERVAL = 21600  # 6小时
    
    @classmethod
    def validate_config(cls):
        """验证配置"""
        required_vars = ['BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# 部署配置
DEPLOYMENT_CONFIG = {
    'production': {
        'web_app_url': 'https://your-production-domain.vercel.app',
        'log_level': 'INFO',
        'features': ['notifications', 'auto_responses', 'multilang']
    },
    'development': {
        'web_app_url': 'http://localhost:3000',
        'log_level': 'DEBUG',
        'features': ['notifications', 'auto_responses', 'multilang', 'debug_mode']
    }
}

# 命令配置
BOT_COMMANDS = [
    ('start', 'Start the bot and register'),
    ('help', 'Get help and commands list'),
    ('products', 'View available products'),
    ('profile', 'Open profile center'),
    ('balance', 'Check your balance'),
    ('orders', 'View your orders'),
    ('referral', 'Invite friends and earn rewards'),
    ('resales', 'Access resale market'),
    ('balance_top', 'Quick top up'),
    ('my_tickets', 'View my lottery tickets')
]

# 按钮配置
BOT_KEYBOARDS = {
    'main_menu': [
        ['🎰 Open App', 'products'],
        ['👤 Profile', 'profile'],
        ['💰 Balance', 'balance'],
        ['📦 Orders', 'orders'],
        ['🛒 Resales', 'resales']
    ],
    'quick_actions': [
        ['💳 Top Up', 'topup'],
        ['🎫 Buy Tickets', 'products'],
        ['👥 Invite Friends', 'referral']
    ]
}

# 数据库表结构要求
REQUIRED_TABLES = [
    'users',
    'products',
    'lottery_rounds',
    'participations',
    'orders',
    'transactions',
    'referrals',
    'system_settings',
    'posts',
    'post_likes',
    'post_comments',
    'admins',
    'resales',
    'resale_transactions'
]

# 必需的 Edge Functions
REQUIRED_FUNCTIONS = [
    'telegram-auth',
    'participate-lottery',
    'get-products',
    'user-profile',
    'create-order',
    'posts-manage',
    'auto-draw-lottery',
    'admin-api',
    'resale-api'
]

# 定时任务配置
SCHEDULED_TASKS = {
    'lottery_check': {
        'function': 'auto-draw-lottery',
        'schedule': '0 */6 * * *',  # 每6小时
        'description': 'Check and draw completed lotteries'
    },
    'winner_notification': {
        'function': 'notify_winners',
        'schedule': '*/15 * * * *',  # 每15分钟
        'description': 'Send win notifications'
    },
    'balance_check': {
        'function': 'check_low_balances',
        'schedule': '0 */6 * * *',  # 每6小时
        'description': 'Notify low balance users'
    }
}

# Webhook 配置
WEBHOOK_CONFIG = {
    'url': f'{os.getenv("WEBHOOK_URL", "https://your-bot-domain.com")}/webhook',
    'drop_pending_updates': True,
    'allowed_updates': ['message', 'callback_query', 'inline_query', 'pre_checkout_query', 'shipping_query', 'poll', 'poll_answer']
}

# 安全配置
SECURITY_CONFIG = {
    'max_message_length': 4096,
    'rate_limit': {
        'messages_per_minute': 20,
        'callback_queries_per_minute': 10
    },
    'allowed_user_commands': BOT_COMMANDS,
    'blocked_users': [],  # Telegram user IDs to block
    'admin_users': []     # Telegram user IDs with admin privileges
}

# 日志配置
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'bot.log',
            'maxBytes': 10240000,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file'],
    },
    'loggers': {
        'telegram': {
            'level': 'INFO',
            'handlers': ['console', 'file'],
            'propagate': False,
        },
    },
}

# 性能配置
PERFORMANCE_CONFIG = {
    'max_concurrent_updates': 10,
    'request_timeout': 30,
    'retry_attempts': 3,
    'retry_delay': 1,  # seconds
    'session_timeout': 300,  # 5 minutes
    'memory_limit': '512MB'
}

# 监控配置
MONITORING_CONFIG = {
    'health_check_endpoint': '/health',
    'metrics_endpoint': '/metrics',
    'ping_interval': 30,  # seconds
    'error_threshold': 5,  # errors per minute
    'response_time_threshold': 5000  # milliseconds
}

# 缓存配置
CACHE_CONFIG = {
    'redis_url': os.getenv('REDIS_URL'),
    'default_ttl': 3600,  # 1 hour
    'user_data_ttl': 1800,  # 30 minutes
    'product_cache_ttl': 900,  # 15 minutes
    'balance_cache_ttl': 60   # 1 minute
}
```

### deploy.sh
```bash
#!/bin/bash

# Telegram Bot 部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env_vars() {
    print_info "检查环境变量..."
    
    required_vars=(
        "BOT_TOKEN"
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "WEB_APP_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "环境变量 $var 未设置"
            exit 1
        fi
        print_success "$var 已设置"
    done
}

# 安装依赖
install_dependencies() {
    print_info "安装 Python 依赖..."
    
    # 检查 Python 版本
    python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
    required_version="3.8"
    
    if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
        print_success "Python 版本检查通过: $python_version"
    else
        print_error "需要 Python 3.8 或更高版本，当前版本: $python_version"
        exit 1
    fi
    
    # 升级 pip
    python3 -m pip install --upgrade pip
    
    # 安装依赖
    python3 -m pip install -r requirements.txt
    
    print_success "依赖安装完成"
}

# 检查 Supabase 连接
check_supabase() {
    print_info "检查 Supabase 连接..."
    
    python3 -c "
import os
from supabase import create_client

try:
    supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
    result = supabase.table('users').select('count').execute()
    print('Supabase 连接正常')
except Exception as e:
    print(f'Supabase 连接失败: {e}')
    exit(1)
"
    
    print_success "Supabase 连接正常"
}

# 测试 Bot Token
test_bot_token() {
    print_info "测试 Bot Token..."
    
    python3 -c "
import os
import requests

token = os.getenv('BOT_TOKEN')
url = f'https://api.telegram.org/bot{token}/getMe'

try:
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            bot_info = data.get('result', {})
            print(f'Bot Token 有效: @{bot_info.get(\"username\", \"Unknown\")}')
        else:
            print('Bot Token 验证失败')
            exit(1)
    else:
        print(f'HTTP 错误: {response.status_code}')
        exit(1)
except Exception as e:
    print(f'Bot Token 测试失败: {e}')
    exit(1)
"
    
    print_success "Bot Token 测试通过"
}

# 设置 Bot 命令
setup_bot_commands() {
    print_info "设置 Bot 命令..."
    
    python3 -c "
import os
import requests

token = os.getenv('BOT_TOKEN')
commands = [
    {'command': 'start', 'description': 'Start the bot and register'},
    {'command': 'help', 'description': 'Get help and commands list'},
    {'command': 'products', 'description': 'View available products'},
    {'command': 'profile', 'description': 'Open profile center'},
    {'command': 'balance', 'description': 'Check your balance'},
    {'command': 'orders', 'description': 'View your orders'},
    {'command': 'referral', 'description': 'Invite friends and earn rewards'},
    {'command': 'resales', 'description': 'Access resale market'},
    {'command': 'balance_top', 'description': 'Quick top up'},
    {'command': 'my_tickets', 'description': 'View my lottery tickets'}
]

url = f'https://api.telegram.org/bot{token}/setMyCommands'

try:
    response = requests.post(url, json={'commands': commands})
    if response.status_code == 200:
        print('Bot 命令设置成功')
    else:
        print(f'Bot 命令设置失败: {response.status_code}')
except Exception as e:
    print(f'Bot 命令设置错误: {e}')
"
    
    print_success "Bot 命令设置完成"
}

# 创建系统服务文件
create_systemd_service() {
    print_info "创建 systemd 服务..."
    
    # 获取当前用户
    current_user=$(whoami)
    
    # 创建服务文件
    sudo tee /etc/systemd/system/telegram-lottery-bot.service > /dev/null <<EOF
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=$current_user
WorkingDirectory=$(pwd)
Environment=BOT_TOKEN=$BOT_TOKEN
Environment=SUPABASE_URL=$SUPABASE_URL
Environment=SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
Environment=WEB_APP_URL=$WEB_APP_URL
ExecStart=/usr/bin/python3 enhanced_bot.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=telegram-bot

[Install]
WantedBy=multi-user.target
EOF

    print_success "systemd 服务文件已创建"
}

# 主函数
main() {
    echo "======================================"
    echo "    Telegram Lottery Bot 部署脚本"
    echo "======================================"
    echo
    
    # 标准化部署
    check_env_vars
    install_dependencies
    check_supabase
    test_bot_token
    setup_bot_commands
    create_systemd_service
    
    echo
    print_success "Bot 部署完成！"
    echo
    echo "管理命令："
    echo "  启动: sudo systemctl start telegram-lottery-bot"
    echo "  停止: sudo systemctl stop telegram-lottery-bot"
    echo "  重启: sudo systemctl restart telegram-lottery-bot"
    echo "  状态: sudo systemctl status telegram-lottery-bot"
    echo "  日志: sudo journalctl -u telegram-lottery-bot -f"
}

# 执行主函数
main "$@"
```

### enhanced_bot.py (部分)
```python
import os
import logging
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
import supabase

# 配置
BOT_TOKEN = os.getenv('BOT_TOKEN')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://telegram-miniapp-demo.vercel.app')

# 日志配置
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 消息模板
MESSAGES = {
    'zh': {
        'welcome': '欢迎来到夺宝平台！🎉\n\n点击下方按钮开始您的夺宝之旅！',
        'help': '''📱 夺宝平台帮助

📋 如何参与：
1️⃣ 选择心仪商品
2️⃣ 购买夺宝份数
3️⃣ 等待开奖
4️⃣ 查看中奖结果

🔧 命令列表：
/start - 启动应用
/products - 查看商品
/profile - 个人中心
/balance - 查看余额
/orders - 我的订单
/referral - 邀请好友
/resales - 转售市场
/help - 获取帮助

💰 需要帮助？联系客服：@your_support''',
        'balance_low': '⚠️ 您的余额不足，请及时充值！',
        'won': '🎉 恭喜您中奖了！\n\n奖品：{product_name}\n价值：{product_price}\n\n请在个人中心查看详细奖品信息。',
        'resale_success': '✅ 您的份额已成功转售！\n\n转售份数：{shares} 份\n收入：{amount}',
        'topup_success': '💰 充值成功！\n\n充值金额：{amount}\n当前余额：{balance}',
        'participation_success': '🎯 参与成功！\n\n商品：{product_name}\n购买份数：{shares} 份\n花费：{amount}',
        'register_success': '✅ 注册成功！\n\n欢迎 {username} 加入夺宝平台！\n您可以开始购买夺宝份额了！'
    },
    'en': {
        'welcome': 'Welcome to the lottery platform! 🎉\n\nClick the button below to start your winning journey!',
        'help': '''📱 Lottery Platform Help

📋 How to participate:
1️⃣ Select desired products
2️⃣ Buy lottery shares
3️⃣ Wait for drawing
4️⃣ Check winning results

🔧 Commands:
/start - Start app
/products - View products
/profile - Profile center
/balance - Check balance
/orders - My orders
/referral - Invite friends
/resales - Resale market
/help - Get help

💰 Need help? Contact support: @your_support''',
        'balance_low': '⚠️ Your balance is low, please top up!',
        'won': '🎉 Congratulations! You won!\n\nPrize: {product_name}\nValue: {product_price}\n\nCheck your profile for details.',
        'resale_success': '✅ Your shares sold successfully!\n\nShares sold: {shares}\nEarnings: {amount}',
        'topup_success': '💰 Top up successful!\n\nAmount: {amount}\nCurrent balance: {balance}',
        'participation_success': '🎯 Participation successful!\n\nProduct: {product_name}\nShares: {shares}\nCost: {amount}',
        'register_success': '✅ Registration successful!\n\nWelcome {username} to the lottery platform!\nYou can start buying lottery shares!'
    }
}

class TelegramBot:
    def __init__(self):
        self.app = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
        
        # Supabase 客户端
        self.supabase = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # 后台任务管理
        self.background_tasks: set[asyncio.Task] = set()
    
    def setup_handlers(self):
        """设置消息处理器"""
        # 命令处理器
        self.app.add_handler(CommandHandler("start", self.start_command))
        self.app.add_handler(CommandHandler("help", self.help_command))
        self.app.add_handler(CommandHandler("products", self.products_command))
```

### requirements.txt
```text
# Telegram Bot Requirements
python-telegram-bot==20.7
supabase==2.3.0
aiohttp==3.9.1
asyncio
python-dotenv==1.0.0
psutil==5.9.6
redis==5.0.1
prometheus-client==0.19.0
```

---

## 文档 (docs)

### API.md - API文档
```markdown
# API文档

## 概述

本文档描述了Telegram MiniApp夺宝系统的所有API端点。

## 基础信息

- **Base URL**: `https://mftfgofnosakobjfpzss.supabase.co`
- **Edge Functions URL**: `https://mftfgofnosakobjfpzss.supabase.co/functions/v1`
- **认证方式**: Bearer Token（Supabase Anon Key）

## Edge Functions

### 1. Telegram用户认证

**端点**: `POST /functions/v1/telegram-auth`

**描述**: 验证Telegram用户并创建或更新用户记录

**请求体**:
```json
{
  "telegram_id": 123456789,
  "username": "john_doe",
  "full_name": "John Doe",
  "language": "en"
}
```

**响应**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "telegram_id": 123456789,
      "username": "john_doe",
      "full_name": "John Doe",
      "balance": 0,
      "language": "en",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "is_new": true
  }
}
```

**错误响应**:
```json
{
  "error": {
    "code": "TELEGRAM_AUTH_FAILED",
    "message": "Error description"
  }
}
```

---

### 2. 参与夺宝

**端点**: `POST /functions/v1/participate-lottery`

**描述**: 用户参与指定的夺宝轮次

**请求体**:
```json
{
  "user_id": "uuid",
  "lottery_round_id": "uuid",
  "shares_count": 5
}
```

**响应**:
```json
{
  "data": {
    "participation": {
      "id": "uuid",
      "user_id": "uuid",
      "lottery_round_id": "uuid",
      "shares_count": 5,
      "amount_paid": 50.00,
      "created_at": "2025-01-01T00:00:00Z"
    },
    "new_balance": 950.00,
    "lottery_round": {
      "id": "uuid",
      "sold_shares": 50,
      "status": "active"
    }
  }
}
```

**错误响应**:
```json
{
  "error": {
    "code": "PARTICIPATE_FAILED",
    "message": "Insufficient balance"
  }
}
```

**可能的错误**:
- `Lottery round not found`
- `Lottery round is not active`
- `Only X shares available`
- `Insufficient balance`

---

### 3. 获取商品列表

**端点**: `GET /functions/v1/get-products`

**描述**: 获取所有商品及其活跃的夺宝轮次

**查询参数**:
- `category` (可选): 商品分类
- `status` (可选): 商品状态（默认: active）

**示例**:
```
GET /functions/v1/get-products?category=electronics&status=active
```

**响应**:
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": {
          "zh": "iPhone 15 Pro Max",
          "en": "iPhone 15 Pro Max",
          "tg": "iPhone 15 Pro Max",
          "ru": "iPhone 15 Pro Max"
        },
        "description": {
          "zh": "最新款苹果旗舰手机",
          "en": "Latest Apple flagship smartphone"
        },
        "price": 999.99,
        "stock": 10,
        "category": "electronics",
        "image_url": "https://...",
        "status": "active",
        "active_rounds": [
          {
            "id": "uuid",
            "product_id": "uuid",
            "total_shares": 100,
            "sold_shares": 25,
            "price_per_share": 10.00,
            "status": "active",
            "draw_date": null,
            "winner_id": null
          }
        ]
      }
    ],
    "count": 3
  }
}
```

---

### 4. 获取用户信息

**端点**: `GET /functions/v1/user-profile`

**描述**: 获取用户详细信息和统计数据

**查询参数**:
- `user_id` (可选): 用户UUID
- `telegram_id` (可选): Telegram用户ID

**示例**:
```
GET /functions/v1/user-profile?user_id=uuid
```

**响应**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "telegram_id": 123456789,
      "username": "john_doe",
      "full_name": "John Doe",
      "balance": 1000.00,
      "language": "en"
    },
    "stats": {
      "total_participations": 15,
      "total_wins": 2,
      "total_spent": 500.00,
      "total_referrals": 5,
      "total_referral_rewards": 25.00
    },
    "recent_participations": [...],
    "wins": [...]
  }
}
```

---

## 直接数据库访问（REST API）

使用Supabase的自动生成REST API。

### 基础URL
```
https://mftfgofnosakobjfpzss.supabase.co/rest/v1
```

### 认证
```
Headers:
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

### 示例查询

#### 获取所有商品
```bash
GET /rest/v1/products?select=*
```

#### 获取用户参与记录
```bash
GET /rest/v1/participations?user_id=eq.uuid&select=*,lottery_rounds(*)
```

#### 获取夺宝轮次详情
```bash
GET /rest/v1/lottery_rounds?id=eq.uuid&select=*,products(*)
```

#### 创建订单
```bash
POST /rest/v1/orders
Content-Type: application/json

{
  "user_id": "uuid",
  "total_amount": 100.00,
  "status": "pending",
  "payment_method": "card"
}
```

---

## 数据库函数

### 1. 更新用户余额

**函数**: `update_user_balance`

**描述**: 安全地更新用户余额并记录交易

**参数**:
```sql
SELECT update_user_balance(
  p_user_id := 'uuid',
  p_amount := 100.00,
  p_type := 'deposit',
  p_description := 'Top up balance',
  p_reference_id := NULL
);
```

**返回值**: `boolean` (成功/失败)

---

### 2. 自动开奖

**函数**: `draw_lottery`

**描述**: 为指定夺宝轮次随机选择中奖者

**参数**:
```sql
SELECT draw_lottery('lottery-round-uuid');
```

**返回值**: `uuid` (中奖者用户ID)

---

## 错误代码

| 错误码 | 描述 | 解决方法 |
|--------|------|----------|
| `TELEGRAM_AUTH_FAILED` | Telegram认证失败 | 检查用户数据是否完整 |
| `PARTICIPATE_FAILED` | 参与夺宝失败 | 检查余额和夺宝轮次状态 |
| `GET_PRODUCTS_FAILED` | 获取商品失败 | 检查数据库连接 |
| `GET_PROFILE_FAILED` | 获取用户信息失败 | 确认用户存在 |
| `INSUFFICIENT_BALANCE` | 余额不足 | 提示用户充值 |
| `INVALID_SHARES` | 无效的份数 | 检查份数范围 |

---

## 数据模型

### User（用户）
```typescript
{
  id: string (uuid)
  telegram_id: number (unique)
  username: string | null
  full_name: string | null
  balance: number (decimal)
  language: string
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### Product（商品）
```typescript
{
  id: string (uuid)
  name: Record<string, string> (jsonb)
  description: Record<string, string> (jsonb)
  price: number (decimal)
  stock: number
  category: string
  image_url: string
  status: string
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### LotteryRound（夺宝轮次）
```typescript
{
  id: string (uuid)
  product_id: string (uuid)
  total_shares: number
  sold_shares: number
  price_per_share: number (decimal)
  status: 'active' | 'ready_to_draw' | 'completed' | 'cancelled'
  draw_date: string | null (timestamp)
  winner_id: string | null (uuid)
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### Participation（参与记录）
```typescript
{
  id: string (uuid)
  user_id: string (uuid)
  lottery_round_id: string (uuid)
  shares_count: number
  amount_paid: number (decimal)
  created_at: string (timestamp)
}
```

---

## 速率限制

目前未实施速率限制，但建议：
- 每个用户每分钟最多10次API调用
- 批量操作建议使用批处理接口

---

## WebSocket / Realtime

使用Supabase Realtime订阅数据变化：

```javascript
import { supabase } from './lib/supabase'

// 订阅夺宝轮次更新
const channel = supabase
  .channel('lottery-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'lottery_rounds'
    },
    (payload) => {
      console.log('Lottery updated:', payload)
    }
  )
  .subscribe()
```

---

## 测试端点

### 使用cURL

```bash
# 获取商品列表
curl -X GET \
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# 参与夺宝
curl -X POST \
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/participate-lottery' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "lottery_round_id": "uuid",
    "shares_count": 5
  }'
```

### 使用JavaScript

```javascript
// 获取商品
const response = await fetch(
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products',
  {
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY'
    }
  }
)
const data = await response.json()
```

---

## 版本历史

- **v1.0.0** (2025-01-01): 初始版本
  - 基础夺宝功能
  - 用户管理
  - 推荐系统

---

## 支持

如有问题，请：
1. 查看错误代码表
2. 检查请求格式
3. 查看Supabase日志
4. 提交GitHub Issue
```

### DEPLOYMENT.md - 部署指南
```markdown
# 部署指南

## 概述

本指南将帮助您将Telegram MiniApp夺宝系统部署到生产环境。

## 前置要求

- Node.js 18+
- pnpm 8+
- Vercel账号（或其他Next.js托管平台）
- Telegram Bot Token
- Supabase项目（已配置）

## 部署步骤

### 1. 准备代码

```bash
# 克隆或下载项目
cd telegram-lottery-miniapp

# 安装依赖
pnpm install

# 构建测试
pnpm build
```

### 2. 配置Supabase（已完成）

系统已配置以下内容：
- ✅ 8个数据库表
- ✅ RLS安全策略
- ✅ 4个Edge Functions
- ✅ 2个Storage Buckets
- ✅ 测试数据

Supabase URL: `https://mftfgofnosakobjfpzss.supabase.co`

### 3. Vercel部署

#### 方法1: 通过GitHub（推荐）

1. 推送代码到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/telegram-lottery-miniapp.git
git push -u origin main
```

2. 在Vercel中导入
- 访问 https://vercel.com/new
- 选择你的GitHub仓库
- 点击"Import"
- Vercel会自动检测Next.js项目
- 点击"Deploy"

3. 等待部署完成
- 部署完成后会获得一个URL（例如：`https://telegram-lottery-miniapp.vercel.app`）

#### 方法2: 通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 4. 配置Telegram Bot

#### 创建Bot
```
1. 打开Telegram，搜索 @BotFather
2. 发送 /newbot
3. 按提示创建Bot
4. 保存Bot Token
```

#### 配置Web App
```
/setmenubutton
选择你的bot
输入：
打开应用 - https://your-domain.vercel.app
```

#### 设置命令
```
/setcommands
输入：
start - 启动应用
help - 获取帮助
products - 查看商品
profile - 个人中心
orders - 我的订单
referral - 邀请好友
```

### 5. 运行Telegram Bot服务器

参考 `docs/TELEGRAM_BOT_SETUP.md` 配置Bot服务器。

简单的运行方式：
```bash
# 创建bot.py（参考TELEGRAM_BOT_SETUP.md）
python bot.py
```

生产环境建议：
- 使用systemd管理进程
- 使用Docker容器化
- 配置自动重启
- 实现日志记录

### 6. 测试部署

#### 功能测试清单

- [ ] Telegram Bot可以正常启动
- [ ] 点击菜单按钮可以打开WebApp
- [ ] 用户身份验证正常
- [ ] 可以浏览商品列表
- [ ] 可以参与夺宝（测试账户需要有余额）
- [ ] 个人中心显示正常
- [ ] 订单记录显示正常
- [ ] 推荐链接可以复制
- [ ] 多语言切换正常
- [ ] 移动端响应式正常

#### 测试脚本

在浏览器控制台中运行：
```javascript
// 测试Telegram WebApp
console.log('Telegram WebApp:', window.Telegram?.WebApp)
console.log('User:', window.Telegram?.WebApp.initDataUnsafe.user)

// 测试Supabase连接
fetch('https://mftfgofnosakobjfpzss.supabase.co/rest/v1/products?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

### 7. 监控和维护

#### Vercel监控
- 访问 Vercel Dashboard
- 查看部署日志
- 监控性能指标
- 设置告警

#### Supabase监控
- Supabase Dashboard > Logs
- 查看API请求
- 监控数据库性能
- 查看Edge Function日志

#### 数据库维护

定期任务：
```sql
-- 清理过期数据（可选）
DELETE FROM transactions WHERE created_at < NOW() - INTERVAL '1 year';

-- 数据库优化
VACUUM ANALYZE;

-- 检查索引
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 8. 性能优化

#### Next.js优化
- 启用图片优化
- 使用动态导入
- 实现缓存策略

#### Supabase优化
- 添加适当的索引
- 使用连接池
- 启用缓存

#### CDN配置
Vercel自动提供全球CDN，但可以：
- 优化图片大小
- 使用WebP格式
- 实现懒加载

### 9. 安全加固

#### 环境变量（生产环境）
虽然当前是硬编码，建议改为环境变量：
```bash
# Vercel环境变量设置
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 安全检查清单
- [ ] 启用HTTPS（Vercel自动）
- [ ] 配置CORS策略
- [ ] 启用RLS策略
- [ ] 验证Telegram initData
- [ ] 限制API调用频率
- [ ] 保护敏感端点

### 10. 备份策略

#### 数据库备份
Supabase提供自动备份，但建议：
```bash
# 手动备份
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# 定期备份脚本
0 2 * * * /path/to/backup-script.sh
```

#### 代码备份
- 使用Git进行版本控制
- 定期推送到远程仓库
- 标记重要版本

## 故障排查

### 常见问题

#### 1. WebApp无法加载
```
检查项：
- 确认Vercel部署成功
- 检查域名DNS配置
- 验证SSL证书
- 查看浏览器控制台错误
```

#### 2. 用户认证失败
```
检查项：
- Telegram Bot Token是否正确
- initData是否有效
- Edge Function是否正常运行
- Supabase凭证是否正确
```

#### 3. 参与夺宝失败
```
检查项：
- 用户余额是否充足
- 夺宝轮次状态是否为active
- RLS策略是否正确
- Edge Function日志
```

### 日志查看

#### Vercel日志
```bash
vercel logs [deployment-url]
```

#### Supabase日志
在Dashboard中查看：
- API Logs
- Edge Function Logs
- Database Logs

### 性能问题

如果遇到性能问题：
1. 检查数据库查询效率
2. 添加必要的索引
3. 优化Edge Function
4. 使用缓存策略
5. 考虑升级Supabase套餐

## 扩展和升级

### 添加新功能
1. 在本地开发和测试
2. 推送到GitHub
3. Vercel自动部署
4. 测试生产环境

### 数据库迁移
```sql
-- 创建迁移文件
-- 在Supabase SQL Editor中执行
-- 或使用Supabase CLI
```

### Edge Function更新
```bash
# 更新函数代码
# 使用Supabase CLI重新部署
supabase functions deploy function-name
```

## 生产环境清单

部署前确认：
- [ ] 所有功能测试通过
- [ ] 安全策略配置正确
- [ ] 备份策略已实施
- [ ] 监控和告警已设置
- [ ] 文档已更新
- [ ] 团队成员已培训
- [ ] 回滚方案已准备

## 联系支持

如遇到问题：
1. 查看本文档故障排查部分
2. 查看Vercel和Supabase文档
3. 在GitHub Issues中提问
4. 联系技术支持

## 成本估算

### Vercel
- Hobby Plan: 免费
- Pro Plan: $20/月（推荐生产环境）

### Supabase
- Free Tier: 适合开发和小规模使用
- Pro Plan: $25/月（推荐生产环境）
- 按需扩展

### 总计
- 开发/测试: $0/月
- 小规模生产: $0-45/月
- 中等规模生产: $45-100/月

## 后续优化

1. 实现支付集成（塔吉克斯坦本地支付）
2. 添加管理后台
3. 实现晒单功能
4. 优化推荐系统
5. 添加实时通知
6. 实现自动开奖
7. 添加数据分析面板
```

### TELEGRAM_BOT_SETUP.md - Telegram Bot配置指南
```markdown
# Telegram Bot 配置指南

## 1. 创建Bot

### 步骤1: 与BotFather对话
1. 在Telegram中搜索 `@BotFather`
2. 发送 `/newbot`
3. 输入Bot名称（例如：Tajikistan Lottery Bot）
4. 输入Bot用户名（例如：tajik_lottery_bot）
5. 保存Bot Token（格式：`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）

### 步骤2: 配置Bot基本信息
```
/setdescription
选择你的bot
输入描述：
在线夺宝抽奖平台，参与抽奖赢取大奖！
```

```
/setabouttext
选择你的bot
输入简介：
Welcome to Tajikistan Lottery Platform
```

## 2. 配置Web App

### 方法1: 使用菜单按钮（推荐）
```
/setmenubutton
选择你的bot
发送以下文本：
打开应用 - https://your-domain.vercel.app
```

### 方法2: 使用内联键盘
Bot需要返回带有web_app按钮的消息。

## 3. Bot命令设置

```
/setcommands
选择你的bot
输入以下命令列表：

start - 启动应用
help - 获取帮助
products - 查看商品
profile - 个人中心
balance - 查看余额
orders - 我的订单
referral - 邀请好友
```

## 4. Python Bot脚本示例

### 安装依赖
```bash
pip install python-telegram-bot requests
```

### bot.py
```python
import os
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# 配置
BOT_TOKEN = "YOUR_BOT_TOKEN"
WEB_APP_URL = "https://your-domain.vercel.app"

# 日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /start 命令"""
    keyboard = [
        [InlineKeyboardButton("打开应用 🎰", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "欢迎来到夺宝平台！🎉\n\n"
        "点击下方按钮打开应用，开始您的夺宝之旅！\n\n"
        "每天都有新的商品等你来夺取！",
        reply_markup=reply_markup
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /help 命令"""
    help_text = """
📱 *夺宝平台帮助*

*如何参与：*
1️⃣ 选择心仪商品
2️⃣ 购买夺宝份数
3️⃣ 等待开奖
4️⃣ 查看中奖结果

*命令列表：*
/start - 启动应用
/products - 查看商品
/profile - 个人中心
/balance - 查看余额
/orders - 我的订单
/referral - 邀请好友
/help - 获取帮助

*需要帮助？*
联系客服：@your_support
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /products 命令"""
    keyboard = [
        [InlineKeyboardButton("查看商品 🛍", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "点击下方按钮查看所有可参与的夺宝商品！",
        reply_markup=reply_markup
    )

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /profile 命令"""
    keyboard = [
        [InlineKeyboardButton("个人中心 👤", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "查看您的个人信息和统计数据",
        reply_markup=reply_markup
    )

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /balance 命令"""
    keyboard = [
        [InlineKeyboardButton("查看余额 💰", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "点击查看您的当前余额和充值",
        reply_markup=reply_markup
    )

async def orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /orders 命令"""
    keyboard = [
        [InlineKeyboardButton("我的订单 📦", web_app=WebAppInfo(url=f"{WEB_APP_URL}/orders"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "查看您的所有参与记录",
        reply_markup=reply_markup
    )

async def referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /referral 命令"""
    keyboard = [
        [InlineKeyboardButton("邀请好友 👥", web_app=WebAppInfo(url=f"{WEB_APP_URL}/referral"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "邀请好友注册，获得5%返利！",
        reply_markup=reply_markup
    )

def main():
    """启动Bot"""
    # 创建Application
    application = Application.builder().token(BOT_TOKEN).build()

    # 注册命令处理器
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("products", products))
    application.add_handler(CommandHandler("profile", profile))
    application.add_handler(CommandHandler("balance", balance))
    application.add_handler(CommandHandler("orders", orders))
    application.add_handler(CommandHandler("referral", referral))

    # 启动Bot
    print("Bot started...")
    application.run_polling()

if __name__ == '__main__':
    main()
```

### 运行Bot
```bash
python bot.py
```

## 5. 部署Bot

### 使用systemd（Linux服务器）
创建 `/etc/systemd/system/telegram-bot.service`：
```ini
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 /path/to/bot/bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

### 使用Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY bot.py .

CMD ["python", "bot.py"]
```

## 6. 安全建议

1. **保护Bot Token**
   - 不要将Token提交到Git
   - 使用环境变量存储

2. **验证用户**
   - 在WebApp中验证initData
   - 使用Telegram的哈希验证

3. **限流**
   - 实现命令调用频率限制
   - 防止滥用

## 7. 多语言支持

Bot可以根据用户语言自动切换：
```python
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_lang = update.effective_user.language_code
    
    messages = {
        'zh': '欢迎来到夺宝平台！',
        'en': 'Welcome to Lottery Platform!',
        'ru': 'Добро пожаловать на платформу лотереи!',
        'tg': 'Хуш омадед ба платформаи қурғакашӣ!'
    }
    
    message = messages.get(user_lang, messages['en'])
    # ... 发送消息
```

## 8. 监控和日志

建议实现：
- 错误日志记录
- 用户活动统计
- 性能监控
- 告警机制

## 需要帮助？

- Telegram Bot API文档: https://core.telegram.org/bots/api
- python-telegram-bot文档: https://docs.python-telegram-bot.org
```

---

## 国际化文件 (locales)

### en.json - 英文翻译
```json
{
  "app": {
    "title": "Lottery Platform",
    "description": "Online Lottery Platform"
  },
  "nav": {
    "home": "Home",
    "products": "Products",
    "my": "My",
    "orders": "Orders",
    "referral": "Referral"
  },
  "home": {
    "welcome": "Welcome to Lottery Platform",
    "hot_products": "Hot Products",
    "view_all": "View All"
  },
  "product": {
    "price": "Price",
    "stock": "Stock",
    "shares": "Shares",
    "per_share": "Per Share",
    "participate": "Participate",
    "sold": "Sold",
    "remaining": "Remaining"
  },
  "lottery": {
    "total_shares": "Total Shares",
    "sold_shares": "Sold Shares",
    "price_per_share": "Price Per Share",
    "select_shares": "Select Shares",
    "confirm_participate": "Confirm",
    "status": {
      "active": "Active",
      "ready_to_draw": "Ready to Draw",
      "completed": "Completed",
      "cancelled": "Cancelled"
    }
  },
  "user": {
    "balance": "Balance",
    "total_spent": "Total Spent",
    "total_wins": "Total Wins",
    "participations": "Participations",
    "referrals": "Referrals",
    "profile": "Profile",
    "transactions": "Transactions",
    "my_wins": "My Wins"
  },
  "order": {
    "create": "Create Order",
    "status": {
      "pending": "Pending",
      "paid": "Paid",
      "completed": "Completed",
      "cancelled": "Cancelled"
    }
  },
  "referral": {
    "title": "Invite Friends",
    "your_code": "My Code",
    "invite_link": "Invite Link",
    "total_referrals": "Total Referrals",
    "total_rewards": "Total Rewards",
    "copy": "Copy",
    "share": "Share"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "close": "Close",
    "save": "Save",
    "submit": "Submit",
    "retry": "Retry",
    "insufficient_balance": "Insufficient Balance",
    "operation_success": "Operation Success",
    "operation_failed": "Operation Failed"
  }
}
```

### ru.json - 俄文翻译
```json
{
  "app": {
    "title": "Платформа лотереи",
    "description": "Онлайн-платформа лотереи"
  },
  "nav": {
    "home": "Главная",
    "products": "Товары",
    "my": "Мой",
    "orders": "Заказы",
    "referral": "Реферал"
  },
  "home": {
    "welcome": "Добро пожаловать на платформу лотереи",
    "hot_products": "Популярные товары",
    "view_all": "Посмотреть все"
  },
  "product": {
    "price": "Цена",
    "stock": "Запас",
    "shares": "Доли",
    "per_share": "За долю",
    "participate": "Участвовать",
    "sold": "Продано",
    "remaining": "Осталось"
  },
  "lottery": {
    "total_shares": "Всего долей",
    "sold_shares": "Продано долей",
    "price_per_share": "Цена за долю",
    "select_shares": "Выберите доли",
    "confirm_participate": "Подтвердить",
    "status": {
      "active": "Активно",
      "ready_to_draw": "Готово к розыгрышу",
      "completed": "Завершено",
      "cancelled": "Отменено"
    }
  },
  "user": {
    "balance": "Баланс",
    "total_spent": "Всего потрачено",
    "total_wins": "Всего выигрышей",
    "participations": "Участия",
    "referrals": "Рефералы",
    "profile": "Профиль",
    "transactions": "Транзакции",
    "my_wins": "Мои выигрыши"
  },
  "order": {
    "create": "Создать заказ",
    "status": {
      "pending": "Ожидание",
      "paid": "Оплачено",
      "completed": "Завершено",
      "cancelled": "Отменено"
    }
  },
  "referral": {
    "title": "Пригласить друзей",
    "your_code": "Мой код",
    "invite_link": "Ссылка приглашения",
    "total_referrals": "Всего рефералов",
    "total_rewards": "Всего наград",
    "copy": "Копировать",
    "share": "Поделиться"
  },
  "common": {
    "loading": "Загрузка...",
    "error": "Ошибка",
    "success": "Успех",
    "confirm": "Подтвердить",
    "cancel": "Отменить",
    "close": "Закрыть",
    "save": "Сохранить",
    "submit": "Отправить",
    "retry": "Повторить",
    "insufficient_balance": "Недостаточно средств",
    "operation_success": "Операция успешна",
    "operation_failed": "Операция не удалась"
  }
}
```

### tg.json - 塔吉克语翻译
```json
{
  "app": {
    "title": "Платформаи қурғакашӣ",
    "description": "Платформаи онлайн қурғакашӣ"
  },
  "nav": {
    "home": "Асосӣ",
    "products": "Молҳо",
    "my": "Ман",
    "orders": "Фармоишҳо",
    "referral": "Тавсия"
  },
  "home": {
    "welcome": "Хуш омадед ба платформаи қурғакашӣ",
    "hot_products": "Молҳои машҳур",
    "view_all": "Ҳамаро дидан"
  },
  "product": {
    "price": "Нарх",
    "stock": "Захира",
    "shares": "Ҳиссаҳо",
    "per_share": "Барои як ҳисса",
    "participate": "Иштирок кардан",
    "sold": "Фурӯхта шуд",
    "remaining": "Боқимонда"
  },
  "lottery": {
    "total_shares": "Ҳамаи ҳиссаҳо",
    "sold_shares": "Ҳиссаҳои фурӯхташуда",
    "price_per_share": "Нархи як ҳисса",
    "select_shares": "Ҳиссаҳоро интихоб кунед",
    "confirm_participate": "Тасдиқ кардан",
    "status": {
      "active": "Фаъол",
      "ready_to_draw": "Омодаи қурғакашӣ",
      "completed": "Анҷом ёфт",
      "cancelled": "Бекор карда шуд"
    }
  },
  "user": {
    "balance": "Боқимонда",
    "total_spent": "Ҳамагӣ харҷ шуд",
    "total_wins": "Ҳамаи ғалабаҳо",
    "participations": "Иштирокҳо",
    "referrals": "Тавсияҳо",
    "profile": "Профил",
    "transactions": "Муомилотҳо",
    "my_wins": "Ғалабаҳои ман"
  },
  "order": {
    "create": "Фармоиш эҷод кардан",
    "status": {
      "pending": "Интизор",
      "paid": "Пардохт шуд",
      "completed": "Анҷом ёфт",
      "cancelled": "Бекор карда шуд"
    }
  },
  "referral": {
    "title": "Дӯстонро даъват кунед",
    "your_code": "Рамзи ман",
    "invite_link": "Истиноди даъват",
    "total_referrals": "Ҳамаи тавсияҳо",
    "total_rewards": "Ҳамаи мукофотҳо",
    "copy": "Нусхабардорӣ",
    "share": "Мубодила"
  },
  "common": {
    "loading": "Боргирӣ...",
    "error": "Хатогӣ",
    "success": "Муваффақият",
    "confirm": "Тасдиқ",
    "cancel": "Бекор кардан",
    "close": "Пӯшидан",
    "save": "Нигоҳ доштан",
    "submit": "Фиристодан",
    "retry": "Дубора кӯшиш",
    "insufficient_balance": "Маблағи нокифоя",
    "operation_success": "Амалиёт муваффақ",
    "operation_failed": "Амалиёт ношуд"
  }
}
```

### zh.json - 中文翻译
```json
{
  "app": {
    "title": "夺宝平台",
    "description": "在线夺宝抽奖平台"
  },
  "nav": {
    "home": "首页",
    "products": "商品",
    "my": "我的",
    "orders": "订单",
    "referral": "推荐"
  },
  "home": {
    "welcome": "欢迎来到夺宝平台",
    "hot_products": "热门商品",
    "view_all": "查看全部"
  },
  "product": {
    "price": "价格",
    "stock": "库存",
    "shares": "份数",
    "per_share": "每份",
    "participate": "参与夺宝",
    "sold": "已售",
    "remaining": "剩余"
  },
  "lottery": {
    "total_shares": "总份数",
    "sold_shares": "已售份数",
    "price_per_share": "每份价格",
    "select_shares": "选择份数",
    "confirm_participate": "确认参与",
    "status": {
      "active": "进行中",
      "ready_to_draw": "待开奖",
      "completed": "已完成",
      "cancelled": "已取消"
    }
  },
  "user": {
    "balance": "余额",
    "total_spent": "总消费",
    "total_wins": "中奖次数",
    "participations": "参与次数",
    "referrals": "推荐人数",
    "profile": "个人信息",
    "transactions": "交易记录",
    "my_wins": "我的中奖"
  },
  "order": {
    "create": "创建订单",
    "status": {
      "pending": "待支付",
      "paid": "已支付",
      "completed": "已完成",
      "cancelled": "已取消"
    }
  },
  "referral": {
    "title": "邀请好友",
    "your_code": "我的邀请码",
    "invite_link": "邀请链接",
    "total_referrals": "邀请人数",
    "total_rewards": "奖励总额",
    "copy": "复制",
    "share": "分享"
  },
  "common": {
    "loading": "加载中...",
    "error": "错误",
    "success": "成功",
    "confirm": "确认",
    "cancel": "取消",
    "close": "关闭",
    "save": "保存",
    "submit": "提交",
    "retry": "重试",
    "insufficient_balance": "余额不足",
    "operation_success": "操作成功",
    "operation_failed": "操作失败"
  }
}
```

---

## 类型定义 (types)

### database.ts - 完整数据库类型定义
```typescript
// 数据库类型定义 - 修复版本
export interface User {
  id: string
  telegram_id: number
  username: string | null
  full_name: string | null
  balance: number
  language: string
  photo_url?: string | null
  is_premium?: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  price: number
  stock: number
  category: string
  image_url: string
  status: 'active' | 'inactive' | 'out_of_stock'
  created_at: string
  updated_at: string
  active_rounds?: LotteryRound[]
}

export interface LotteryRound {
  id: string
  product_id: string
  total_shares: number
  sold_shares: number
  price_per_share: number
  status: 'active' | 'ready_to_draw' | 'completed' | 'cancelled'
  draw_date: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}

export interface Participation {
  id: string
  user_id: string
  lottery_round_id: string
  shares_count: number
  amount_paid: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  payment_method: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'topup' | 'purchase' | 'refund' | 'referral' | 'prize' | 'withdrawal'
  amount: number
  description: string
  reference_id: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

export interface UserStats {
  total_participations: number
  total_wins: number
  total_spent: number
  total_referrals: number
  total_referral_rewards: number
}

// 增强的类型定义
export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: User
  is_liked?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// 分页类型
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// 表单验证类型
export interface FormError {
  field: string
  message: string
}

// 网络状态类型
export interface NetworkStatus {
  isOnline: boolean
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown'
  effectiveType?: string
  downlink?: number
  rtt?: number
}

// 支持的语言类型
export type SupportedLanguage = 'en' | 'zh' | 'ru' | 'tg'

// 时间类型别名（可选）
export type DateString = string

// 抽奖状态常量
export const LotteryStatus = {
  ACTIVE: 'active' as const,
  READY_TO_DRAW: 'ready_to_draw' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const
} as const

// 产品状态常量
export const ProductStatus = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  OUT_OF_STOCK: 'out_of_stock' as const
} as const

// 订单状态常量
export const OrderStatus = {
  PENDING: 'pending' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  REFUNDED: 'refunded' as const
} as const

// 交易类型常量
export const TransactionType = {
  TOPUP: 'topup' as const,
  PURCHASE: 'purchase' as const,
  REFUND: 'refund' as const,
  REFERRAL: 'referral' as const,
  PRIZE: 'prize' as const,
  WITHDRAWAL: 'withdrawal' as const,
  RESALE_PURCHASE: 'resale_purchase' as const,
  RESALE_PURCHASE_FEE: 'resale_purchase_fee' as const,
  RESALE_SALE: 'resale_sale' as const,
  RESALE_SALE_FEE: 'resale_sale_fee' as const,
  RESALE_CANCELLATION: 'resale_cancellation' as const
} as const

// 转售相关接口定义
export interface Resale {
  id: string
  seller_id: string
  participation_id: string
  lottery_round_id: string
  shares_to_sell: number
  price_per_share: number
  total_amount: number
  status: 'active' | 'sold' | 'cancelled' | 'expired'
  created_at: string
  updated_at: string
  completed_at: string | null
  
  // 关联数据
  seller?: User
  participation?: Participation
  lottery_round?: LotteryRound & {
    product?: Product
  }
}

export interface ResaleTransaction {
  id: string
  resale_id: string
  buyer_id: string
  seller_id: string
  participation_id: string
  shares_count: number
  price_per_share: number
  total_amount: number
  status: 'completed' | 'cancelled' | 'refunded'
  transaction_fee: number // 卖家手续费
  buyer_fee: number // 买家手续费
  created_at: string
  completed_at: string | null
  
  // 关联数据
  buyer?: User
  seller?: User
  resale?: Resale
}

// 数据库表常量
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  LOTTERY_ROUNDS: 'lottery_rounds',
  PARTICIPATIONS: 'participations',
  ORDERS: 'orders',
  TRANSACTIONS: 'transactions',
  REFERRALS: 'referrals',
  POSTS: 'posts',
  POST_LIKES: 'post_likes',
  POST_COMMENTS: 'post_comments',
  SYSTEM_SETTINGS: 'system_settings',
  // 转售相关表
  RESALES: 'resales',
  RESALE_TRANSACTIONS: 'resale_transactions'
} as const
```

---

## 公共资源 (public)

### 目录说明
- public目录：包含静态资源文件
- 当前状态：空目录
- 用途：存放图片、图标、favicon等静态文件

---

## 总结

本文档详细展示了telegram-lottery-miniapp项目的其他重要文件，包括：

1. **完整的测试体系** - 240个测试用例，覆盖所有核心功能
2. **Telegram Bot配置** - 包括配置、部署脚本和增强版Bot
3. **详细的API文档** - 包含所有端点、数据模型和错误处理
4. **部署指南** - 从开发到生产的完整部署流程
5. **多语言支持** - 支持中文、英文、俄文、塔吉克语
6. **完整的TypeScript类型定义** - 确保类型安全

这些文件为项目提供了完整的测试覆盖、bot支持、文档体系和国际化的基础。
