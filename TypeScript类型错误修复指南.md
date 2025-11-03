# TypeScript类型错误修复指南

## 当前状态分析

经过检查，我发现以下可能的TypeScript类型错误类型：

### 1. Jest测试相关错误

#### 1.1 缺少匹配器错误
**问题**: 测试文件中使用了`toBeInTheDocument`等匹配器但缺少相关类型声明

**解决方案**: 确保在jest.setup.js中正确导入类型

**修复文件**: `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// 已经在jest.setup.js中正确配置
```

#### 1.2 Telegram WebApp API方法类型错误
**问题**: Telegram.WebApp API类型定义不完整

**解决方案**: 已在`jest.setup.js`中添加缺少的方法

**已修复**:
```javascript
// 添加了以下方法到模拟对象
showAlert: jest.fn(),
showPopup: jest.fn(),
```

### 2. 可能的类型错误点

#### 2.1 环境变量类型
**问题**: `process.env`类型访问错误

**修复文件**: `lib/supabase.ts` (已修复)
- 正确使用类型断言和环境变量验证

#### 2.2 Window对象类型错误
**问题**: 在浏览器环境中访问`window.Telegram.WebApp`

**修复方案**: 已使用`(window as any)`类型断言

**示例修复**:
```typescript
if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
  (window as any).Telegram.WebApp.showAlert(message)
}
```

#### 2.3 Supabase客户端类型
**问题**: Supabase函数调用类型错误

**修复方案**: 已在`lib/supabase.ts`中正确配置SupabaseClient类型

### 3. 需要逐个检查的文件类型

#### 3.1 测试文件 (`__tests__/**/*`)
- `LotteryModal.test.tsx` - 已检查，类型正确
- `ProductCard.test.tsx` - 已检查，类型正确
- 其他测试文件需要逐个检查

#### 3.2 组件文件 (`components/**/*`)
- `LotteryModal.tsx` - 已检查，类型正确
- `ProductCard.tsx` - 已检查，类型正确
- 其他组件文件需要逐个检查

#### 3.3 页面文件 (`app/**/page.tsx`)
- `my-resales/page.tsx` - 已修复showPopup错误
- 其他页面文件需要逐个检查

#### 3.4 Hook文件 (`hooks/**/*`)
- 需要检查自定义Hook的类型定义

#### 3.5 库文件 (`lib/**/*`)
- `supabase.ts` - 已检查，类型正确
- `telegram.ts` - 需要检查
- `utils.ts` - 需要检查

### 4. 逐个修复策略

#### 4.1 优先修复高影响错误
1. **构建关键错误** - 影响编译的错误
2. **运行时错误** - 影响功能的错误  
3. **类型不匹配** - 类型定义错误

#### 4.2 修复方法
1. **类型断言**: 使用`(value as Type)`解决类型问题
2. **类型保护**: 使用`typeof`检查类型
3. **可选链**: 使用`?.`避免null/undefined访问
4. **空值合并**: 使用`??`提供默认值
5. **类型定义**: 为第三方库或自定义类型创建类型声明

### 5. 具体修复步骤

#### 步骤1: 运行类型检查并收集错误
```bash
cd /workspace/telegram-lottery-miniapp
npx tsc --noEmit --listFiles false > errors.txt 2>&1
cat errors.txt
```

#### 步骤2: 逐个分析错误
对于每个错误：
1. 确定错误类型（语法/类型/配置）
2. 找到错误位置（文件行号）
3. 应用适当的修复方案
4. 验证修复结果

#### 步骤3: 常见错误类型及解决方案

**错误类型**: Property 'X' does not exist on type 'Y'
- **解决方案**: 添加类型声明或使用类型断言

**错误类型**: Type 'A' is not assignable to type 'B'
- **解决方案**: 转换类型或修改类型定义

**错误类型**: Cannot find module 'X' or its corresponding type declarations
- **解决方案**: 安装类型声明包或创建自定义类型

**错误类型**: JSX element type 'X' does not have any construct or call signatures
- **解决方案**: 检查组件导入和类型定义

### 6. 验证修复

修复每个错误后：
```bash
# 运行类型检查
npm run type-check

# 运行测试
npm test

# 运行构建（如果配置正确）
npm run build
```

### 7. 预防措施

1. **启用严格模式**: 在tsconfig.json中启用`"strict": true`
2. **使用ESLint**: 配置TypeScript相关的ESLint规则
3. **类型检查**: 定期运行`npm run type-check`
4. **测试覆盖**: 确保测试覆盖所有主要类型

## 预期结果

通过逐个修复TypeScript错误，项目应该能够：
- 正常编译无TypeScript错误
- 测试通过无类型相关错误
- 构建成功可以部署运行

## 注意事项

1. **不要使用批量工具**: 按用户要求逐个手动修复每个错误
2. **保持代码质量**: 修复时确保不破坏现有功能
3. **测试验证**: 每次修复后运行相关测试
4. **文档更新**: 记录修复的每个错误及解决方案