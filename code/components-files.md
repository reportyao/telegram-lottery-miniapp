# Components 目录文件内容

本文档包含 `/workspace/telegram-lottery-miniapp/components/` 目录下的所有文件内容，包括子目录。

---

## ErrorBoundary.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ErrorBoundary.tsx`

```tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // 在生产环境中，可以发送错误报告到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 发送错误报告
      this.reportError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 这里可以集成错误监控服务，如 Sentry
    try {
      // 检查是否在客户端环境
      if (typeof window === 'undefined') return
      
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: window.location.href,
      }

      // 发送错误报告到后端或错误监控服务
      console.log('Error Report:', errorReport)
      
      // 这里可以调用错误报告API
      // fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-semibold mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

---

## LotteryModal.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/LotteryModal.tsx`

```tsx
'use client'

import { Product, LotteryRound, User } from '@/types/database'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LotteryModalProps {
  product: Product
  lotteryRound: LotteryRound
  user: User | null
  onClose: () => void
}

export default function LotteryModal({ product, lotteryRound, user, onClose }: LotteryModalProps) {
  const [shares, setShares] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableShares = lotteryRound.total_shares - lotteryRound.sold_shares
  const totalAmount = shares * parseFloat(lotteryRound.price_per_share.toString())

  const handleParticipate = async () => {
    // 检查网络状态
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network.')
      return
    }

    if (!user) {
      setError('Please login first')
      return
    }

    if (shares < 1 || shares > availableShares) {
      setError('Invalid number of shares')
      return
    }

    if (parseFloat(user.balance.toString()) < totalAmount) {
      setError('Insufficient balance')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: participateError } = await supabase.functions.invoke('participate-lottery', {
        body: {
          user_id: user.id,
          lottery_round_id: lotteryRound.id,
          shares_count: shares,
        },
      })

      if (participateError) {
        throw participateError
      }

      // 显示成功消息而不是alert
      setError(null)
      setLoading(false)
      
      // 触发重新加载页面数据
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lotteryParticipated'))
      }
      
      onClose()
    } catch (err: any) {
      console.error('Participation error:', err)
      
      // 更好的错误处理
      if (err.message?.includes('network') || err.message?.includes('timeout')) {
        setError('Network error. Please try again.')
      } else if (err.message?.includes('balance')) {
        setError('Insufficient balance for this transaction')
      } else if (err.message?.includes('shares')) {
        setError('Not enough shares available')
      } else {
        setError(err.message || 'Failed to participate. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getProductName = (names: Record<string, string>) => {
    return names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{getProductName(product.name)}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Shares:</span>
              <span className="font-semibold">{lotteryRound.total_shares}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sold Shares:</span>
              <span className="font-semibold">{lotteryRound.sold_shares}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Available:</span>
              <span className="font-semibold text-green-600">{availableShares}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per Share:</span>
              <span className="font-semibold text-primary">${lotteryRound.price_per_share}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Shares (Max: {Math.min(availableShares, 50)})
            </label>
            <input
              type="number"
              min="1"
              max={Math.min(availableShares, 50)}
              value={shares}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setShares(1)
                } else {
                  const numValue = parseInt(value)
                  if (!isNaN(numValue)) {
                    setShares(Math.max(1, Math.min(numValue, availableShares, 50)))
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="bg-primary-light bg-opacity-20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
            </div>
            {user && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600">Your Balance:</span>
                <span className={`font-semibold ${
                  parseFloat(user.balance.toString()) >= totalAmount ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${parseFloat(user.balance.toString()).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleParticipate}
            disabled={loading || !user}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Participation'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Navigation.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/Navigation.tsx`

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/resale-market', label: 'Market', icon: '🏪' },
    { href: '/my-resales', label: 'My Sales', icon: '💰' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    { href: '/referral', label: 'Referral', icon: '👥' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === item.href
                ? 'text-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

---

## ProductCard.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ProductCard.tsx`

```tsx
'use client'

import { Product, User } from '@/types/database'
import Image from 'next/image'
import { useState } from 'react'
import LotteryModal from './LotteryModal'

interface ProductCardProps {
  product: Product
  user: User | null
}

export default function ProductCard({ product, user }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const activeRound = product.active_rounds?.[0]

  const getProductName = (names: Record<string, string>) => {
    // 根据用户语言偏好选择名称
    if (typeof window !== 'undefined') {
      const userLang = localStorage.getItem('userLang') || 'en'
      return names[userLang] || names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
    }
    return names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
  }

  const getProductDescription = (descriptions: Record<string, string>) => {
    // 根据用户语言偏好选择描述
    if (typeof window !== 'undefined') {
      const userLang = localStorage.getItem('userLang') || 'en'
      return descriptions[userLang] || descriptions['en'] || descriptions['zh'] || Object.values(descriptions)[0] || ''
    }
    return descriptions['en'] || descriptions['zh'] || Object.values(descriptions)[0] || ''
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
        onClick={() => activeRound && setShowModal(true)}
      >
        <div className="relative h-48 bg-gray-200">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 w-full h-full"></div>
            </div>
          )}
          
          {!imageError ? (
            <Image
              src={product.image_url}
              alt={getProductName(product.name)}
              fill
              className="object-cover transition-opacity duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-center">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{getProductName(product.name)}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {getProductDescription(product.description)}
          </p>
          
          {activeRound ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Per Share:</span>
                <span className="font-bold text-primary">${activeRound.price_per_share}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((activeRound.sold_shares / activeRound.total_shares) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>{activeRound.sold_shares}/{activeRound.total_shares} Sold</span>
                <span className={`font-semibold ${
                  activeRound.status === 'active' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {activeRound.status === 'active' ? 'Active' : 'Ready to Draw'}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className="w-full mt-2 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={activeRound.status !== 'active'}
              >
                {activeRound.status === 'active' ? 'Participate Now' : 'View Details'}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-2">
              No active lottery
            </div>
          )}
        </div>
      </div>

      {showModal && activeRound && (
        <LotteryModal
          product={product}
          lotteryRound={activeRound}
          user={user}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
```

---

## UserBalance.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/UserBalance.tsx`

```tsx
'use client'

import { User } from '@/types/database'

interface UserBalanceProps {
  user: User
}

export default function UserBalance({ user }: UserBalanceProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">Welcome, {user.full_name || user.username || 'User'}</p>
      </div>
      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
        <p className="text-xs opacity-90">Balance</p>
        <p className="text-lg font-bold">${parseFloat(user.balance.toString()).toFixed(2)}</p>
      </div>
    </div>
  )
}
```

---

## ui/alert.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/alert.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border border-gray-200 bg-white p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
      className
    )}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
```

---

## ui/badge.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/badge.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-transparent'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
```

---

## ui/button.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/button.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100 hover:text-gray-900',
      link: 'text-blue-600 underline-offset-4 hover:underline'
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

---

## ui/card.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/card.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-white text-gray-950 shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

---

## ui/dialog.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/dialog.tsx`

```tsx
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
}
```

---

## ui/input.tsx

**路径：** `/workspace/telegram-lottery-miniapp/components/ui/input.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
```

---

## 文件统计

总共包含文件数量：**11个**

### 根目录文件 (5个)：
1. ErrorBoundary.tsx - 错误边界组件
2. LotteryModal.tsx - 彩票参与弹窗组件
3. Navigation.tsx - 导航栏组件
4. ProductCard.tsx - 产品卡片组件
5. UserBalance.tsx - 用户余额组件

### ui 子目录文件 (6个)：
1. alert.tsx - 警告提示组件
2. badge.tsx - 徽章组件
3. button.tsx - 按钮组件
4. card.tsx - 卡片组件
5. dialog.tsx - 对话框组件
6. input.tsx - 输入框组件

## 总结

以上是 `/workspace/telegram-lottery-miniapp/components/` 目录下所有文件的完整内容。这些组件构成了一个Telegram彩票小程序的UI组件库，包含主要功能组件和基础UI组件。