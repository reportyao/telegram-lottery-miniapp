# LuckyMart 管理后台

完整的夺宝平台管理系统，提供用户、商品、订单、财务等全方位管理功能。

## 功能模块

### 1. 仪表板 (Dashboard)
- 用户统计
- 销售统计
- 收入统计
- 活跃度统计
- 待处理事项统计
- 最近活动展示

### 2. 用户管理 (Users)
- 用户列表查看
- 用户详情查看
- 用户状态管理（启用/禁用）
- 余额调整
- 用户统计信息

### 3. 夺宝管理 (Lotteries)
- 夺宝商品列表
- 创建新夺宝
- 编辑夺宝信息
- 状态管理
- **开奖管理** - 随机选出中奖者

### 4. 订单管理 (Orders)
- 订单列表查看
- 订单详情查看
- 订单搜索功能

### 5. 充值审核 (Deposit Review)
- 待审核充值列表
- 审核通过/拒绝
- 管理员备注
- 自动更新用户余额

### 6. 提现审核 (Withdrawal Review)
- 待审核提现列表
- 提现信息查看
- 审核操作
- 提现状态管理

### 7. 发货管理 (Shipping Management)
- 待发货订单列表
- 填写物流信息
- 物流公司选择
- 状态更新

### 8. 晒单审核 (Showoff Review)
- 待审核晒单列表
- 晒单详情查看
- 审核通过/拒绝
- 管理员备注

### 9. 转售市场管理 (Resale Management)
- 转售列表查看
- 转售详情查看
- 状态管理

### 10. 支付配置 (Payment Config)
- 支付方式配置
- 启用/禁用支付方式
- 支付参数设置

### 11. 操作日志 (Audit Logs)
- 所有管理员操作记录
- 按操作类型筛选
- 按资源类型筛选
- 操作详情查看

## 技术栈

- **前端**: React 19 + Vite + Tailwind CSS 4
- **后端**: Express 4 + tRPC 11
- **数据库**: Supabase (PostgreSQL)
- **认证**: Manus OAuth
- **UI组件**: shadcn/ui

## 核心功能

### 开奖管理
在"夺宝管理"页面，当夺宝状态为"进行中"时，会显示"开奖"按钮。点击后可以：
1. 输入中奖人数
2. 系统随机选出中奖者
3. 自动更新中奖信息
4. 记录操作日志

### 操作日志
所有关键操作都会被记录到audit_logs表：
- 余额调整
- 开奖操作
- 充值审核
- 提现审核
- 发货更新
- 状态变更

管理员可以在"操作日志"页面查看所有操作记录，支持按操作类型和资源类型筛选。

## 环境变量配置

需要配置以下环境变量：
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_TITLE=LuckyMart管理后台
VITE_APP_LOGO=your-logo-url
```

## 数据库表

### 核心表
- users - 用户表
- lotteries - 夺宝商品表
- lottery_entries - 夺宝参与记录表
- orders - 订单表
- prizes - 中奖记录表
- deposit_requests - 充值申请表
- withdrawal_requests - 提现申请表
- shipping - 发货信息表
- payment_config - 支付配置表
- audit_logs - 操作日志表

## API路由

### 用户管理
- `users.list` - 获取用户列表
- `users.getById` - 获取用户详情
- `users.updateStatus` - 更新用户状态
- `users.adjustBalance` - 调整用户余额
- `users.getStats` - 获取用户统计

### 夺宝管理
- `lotteries.list` - 获取夺宝列表
- `lotteries.getById` - 获取夺宝详情
- `lotteries.create` - 创建夺宝
- `lotteries.update` - 更新夺宝
- `lotteries.updateStatus` - 更新夺宝状态
- `lotteries.draw` - 执行开奖

### 其他模块
- `deposits.*` - 充值管理
- `withdrawals.*` - 提现管理
- `shipping.*` - 发货管理
- `paymentConfigs.*` - 支付配置
- `auditLogs.*` - 操作日志

## 使用指南

1. **登录**: 使用Manus OAuth登录
2. **导航**: 使用左侧菜单选择功能模块
3. **操作**: 根据需要执行相应操作
4. **查询**: 使用筛选和搜索功能快速定位数据
5. **审计**: 在操作日志中查看所有操作记录

## 安全性

- 所有API都需要身份验证
- 管理员操作都会被记录
- 支持按角色的访问控制
- 敏感操作需要确认

## 后续优化方向

1. 添加数据导出功能（Excel）
2. 添加批量操作功能
3. 添加更多统计维度和图表
4. 添加系统设置模块
5. 添加用户通知功能
6. 添加API调用日志
7. 添加性能监控

---

**最后更新**: 2025-11-09
**版本**: 1.0.0
