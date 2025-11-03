// 性能优化和弱网环境配置

import { useState, useEffect } from 'react'

// 网络状态类型
export interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

// 简化的网络状态检测函数 (用于非React环境)
export function getNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined') {
    return { 
      isOnline: true, 
      connectionType: 'unknown',
      downlink: undefined,
      rtt: undefined,
      saveData: false
    }
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    isOnline: navigator.onLine,
    connectionType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData
  }
}

// React Hook (仅在客户端组件中使用)
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    // 服务器端渲染时的默认值
    if (typeof window === 'undefined') {
      return { 
        isOnline: true, 
        connectionType: 'unknown',
        downlink: undefined,
        rtt: undefined,
        saveData: false
      }
    }
    return getNetworkStatus()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }))
    }

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      if (connection) {
        setStatus(prev => ({
          ...prev,
          connectionType: connection.effectiveType || 'unknown',
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }))
      }
    }

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // 监听连接信息变化（如果支持）
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo)
    }

    // 初始化状态
    updateOnlineStatus()
    updateConnectionInfo()

    // 清理函数
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  return status
}

// 智能重试机制
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        break
      }

      // 指数退避
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// 图片优化配置
export const imageConfig = {
  formats: ['image/webp', 'image/avif'] as const,
  quality: 75,
  placeholder: 'blur',
  priority: false,
}

// API 请求超时配置
export const requestConfig = {
  timeout: 10000, // 10秒
  retries: 3,
  retryDelay: 1000,
}

// 缓存配置
export const cacheConfig = {
  // 产品数据缓存5分钟
  productsTTL: 5 * 60 * 1000,
  // 用户数据缓存1分钟
  userDataTTL: 1 * 60 * 1000,
}

// 弱网优化配置
export const weakNetworkConfig = {
  // 慢连接阈值 (网络类型)
  slowConnections: ['slow-2g', '2g'],
  // 低质量图片阈值
  lowQualityThreshold: 50, // KB
  // 预加载延迟
  preloadDelay: 2000,
  // 懒加载阈值
  lazyLoadThreshold: 100, // viewport百分比
}

// 性能监控
export function trackPerformance() {
  if (typeof window === 'undefined') return

  // 页面加载时间
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    console.log('Page Load Performance:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart,
    })
  })

  // 首次内容绘制
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      console.log('First Contentful Paint:', entry.startTime)
    })
  }).observe({ entryTypes: ['paint'] })

  // 长期任务监控
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.duration > 50) {
        console.warn('Long Task Detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
        })
      }
    })
  }).observe({ entryTypes: ['longtask'] })
}

// 资源预加载
export function preloadResource(url: string, type: 'script' | 'style' | 'image' = 'image') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  if (type === 'image') {
    link.as = 'image'
  } else if (type === 'script') {
    link.as = 'script'
  } else if (type === 'style') {
    link.as = 'style'
  }
  document.head.appendChild(link)
}

// 智能图片加载
export function shouldLoadHighQualityImage(connectionType: string): boolean {
  return !weakNetworkConfig.slowConnections.includes(connectionType)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}