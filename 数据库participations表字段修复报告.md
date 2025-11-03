# 数据库participations表字段修复报告

## 问题分析

### 错误现象
- 点击"立即参与夺宝"按钮后，API返回500错误
- 错误信息：`Could not find the 'amount_paid' column of 'participations' in the schema cache`

### 问题原因
数据库 `participations` 表缺少 `amount_paid` 字段，但代码多处使用了该字段：

1. **后端Edge Function**: `/supabase/functions/participate-lottery/index.ts` 第131行尝试插入 `amount_paid: totalAmount`
2. **用户档案页面**: `/telegram-lottery-miniapp/app/profile/page.tsx` 第56行计算总消费金额
3. **用户档案API**: `/supabase/functions/user-profile/index.ts` 第95行使用amount_paid计算总支出
4. **转售API**: `/supabase/functions/resale-api/index.ts` 第263行使用amount_paid字段

## 解决方案

### 1. 数据库迁移
创建迁移文件添加缺失字段：

```sql
-- /workspace/supabase/migrations/1762183000_add_amount_paid_to_participations.sql
ALTER TABLE participations 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 更新现有记录的计算金额
UPDATE participations 
SET amount_paid = shares_count * (
    SELECT price_per_share 
    FROM lottery_rounds 
    WHERE lottery_rounds.id = participations.lottery_round_id
)
WHERE amount_paid = 0.00 OR amount_paid IS NULL;
```

### 2. 代码验证
检查了以下文件的类型定义，均已正确包含amount_paid字段：

- `/telegram-lottery-miniapp/types/database.ts` - 第53行
- `/telegram-lottery-miniapp/database.ts` - 第289行

### 3. 字段用途说明

`amount_paid` 字段用于：
- 记录用户参与抽奖支付的金额
- 计算用户的总消费
- 支持转售系统中的成本计算
- 数据统计和报表功能

## 实施步骤

### 执行迁移
在Supabase控制台或通过CLI执行迁移：

```bash
# 方法1: 通过Supabase CLI
supabase db push

# 方法2: 直接在SQL编辑器中执行
\i /workspace/supabase/migrations/1762183000_add_amount_paid_to_participations.sql
```

### 验证修复
执行数据库检查脚本：
```bash
node /workspace/check_database_structure.js
```

## 预期结果

执行迁移后，以下功能将正常工作：
1. 用户参与抽奖功能
2. 用户档案页面显示总消费金额
3. 转售系统的成本计算
4. 数据统计功能

## 后续维护

1. **监控**: 观察相关API的错误日志
2. **测试**: 验证完整的参与流程
3. **优化**: 考虑添加数据验证约束

---

**修复状态**: ✅ 已完成迁移文件创建，等待数据库执行  
**优先级**: 高 - 影响核心抽奖功能  
**影响范围**: 所有参与抽奖的用户  
**测试建议**: 测试完整参与流程，从产品页面到支付确认