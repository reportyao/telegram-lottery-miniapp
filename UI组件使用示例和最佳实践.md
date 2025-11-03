# UI组件使用示例和最佳实践指南

## 指南概览

**创建时间**: 2025-11-04 02:48:53  
**适用对象**: 开发者、设计师、产品经理  
**版本**: v1.0  
**覆盖范围**: 所有UI组件的详细使用示例和最佳实践  

## 1. 多语言系统使用指南

### 1.1 基础多语言设置

#### 项目初始化
```typescript
// app/layout.tsx
import LanguageProvider from '@/components/LanguageProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
```

#### 翻译文件结构
```
locales/
├── tg.json    # 塔吉克语 (主要语言)
├── ru.json    # 俄语  
├── en.json    # 英语
└── zh.json    # 中文 (部分翻译)
```

#### 使用翻译函数
```typescript
// 基础使用
import { useLanguage } from '@/hooks/useLanguage'

function MyComponent() {
  const { t, currentLanguage } = useLanguage()
  
  return (
    <div>
      <h1>{t('app.title', '默认标题')}</h1>
      <p>{t('common.loading', '加载中...')}</p>
      <button>{t('button.submit', '提交')}</button>
    </div>
  )
}

// 嵌套键值访问
const title = t('nav.home', '首页') // 简单键
const status = t('lottery.status.active', '活跃') // 嵌套键
```

### 1.2 高级多语言特性

#### 动态翻译
```typescript
// 带变量的翻译
function OrderStatus({ status }: { status: string }) {
  const { t } = useLanguage()
  
  const statusText = t(`order.status.${status}`, status)
  const message = t('order.message', '订单状态', { 
    status: statusText 
  })
  
  return <span>{message}</span>
}

// 条件翻译
function ConditionalText({ isActive }: { isActive: boolean }) {
  const { t } = useLanguage()
  
  return (
    <div>
      {isActive ? t('status.active', '活跃') : t('status.inactive', '不活跃')}
    </div>
  )
}
```

#### 语言检测和设置
```typescript
// 自动语言检测
import { useEffect } from 'react'
import { Language } from '@/hooks/useLanguage'

function LanguageInitializer() {
  const { changeLanguage } = useLanguage()
  
  useEffect(() => {
    // 从URL参数检测
    const urlParams = new URLSearchParams(window.location.search)
    const langParam = urlParams.get('lang') as Language
    
    if (langParam && ['tg', 'ru', 'en'].includes(langParam)) {
      changeLanguage(langParam)
      return
    }
    
    // 从localStorage检测
    const savedLang = localStorage.getItem('app-language') as Language
    if (savedLang) {
      changeLanguage(savedLang)
      return
    }
    
    // 从浏览器语言检测
    const browserLang = navigator.language.split('-')[0] as Language
    if (['tg', 'ru', 'en'].includes(browserLang)) {
      changeLanguage(browserLang)
    }
  }, [changeLanguage])
  
  return null
}
```

### 1.3 语言切换器使用

#### 完整版语言切换器
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

function Header() {
  return (
    <header className="p-4">
      <div className="flex justify-between items-center">
        <h1>我的应用</h1>
        <LanguageSwitcher
          variant="full"           // 完整版本
          showFlag={true}          // 显示国旗
          showCode={true}          // 显示语言代码
          size="md"               // 中等尺寸
          position="bottom"       // 下方弹出
          className="ml-4"
        />
      </div>
    </header>
  )
}
```

#### 迷你版语言切换器
```typescript
function Navigation() {
  return (
    <nav className="flex items-center space-x-4">
      <a href="/">首页</a>
      <a href="/about">关于</a>
      <LanguageSwitcher
        variant="minimal"         // 迷你版本
        showFlag={true}           // 只显示国旗
        showCode={false}          // 隐藏语言代码
        size="sm"                // 小尺寸
        position="top"           // 上方弹出
      />
    </nav>
  )
}
```

## 2. 货币格式化使用指南

### 2.1 基本货币格式化

#### 标准格式化
```typescript
import { formatTJS, formatCurrency, formatAmount } from '@/lib/currency'

function PriceDisplay({ price }: { price: number }) {
  return (
    <div className="text-lg font-semibold">
      {formatTJS(price)}
      {/* 显示: "1 234,56 Сомони" */}
    </div>
  )
}

// 仅显示数字部分
function PurePrice({ price }: { price: number }) {
  return (
    <div>
      {formatAmount(price)}
      {/* 显示: "1 234,56" */}
    </div>
  )
}

// 简化的货币显示
function CompactPrice({ price }: { price: number }) {
  return (
    <span className="text-sm">
      {formatCurrency(price, true)}
      {/* 显示: "1 234,56 Сомони" */}
    </span>
  )
}
```

#### 移动端优化格式化
```typescript
function MobilePrice({ price }: { price: number }) {
  return (
    <div className="flex items-baseline space-x-1">
      <span className="text-xl font-bold">
        {formatTJS(price, { 
          compact: true, 
          showSymbol: true 
        })}
        {/* 显示: "1 234,56 c." */}
      </span>
      <span className="text-xs text-gray-500">
        TJS
      </span>
    </div>
  )
}
```

### 2.2 高级货币功能

#### 表单输入处理
```typescript
import { parseCurrency, formatTJS } from '@/lib/currency'
import { useState } from 'react'

function CurrencyInput() {
  const [value, setValue] = useState('')
  const [displayValue, setDisplayValue] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // 解析用户输入
    const parsedValue = parseCurrency(inputValue)
    
    // 格式化显示
    const formatted = formatTJS(parsedValue, { showSymbol: false })
    
    setValue(parsedValue.toString())
    setDisplayValue(formatted)
  }
  
  return (
    <div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="请输入金额"
        className="tj-input"
      />
      <div className="text-sm text-gray-500">
        当前值: {formatTJS(parseFloat(value) || 0)}
      </div>
    </div>
  )
}
```

#### 余额比较和状态
```typescript
function BalanceStatus({ balance }: { balance: number }) {
  const { t } = useLanguage()
  
  const getStatusInfo = (amount: number) => {
    if (amount >= 1000) {
      return {
        status: 'good',
        color: 'text-green-600',
        text: t('balance.status.good', '充足')
      }
    } else if (amount >= 100) {
      return {
        status: 'medium',
        color: 'text-yellow-600', 
        text: t('balance.status.medium', '中等')
      }
    } else {
      return {
        status: 'low',
        color: 'text-red-600',
        text: t('balance.status.low', '不足')
      }
    }
  }
  
  const statusInfo = getStatusInfo(balance)
  
  return (
    <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
      <span className="text-2xl font-bold">
        {formatTJS(balance)}
      </span>
      <span className="text-sm">
        {statusInfo.text}
      </span>
    </div>
  )
}
```

## 3. 用户余额组件使用指南

### 3.1 标准余额组件

#### 完整版余额显示
```typescript
import { UserBalance, DetailedUserBalance } from '@/components/UserBalance'
import { User } from '@/types/database'

function UserDashboard({ user }: { user: User }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <UserBalance 
          user={user}
          compact={false}           // 完整显示
          showWelcome={true}        // 显示欢迎信息
          className="mb-6"
        />
      </div>
    </div>
  )
}
```

#### 紧凑版余额显示
```typescript
function CompactHeader({ user }: { user: User }) {
  return (
    <header className="bg-white border-b p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">我的账户</h1>
        </div>
        <UserBalance 
          user={user}
          compact={true}            // 紧凑模式
          showWelcome={false}       // 隐藏欢迎信息
        />
      </div>
    </header>
  )
}
```

### 3.2 详细版余额组件

#### 完整余额信息展示
```typescript
function BalanceDetails({ user }: { user: User }) {
  return (
    <div className="max-w-md mx-auto">
      <DetailedUserBalance 
        user={user}
        className="mb-6"
      />
      
      {/* 快速操作 */}
      <div className="grid grid-cols-2 gap-4">
        <button className="tj-button">
          充值
        </button>
        <button className="tj-button-secondary">
          提现
        </button>
      </div>
    </div>
  )
}
```

#### 余额变化动画
```typescript
function AnimatedBalance({ user, newBalance }: { 
  user: User, 
  newBalance: number 
}) {
  const [currentUser, setCurrentUser] = useState(user)
  
  // 模拟余额更新
  const updateBalance = () => {
    setCurrentUser(prev => ({
      ...prev,
      balance: newBalance
    }))
  }
  
  return (
    <div>
      <UserBalance user={currentUser} />
      <button onClick={updateBalance} className="tj-button mt-4">
        更新余额 (演示动画)
      </button>
    </div>
  )
}
```

## 4. 商品卡片使用指南

### 4.1 基本商品展示

#### 标准商品卡片
```typescript
import { ProductCard } from '@/components/ProductCard'
import { Product, User } from '@/types/database'

function ProductList({ products, user }: { 
  products: Product[], 
  user: User 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          user={user}
        />
      ))}
    </div>
  )
}
```

#### 自定义商品卡片
```typescript
function CustomProductCard({ product, user }: { 
  product: Product, 
  user: User 
}) {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* 自定义图片容器 */}
      <div className="aspect-video relative">
        <img 
          src={product.images?.[0]} 
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span className="tj-badge">
            热门
          </span>
        </div>
      </div>
      
      {/* 自定义内容 */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* 价格信息 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary-600">
            {formatTJS(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            库存: {product.stock}
          </span>
        </div>
        
        {/* 操作按钮 */}
        <button 
          className="w-full tj-button"
          onClick={() => setShowDetails(true)}
        >
          查看详情
        </button>
      </div>
    </div>
  )
}
```

### 4.2 商品卡片集成

#### 带筛选的商品列表
```typescript
function FilterableProductList({ products, user }: {
  products: Product[],
  user: User
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'popular'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'date'>('name')
  
  const filteredProducts = products.filter(product => {
    switch (filter) {
      case 'active':
        return product.active_rounds?.length > 0
      case 'popular':
        return product.popularity > 80
      default:
        return true
    }
  })
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  return (
    <div>
      {/* 筛选器 */}
      <div className="flex space-x-4 mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="tj-input"
        >
          <option value="all">全部商品</option>
          <option value="active">进行中</option>
          <option value="popular">热门商品</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as any)}
          className="tj-input"
        >
          <option value="name">按名称</option>
          <option value="price">按价格</option>
          <option value="date">按日期</option>
        </select>
      </div>
      
      {/* 商品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            user={user}
          />
        ))}
      </div>
    </div>
  )
}
```

## 5. 导航系统使用指南

### 5.1 基础导航实现

#### 底部导航栏
```typescript
import Navigation from '@/components/Navigation'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  )
}
```

#### 自定义导航项
```typescript
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'

function CustomNavigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  
  const navItems = [
    { 
      href: '/', 
      label: t('nav.home', '首页'),
      icon: '🏠',
      color: 'from-red-500 to-red-600'
    },
    { 
      href: '/products', 
      label: t('nav.products', '商品'),
      icon: '🛍️',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      href: '/orders', 
      label: t('nav.orders', '订单'),
      icon: '📋',
      color: 'from-green-500 to-green-600'
    },
    { 
      href: '/profile', 
      label: t('nav.profile', '我的'),
      icon: '👤',
      color: 'from-purple-500 to-purple-600'
    }
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-lg
                transition-all duration-200 min-w-[60px]
                ${isActive 
                  ? `bg-gradient-to-br ${item.color} text-white transform scale-110`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### 5.2 导航与语言切换集成

#### 完整导航布局
```typescript
function FullNavigationLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部栏 */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">我的应用</h1>
          <LanguageSwitcher 
            variant="minimal"
            showFlag={true}
            showCode={false}
            size="sm"
          />
        </div>
      </header>
      
      {/* 主要内容 */}
      <main className="flex-1 pb-20">
        {/* 页面内容 */}
      </main>
      
      {/* 底部导航 */}
      <Navigation />
    </div>
  )
}
```

## 6. 错误处理和最佳实践

### 6.1 错误边界处理

#### 全局错误边界
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary fallback={<div>页面出现错误</div>}>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  )
}
```

#### 组件级错误处理
```typescript
function SafeProductCard({ product, user }: { 
  product: Product, 
  user: User 
}) {
  try {
    return (
      <ErrorBoundary fallback={<div>商品加载失败</div>}>
        <ProductCard product={product} user={user} />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('ProductCard渲染错误:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">商品暂时无法显示</p>
      </div>
    )
  }
}
```

### 6.2 性能优化实践

#### 组件懒加载
```typescript
import { lazy, Suspense } from 'react'

// 懒加载组件
const ProductCard = lazy(() => import('@/components/ProductCard'))
const UserBalance = lazy(() => import('@/components/UserBalance'))
const Navigation = lazy(() => import('@/components/Navigation'))

function LazyLoadedPage() {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <ProductCard product={product} user={user} />
      </Suspense>
      
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>
    </div>
  )
}
```

#### 虚拟滚动优化
```typescript
import { FixedSizeList as List } from 'react-window'

function VirtualizedProductList({ products }: { 
  products: Product[] 
}) {
  const Row = ({ index, style }: { index: number, style: any }) => (
    <div style={style}>
      <ProductCard 
        product={products[index]} 
        user={user}
      />
    </div>
  )
  
  return (
    <List
      height={600}          // 容器高度
      itemCount={products.length}
      itemSize={350}        // 每行高度
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 6.3 无障碍访问最佳实践

#### 键盘导航支持
```typescript
function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false 
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }
  
  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        tj-button
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-disabled={disabled}
      aria-describedby="button-description"
    >
      {children}
    </button>
  )
}
```

#### 屏幕阅读器支持
```typescript
function AccessibleCard({ product }: { product: Product }) {
  return (
    <article 
      className="tj-card"
      role="article"
      aria-labelledby={`product-${product.id}-title`}
      aria-describedby={`product-${product.id}-description`}
    >
      <h3 id={`product-${product.id}-title`}>
        {product.name}
      </h3>
      
      <p id={`product-${product.id}-description`}>
        {product.description}
      </p>
      
      <div 
        className="sr-only"
        aria-live="polite"
      >
        当前价格: {formatTJS(product.price)}
      </div>
    </article>
  )
}
```

## 7. 测试和调试指南

### 7.1 组件测试示例

#### 语言切换器测试
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LanguageProvider } from '@/components/LanguageProvider'

describe('LanguageSwitcher', () => {
  it('应该显示当前语言', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="minimal" />
      </LanguageProvider>
    )
    
    expect(screen.getByText('🇹🇯')).toBeInTheDocument()
  })
  
  it('应该能够切换语言', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="minimal" />
      </LanguageProvider>
    )
    
    const switcher = screen.getByRole('button')
    fireEvent.click(switcher)
    
    expect(screen.getByText('🇷🇺')).toBeInTheDocument()
  })
})
```

#### 货币格式化测试
```typescript
import { formatTJS, parseCurrency } from '@/lib/currency'

describe('货币格式化', () => {
  it('应该正确格式化基本数字', () => {
    expect(formatTJS(1234.56)).toBe('1 234,56 Сомони')
  })
  
  it('应该正确处理负数', () => {
    expect(formatTJS(-1234.56)).toBe('-1 234,56 Сомони')
  })
  
  it('应该能够解析格式化字符串', () => {
    expect(parseCurrency('1 234,56 Сомони')).toBe(1234.56)
  })
})
```

### 7.2 调试工具和技巧

#### 性能监控
```typescript
import { useEffect } from 'react'

function PerformanceMonitor() {
  useEffect(() => {
    // 监控页面加载性能
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`)
      })
    })
    
    observer.observe({ entryTypes: ['measure', 'navigation'] })
    
    return () => observer.disconnect()
  }, [])
  
  return null
}
```

#### 组件调试帮助器
```typescript
function DebugInfo({ component, props }: { 
  component: string
  props: any 
}) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="bg-gray-100 p-2 rounded text-xs font-mono">
      <strong>{component}</strong>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  )
}

// 使用示例
<ProductCard 
  product={product} 
  user={user}
/>
<DebugInfo component="ProductCard" props={{ product, user }} />
```

## 8. 部署和配置指南

### 8.1 环境配置

#### 环境变量设置
```bash
# .env.local
NEXT_PUBLIC_APP_NAME=Telegram Lottery
NEXT_PUBLIC_DEFAULT_LANGUAGE=tg
NEXT_PUBLIC_SUPPORTED_LANGUAGES=tg,ru,en
NEXT_PUBLIC_CURRENCY=TJS
```

#### 运行时配置
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif']
  },
  i18n: {
    locales: ['tg', 'ru', 'en'],
    defaultLocale: 'tg',
    localeDetection: true
  }
}

module.exports = nextConfig
```

### 8.2 性能优化配置

#### 编译优化
```typescript
// 组件预加载配置
const componentImports = {
  'ProductCard': '@/components/ProductCard',
  'UserBalance': '@/components/UserBalance',
  'Navigation': '@/components/Navigation'
}

// 使用预加载
const LazyComponent = lazy(() => 
  import('@/components/ProductCard').then(module => ({
    default: module.ProductCard
  }))
)
```

## 9. 总结和资源

### 9.1 关键要点回顾

#### 多语言系统
- ✅ 支持塔吉克语、俄语、英语、中文
- ✅ 自动语言检测和用户偏好保存
- ✅ 动态翻译和条件文本支持
- ✅ 平滑的语言切换动画

#### 货币格式化
- ✅ 完全符合塔吉克斯坦货币标准
- ✅ 精确的数值处理和边界值处理
- ✅ 移动端和桌面端适配
- ✅ 安全的解析和验证机制

#### 响应式设计
- ✅ 全设备尺寸适配
- ✅ 优秀的触摸体验
- ✅ 流畅的动画效果
- ✅ 完善的性能优化

#### 组件系统
- ✅ 模块化和可复用设计
- ✅ 完整的类型安全
- ✅ 优秀的错误处理
- ✅ 符合最佳实践

### 9.2 学习资源

#### 推荐阅读
- [Next.js 官方文档](https://nextjs.org/docs)
- [React TypeScript 指南](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Web 无障碍访问指南](https://www.w3.org/WAI/WCAG21/quickref/)

#### 相关工具
- [React Testing Library](https://testing-library.com/react)
- [Storybook](https://storybook.js.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

### 9.3 技术支持

如需技术支持或有任何问题，请参考：
- 项目README文件
- 代码注释和文档
- 组件测试文件
- 性能监控报告

---

**文档版本**: v1.0  
**最后更新**: 2025-11-04 02:48:53  
**维护团队**: Claude Code  
**文档状态**: 生产就绪