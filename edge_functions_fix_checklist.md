# Edge Functions 修复清单

## 🚨 立即修复（高优先级）

### 1. 修复外部导入违规
- [ ] **resale-api-improved/index.ts**: 移除 `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`
- [ ] **resale-api-simple/index.ts**: 移除 `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`
- [ ] 重写这两个函数使用原生fetch API

### 2. 修复未定义变量
- [ ] **create-admin-user/index.ts:136**: 将 `logger.error` 替换为 `console.error`

### 3. 加强输入验证
为以下函数添加完整的输入验证：
- [ ] admin-api - 添加资源类型和操作验证
- [ ] create-order - 验证金额为正数
- [ ] participate-lottery - 验证shares_count > 0
- [ ] posts-manage - 验证内容长度限制
- [ ] resale-api - 验证转售参数

### 4. 修复CORS配置
- [ ] 将所有函数的 `'Access-Control-Allow-Origin': '*'` 替换为具体的域名列表
- [ ] 建议的允许域名：
  ```typescript
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
    'https://app.yourdomain.com'
  ];
  ```

## ⚠️ 重要修复（中优先级）

### 5. 统一错误处理格式
- [ ] 创建统一的错误响应格式：
  ```typescript
  interface ErrorResponse {
    success: false;
    error: {
      code: string;
      message: string;
      timestamp: string;
      details?: any;
    };
  }
  ```
- [ ] 重写所有函数的错误返回格式

### 6. 加强数据库错误处理
- [ ] 为所有数据库查询添加详细的错误处理
- [ ] 添加数据库连接超时处理
- [ ] 添加查询结果验证

### 7. 添加SQL注入防护
- [ ] 验证所有用户输入参数
- [ ] 使用参数化查询替代字符串拼接
- [ ] 添加输入过滤和清理

### 8. 完善日志记录
- [ ] 在关键操作点添加结构化日志
- [ ] 记录请求参数和响应时间
- [ ] 添加错误堆栈跟踪

## 🔧 优化改进（低优先级）

### 9. 类型安全问题
- [ ] 定义接口类型替换所有 `any` 类型
- [ ] 创建类型定义文件 `types.ts`
- [ ] 添加严格的类型检查

### 10. 清理调试代码
- [ ] **participate-lottery-fixed**: 移除所有console.log语句
- [ ] 或使用环境变量控制调试输出：
  ```typescript
  if (Deno.env.get('DEBUG') === 'true') {
    console.log('Debug info:', data);
  }
  ```

### 11. 数值精度处理
- [ ] 创建Decimal工具函数处理货币计算
- [ ] 替换所有parseFloat使用Decimal类型
- [ ] 处理货币舍入规则

### 12. 代码重复优化
- [ ] 提取公共错误处理函数
- [ ] 创建标准化的CORS头配置
- [ ] 创建通用的数据库查询函数

## 🗑️ 清理任务

### 13. 临时函数处理
- [ ] 评估是否需要保留 `create-bucket-product-images-temp`
- [ ] 评估是否需要保留 `create-bucket-user-posts-temp`
- [ ] 如需保留，重命名为正式函数并完善错误处理

### 14. 死代码清理
- [ ] 移除未使用的函数
- [ ] 清理注释的代码
- [ ] 优化导入语句

## 🧪 测试建议

### 15. 添加测试用例
- [ ] 为每个函数创建单元测试
- [ ] 测试边界条件和错误情况
- [ ] 添加集成测试覆盖完整流程

### 16. 性能测试
- [ ] 测试并发请求处理
- [ ] 验证数据库事务的ACID属性
- [ ] 测试长时间运行的函数稳定性

## 📋 修复进度跟踪

| 任务 | 状态 | 负责人 | 完成时间 | 备注 |
|------|------|--------|----------|------|
| 修复外部导入 | ⏳ | | | resale-api相关函数 |
| 修复logger变量 | ⏳ | | | create-admin-user |
| 加强输入验证 | ⏳ | | | 所有核心函数 |
| 修复CORS配置 | ⏳ | | | 16个函数 |
| 统一错误格式 | ⏳ | | | 重构任务 |
| 类型安全改进 | ⏳ | | | 长期任务 |

## 📝 修复后的验收标准

### 功能性验收
- [ ] 所有函数正常部署和运行
- [ ] API响应格式统一一致
- [ ] 错误处理机制完善
- [ ] 输入验证严格有效

### 安全性验收
- [ ] CORS配置适当限制
- [ ] 无SQL注入风险
- [ ] 无外部依赖违规
- [ ] 敏感信息不暴露

### 代码质量验收
- [ ] TypeScript类型检查通过
- [ ] 无未定义变量引用
- [ ] 代码重复度<10%
- [ ] 调试代码已清理

### 性能验收
- [ ] 函数响应时间<1秒
- [ ] 并发处理稳定
- [ ] 内存使用合理
- [ ] 无内存泄漏

---
*清单创建时间: 2025-11-04*
*预计修复时间: 2-3天*