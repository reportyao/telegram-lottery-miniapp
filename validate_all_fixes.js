const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证所有修复内容...\n');

const fixes = [
  {
    name: 'database.ts 修复',
    file: '/workspace/telegram-lottery-miniapp/types/database.ts',
    checks: [
      { pattern: 'export const LotteryStatus = {', type: 'pattern' },
      { pattern: 'export const ProductStatus = {', type: 'pattern' },
      { pattern: 'export const OrderStatus = {', type: 'pattern' },
      { pattern: 'export const TransactionType = {', type: 'pattern' },
      { pattern: 'export type SupportedLanguage = \'en\' | \'zh\' | \'ru\' | \'tg\'', type: 'pattern' }
    ]
  },
  {
    name: 'supabase.ts 修复',
    file: '/workspace/telegram-lottery-miniapp/lib/supabase.ts',
    checks: [
      { pattern: 'export const handleDatabaseError', type: 'pattern' },
      { pattern: 'export async function withRetry', type: 'pattern' },
      { pattern: 'function isRetryableError', type: 'pattern' },
      { pattern: 'export async function withTransaction', type: 'pattern' }
    ]
  },
  {
    name: 'telegram.ts 修复',
    file: '/workspace/telegram-lottery-miniapp/lib/telegram.ts',
    checks: [
      { pattern: 'export class TelegramService', type: 'pattern' },
      { pattern: 'async authenticateUser', type: 'pattern' },
      { pattern: 'CloudStorage:', type: 'pattern' }
    ]
  },
  {
    name: 'useTelegram.ts 修复',
    file: '/workspace/telegram-lottery-miniapp/hooks/useTelegram.ts',
    checks: [
      { pattern: 'function isTelegramWebApp()', type: 'pattern' },
      { pattern: 'export function useTelegram()', type: 'pattern' },
      { pattern: 'hapticFeedback', type: 'pattern' }
    ]
  },
  {
    name: 'performance.ts 修复',
    file: '/workspace/telegram-lottery-miniapp/lib/performance.ts',
    checks: [
      { pattern: 'export function useNetworkStatus()', type: 'pattern' },
      { pattern: 'export function retryWithBackoff', type: 'pattern' },
      { pattern: 'export function debounce', type: 'pattern' },
      { pattern: 'export function throttle', type: 'pattern' }
    ]
  },
  {
    name: 'package.json 配置',
    file: '/workspace/telegram-lottery-miniapp/package.json',
    checks: [
      { pattern: '"@telegram-apps/sdk": "^1.1.0"', type: 'pattern' },
      { pattern: '"next": "^14.1.0"', type: 'pattern' },
      { pattern: '"@supabase/supabase-js": "^2.39.0"', type: 'pattern' }
    ]
  },
  {
    name: 'next.config.js 配置',
    file: '/workspace/telegram-lottery-miniapp/next.config.js',
    checks: [
      { pattern: 'experimental: {', type: 'pattern' },
      { pattern: 'optimizePackageImports:', type: 'pattern' },
      { pattern: 'output: \'standalone\'', type: 'pattern' }
    ]
  },
  {
    name: 'layout.tsx 修复',
    file: '/workspace/telegram-lottery-miniapp/app/layout.tsx',
    checks: [
      { pattern: 'function NetworkStatusIndicator()', type: 'pattern' },
      { pattern: 'preconnect', type: 'pattern' },
      { pattern: 'dns-prefetch', type: 'pattern' }
    ]
  },
  {
    name: 'page.tsx 修复',
    file: '/workspace/telegram-lottery-miniapp/app/page.tsx',
    checks: [
      { pattern: 'optimizeProductsForNetwork', type: 'pattern' },
      { pattern: 'useNetworkStatus', type: 'pattern' },
      { pattern: 'retryWithBackoff', type: 'pattern' }
    ]
  },
  {
    name: 'ProductCard.tsx 修复',
    file: '/workspace/telegram-lottery-miniapp/components/ProductCard.tsx',
    checks: [
      { pattern: 'getProductName', type: 'pattern' },
      { pattern: 'getProductDescription', type: 'pattern' },
      { pattern: 'imageError', type: 'pattern' }
    ]
  },
  {
    name: 'LotteryModal.tsx 修复',
    file: '/workspace/telegram-lottery-miniapp/components/LotteryModal.tsx',
    checks: [
      { pattern: 'handleParticipate', type: 'pattern' },
      { pattern: 'CustomEvent', type: 'pattern' }
    ]
  },
  {
    name: 'ErrorBoundary.tsx 修复',
    file: '/workspace/telegram-lottery-miniapp/components/ErrorBoundary.tsx',
    checks: [
      { pattern: 'reportError', type: 'pattern' },
      { pattern: 'componentDidCatch', type: 'pattern' },
      { pattern: 'handleRetry', type: 'pattern' }
    ]
  },
  {
    name: 'tailwind.config.js 配置',
    file: '/workspace/telegram-lottery-miniapp/tailwind.config.js',
    checks: [
      { pattern: 'keyframes: {', type: 'pattern' },
      { pattern: 'fadeIn:', type: 'pattern' },
      { pattern: 'slideUp:', type: 'pattern' }
    ]
  },
  {
    name: 'tsconfig.json 配置',
    file: '/workspace/telegram-lottery-miniapp/tsconfig.json',
    checks: [
      { pattern: '"strict": true', type: 'pattern' },
      { pattern: '"moduleResolution": "bundler"', type: 'pattern' }
    ]
  }
];

let totalChecks = 0;
let passedChecks = 0;

fixes.forEach(fix => {
  console.log(`📁 验证: ${fix.name}`);
  
  if (!fs.existsSync(fix.file)) {
    console.log(`  ❌ 文件不存在: ${fix.file}\n`);
    return;
  }
  
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    
    fix.checks.forEach(check => {
      totalChecks++;
      if (content.includes(check.pattern)) {
        passedChecks++;
        console.log(`  ✅ ${check.pattern.substring(0, 50)}...`);
      } else {
        console.log(`  ❌ 未找到: ${check.pattern.substring(0, 50)}...`);
      }
    });
  } catch (error) {
    console.log(`  ❌ 读取文件失败: ${error.message}`);
  }
  
  console.log('');
});

console.log('=' * 60);
console.log(`📊 验证总结:`);
console.log(`   总检查项: ${totalChecks}`);
console.log(`   通过检查: ${passedChecks}`);
console.log(`   失败检查: ${totalChecks - passedChecks}`);
console.log(`   成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
console.log('=' * 60);

if (passedChecks === totalChecks) {
  console.log('🎉 所有修复内容验证成功！');
  process.exit(0);
} else {
  console.log('⚠️  部分修复内容验证失败，请检查。');
  process.exit(1);
}
