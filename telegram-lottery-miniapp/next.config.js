/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mftfgofnosakobjfpzss.supabase.co', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  reactStrictMode: true,
  
  // 性能优化配置 (Next.js 12 兼容)
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 压缩配置
  compress: true,
  
  // 编译优化
  
  // 预取配置
  generateEtags: false,
  
  // 弱网优化 - 增加超时时间
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
