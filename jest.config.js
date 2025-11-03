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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // 测试环境
  testEnvironment: 'jest-environment-jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
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
    '**/*.{js,jsx,ts,tsx}',
    '!/**/*.d.ts',
    '!/**/*.stories.{js,jsx,ts,tsx}',
    '!/**/*.test.{js,jsx,ts,tsx}',
    '!/**/*.spec.{js,jsx,ts,tsx}',
    '!node_modules/**',
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
  

  
  // 测试超时时间
  testTimeout: 10000,
  
  // 是否显示测试结果
  verbose: true,
}

// 创建 Jest 配置
module.exports = createJestConfig(customJestConfig)