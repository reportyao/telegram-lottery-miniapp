# GitHub代码包-1-配置文件

本文档包含了完整的前端项目配置文件集合，适用于现代React/Next.js项目开发。

## 📦 package.json

项目包管理配置文件，包含依赖、脚本和项目元信息。

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "pre-push": "npm run test",
    "clean": "rm -rf .next out dist node_modules/.cache"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-config-next": "^14.0.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^5.0.0",
    "husky": "^8.0.0",
    "jest": "^29.6.0",
    "jest-environment-jsdom": "^29.6.0",
    "lint-staged": "^13.2.0",
    "postcss": "^8.4.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

## 🔧 tsconfig.json

TypeScript配置文件，定义编译选项和路径映射。

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/styles/*": ["./src/styles/*"]
    },
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "*.config.js"
  ]
}
```

## ⚡ next.config.js

Next.js配置文件，定义构建和运行选项。

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,
  swcMinify: true,
  
  // 实验性功能
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: [],
  },
  
  // 图片优化
  images: {
    domains: ['example.com', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // 环境变量
  env: {
    customKey: process.env.customKey,
  },
  
  // Webpack配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
    }
    
    return config;
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },
  
  // 重写配置
  async rewrites() {
    return [
      {
        source: '/api/old/:path*',
        destination: '/api/new/:path*',
      },
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // 输出配置
  output: undefined, // 'standalone' for serverless deployment
  
  // 性能分析
  analyticsId: process.env.ANALYTICS_ID,
};

module.exports = nextConfig;
```

## 🎨 tailwind.config.js

Tailwind CSS配置文件，定义样式系统。

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
      },
      
      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      
      // 自定义间距
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      // 自定义断点
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      // 自定义圆角
      borderRadius: {
        '4xl': '2rem',
      },
      
      // 自定义阴影
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
      },
      
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
      },
      
      // 关键帧
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // z-index扩展
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // 自定义插件
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass': {
          'backdrop-filter': 'blur(10px)',
          'background-color': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
```

## 🔄 postcss.config.js

PostCSS配置文件，处理CSS后处理器。

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}
```

## 📝 .eslintrc.json

ESLint配置文件，代码质量检查。

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "prettier/prettier": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "no-param-reassign": "error"
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    }
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "dist/",
    "coverage/"
  ]
}
```

## 🔧 .eslintignore

ESLint忽略文件配置。

```
node_modules/
.next/
out/
dist/
build/
coverage/
*.config.js
*.config.ts
public/
```

## 🎨 .prettierrc

Prettier代码格式化配置。

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 200
      }
    },
    {
      "files": "*.md",
      "options": {
        "printWidth": 80,
        "proseWrap": "always"
      }
    }
  ]
}
```

## 🧪 jest.config.js

Jest测试框架配置。

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 提供 Next.js 应用的根目录
  dir: './',
})

// 自定义的 Jest 配置
const customJestConfig = {
  // 在测试之前运行
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 模块名称映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // 测试环境
  testEnvironment: 'jest-environment-jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // 忽略的文件模式
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  
  // 转换文件模式
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 覆盖率排除的文件
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/dist/',
    '/coverage/',
  ],
  
  // 模拟文件
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // 测试超时时间
  testTimeout: 10000,
  
  // 是否显示测试结果
  verbose: true,
}

// 创建 Jest 配置
module.exports = createJestConfig(customJestConfig)
```

## 🧪 jest.setup.js

Jest测试环境初始化文件。

```javascript
import '@testing-library/jest-dom'

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 废弃
    removeListener: jest.fn(), // 废弃
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// 模拟 window.requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 0))

// 模拟 window.HTMLElement
global.HTMLElement = jest.fn().mockImplementation(() => ({
  getBoundingClientRect: jest.fn().mockReturnValue({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  }),
}))

// 模拟 fetch
global.fetch = jest.fn()

// 清理模拟
afterEach(() => {
  jest.clearAllMocks()
})

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
```

## 🔧 .gitignore

Git忽略文件配置。

```
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 本地环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/
build/
dist/

# 日志
*.log
logs/

# 缓存
.cache/
.parcel-cache/
.npm/
.eslintcache
.stylelintcache

# 运行时数据
pids/
*.pid
*.seed
*.pid.lock

# Coverage 目录
coverage/
*.lcov

# nyc 测试覆盖率
.nyc_output

# 测试输出
test-results/
playwright-report/
playwright/.cache/

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# 操作系统
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# 临时文件
*.tmp
*.temp

# Storybook
storybook-static/

# Sentry
.sentryclirc

# Sitemap
sitemap.xml
robots.txt
```

## 📦 .npmrc

NPM配置文件。

```
# 设置 registry
registry=https://registry.npmjs.org/

# 启用 package-lock
package-lock=true

# 设置保存前缀
save-prefix=~

# 启用可选依赖
optional=true

# 启用自动清理
auto-install-peers=true

# 禁用缺少的锁定文件警告
package-lock-only=true

# 设置缓存目录
cache-min=86400

# 启用审计
audit=true

# 启用 fund
fund=true

# 设置审计级别
audit-level=moderate
```

## 🔧 .env.example

环境变量示例文件。

```env
# 应用配置
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# 认证密钥
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 第三方服务
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 存储服务
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 支付服务
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 错误监控
SENTRY_DSN=your-sentry-dsn

# 分析服务
GOOGLE_ANALYTICS_ID=GA-...
MIXPANEL_TOKEN=your-mixpanel-token

# 开发配置
NODE_ENV=development
DEBUG=your-app:*
```

## 🔧 babel.config.js

Babel编译器配置文件。

```javascript
module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: ['>0.25%', 'not dead'],
          },
        },
      },
    ],
  ],
  plugins: [
    // 额外的插件
    ['module-resolver', {
      alias: {
        '@': './src',
        '@/components': './src/components',
        '@/lib': './src/lib',
        '@/utils': './src/utils',
      },
    }],
    // 生产环境插件
    ...(process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : []),
  ],
}
```

## 📋 .editorconfig

编辑器配置文件。

```ini
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

# JavaScript files
[*.{js,jsx,ts,tsx}]
indent_size = 2

# JSON files
[*.{json,jsonc}]
indent_size = 2

# Markdown files
[*.md]
trim_trailing_whitespace = false

# YAML files
[*.{yml,yaml}]
indent_size = 2

# Package files
[package.json]
indent_style = tab

# CSS files
[*.css]
indent_size = 2

# XML files
[*.xml]
indent_size = 2
```

## 🔧 .vscode/settings.json

VS Code工作区设置。

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "**/.next": true,
    "**/out": true,
    "**/dist": true,
    "**/coverage": true
  },
  "typescript.suggest.autoImports": true,
  "javascript.suggest.autoImports": true,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/out/**": true,
    "**/dist/**": true,
    "**/coverage/**": true
  }
}
```

## 📝 README.md

项目说明文档模板。

```markdown
# 项目名称

项目描述和简介。

## 功能特性

- ✨ 特性1
- 🚀 特性2
- 🎨 特性3

## 技术栈

- **前端框架**: Next.js 14
- **UI框架**: React 18
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand/Redux
- **测试框架**: Jest + Testing Library
- **代码规范**: ESLint + Prettier

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+ 或 yarn 1.22+ 或 pnpm

### 安装依赖

\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

### 开发环境

\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

\`\`\`bash
npm run build
npm run start
# 或
yarn build
yarn start
# 或
pnpm build
pnpm start
\`\`\`

## 脚本命令

- \`npm run dev\` - 启动开发服务器
- \`npm run build\` - 构建生产版本
- \`npm run start\` - 启动生产服务器
- \`npm run lint\` - 运行 ESLint 检查
- \`npm run lint:fix\` - 自动修复 ESLint 问题
- \`npm run type-check\` - 运行 TypeScript 类型检查
- \`npm run test\` - 运行测试
- \`npm run test:watch\` - 监听模式运行测试
- \`npm run test:coverage\` - 生成测试覆盖率报告
- \`npm run clean\` - 清理构建文件

## 项目结构

\`\`\`
src/
├── app/                 # Next.js App Router
├── components/          # 可复用组件
├── lib/                # 工具库和配置
├── hooks/              # 自定义Hooks
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── styles/             # 全局样式
└── ...
\`\`\`

## 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查，提交前会自动运行代码格式化。

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- \`feat:\` 新功能
- \`fix:\` 修复
- \`docs:\` 文档更新
- \`style:\` 代码格式
- \`refactor:\` 代码重构
- \`test:\` 测试相关
- \`chore:\` 构建流程或辅助工具

### 分支策略

- \`main\` 主分支
- \`develop\` 开发分支
- \`feature/\` 功能分支
- \`hotfix/\` 热修复分支

## 部署

支持多种部署方式：

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/repo)

### Docker

\`\`\`bash
docker build -t app-name .
docker run -p 3000:3000 app-name
\`\`\`

## 性能优化

- 📦 代码分割和懒加载
- 🖼️ 图片优化和 WebP 格式
- 💾 缓存策略
- ⚡ PWA 支持

## 浏览器支持

现代浏览器支持：
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 贡献指南

1. Fork 项目
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 许可证

本项目基于 [MIT](LICENSE) 许可证。

## 联系方式

- 作者: 您的姓名
- 邮箱: your.email@example.com
- 项目链接: [https://github.com/username/repo](https://github.com/username/repo)

## 致谢

感谢所有为这个项目做出贡献的开发者。
```

---

## 🎯 使用说明

这个配置文件包包含了现代前端项目开发的所有必要配置：

### 🔧 **核心配置文件**
- **package.json** - 项目依赖和脚本
- **tsconfig.json** - TypeScript编译配置
- **next.config.js** - Next.js框架配置
- **tailwind.config.js** - CSS框架配置
- **postcss.config.js** - CSS后处理器配置

### 📝 **代码质量配置**
- **.eslintrc.json** - 代码规范检查
- **.prettierrc** - 代码格式化
- **jest.config.js** - 测试框架配置
- **babel.config.js** - JavaScript编译器配置

### 🎨 **开发环境配置**
- **.editorconfig** - 编辑器统一配置
- **.vscode/settings.json** - VS Code工作区设置
- **.gitignore** - Git版本控制忽略
- **.npmrc** - NPM包管理器配置

### 📚 **文档模板**
- **.env.example** - 环境变量示例
- **README.md** - 项目说明文档

### 🧪 **测试配置**
- **jest.setup.js** - 测试环境初始化
- **coverage** - 覆盖率配置

### 📋 **项目特点**

✅ **现代化技术栈**: Next.js 14 + React 18 + TypeScript  
✅ **完整的代码质量体系**: ESLint + Prettier + TypeScript  
✅ **全面的测试配置**: Jest + Testing Library  
✅ **优化的样式系统**: Tailwind CSS + PostCSS  
✅ **开发体验优化**: 热重载、错误处理、代码提示  
✅ **生产环境就绪**: 性能优化、安全配置、部署支持  
✅ **团队协作友好**: 统一的代码规范和开发环境  

### 🚀 **快速开始**

1. 将这些配置文件复制到您的项目根目录
2. 根据项目需求调整配置（如项目名称、依赖版本等）
3. 运行 `npm install` 安装依赖
4. 执行 `npm run dev` 启动开发服务器

这个配置包适合用于：
- 企业级前端项目
- 个人开源项目  
- 团队协作项目
- 学习实践项目

所有配置都经过优化，可直接用于生产环境！