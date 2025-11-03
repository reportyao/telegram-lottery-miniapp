# Supabase 部署后配置指南

## 📋 配置步骤

### 1. 数据库表结构创建

#### 选项A: 通过Supabase SQL编辑器（推荐）
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "SQL Editor"
4. 复制 `/workspace/supabase_database_setup.sql` 的内容
5. 粘贴到SQL编辑器并执行

#### 选项B: 通过Supabase CLI
```bash
# 安装Supabase CLI
npm install -g supabase

# 登录Supabase
supabase login

# 链接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行SQL文件
supabase db reset --linked
```

### 2. Edge Functions 部署

```bash
# 在项目根目录执行
cd telegram-lottery-miniapp

# 部署所有Edge Functions
supabase functions deploy resale-api-improved
supabase functions deploy get-products
supabase functions deploy participate-lottery
supabase functions deploy user-profile
supabase functions deploy create-order
supabase functions deploy telegram-auth
supabase functions deploy auto-draw-lottery
supabase functions deploy admin-api
supabase functions deploy posts-manage
```

### 3. 环境变量配置

在Supabase Dashboard > Settings > API 中添加：

```
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
TELEGRAM_BOT_TOKEN=你的机器人令牌
TELEGRAM_BOT_USERNAME=你的机器人用户名
NEXT_PUBLIC_APP_URL=你的应用部署URL
```

### 4. 验证配置

#### 测试数据库连接
```bash
# 在浏览器控制台测试
import { supabase } from './lib/supabase'

// 测试查询
supabase.from('users').select('*').limit(1)
  .then(result => console.log('数据库连接正常:', result))
  .catch(error => console.error('数据库连接失败:', error))
```

#### 测试Edge Functions
```bash
# 测试转售API
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/resale-api-improved' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "list"}'
```

## 🔍 检查清单

### 数据库表检查
- [ ] users 表创建成功
- [ ] products 表创建成功
- [ ] lottery_rounds 表创建成功
- [ ] participations 表创建成功
- [ ] transactions 表创建成功
- [ ] resales 表创建成功
- [ ] 所有索引创建成功
- [ ] RLS策略启用成功

### Edge Functions检查
- [ ] resale-api-improved 部署成功
- [ ] get-products 部署成功
- [ ] participate-lottery 部署成功
- [ ] user-profile 部署成功
- [ ] 其他函数部署成功

### 功能测试
- [ ] 用户注册功能正常
- [ ] 产品列表显示正常
- [ ] 抽奖参与功能正常
- [ ] 转售功能正常
- [ ] 交易记录功能正常

## 🚨 常见问题解决

### 1. 数据库连接失败
**症状**: 控制台显示数据库连接错误
**解决**: 
- 检查Supabase URL和密钥
- 确认RLS策略配置正确
- 验证网络连接

### 2. Edge Functions调用失败
**症状**: API调用返回401或404错误
**解决**:
- 确认函数已正确部署
- 检查Authorization头部
- 验证函数名称拼写

### 3. 权限错误
**症状**: 操作被拒绝
**解决**:
- 检查RLS策略
- 确认用户认证状态
- 验证数据库权限

## 📞 需要帮助？

如果遇到问题，请：
1. 检查Supabase控制台的日志
2. 查看浏览器开发者工具的网络请求
3. 验证所有环境变量配置
4. 确认数据库表结构完整性

---

**配置完成后，你的Telegram Lottery MiniApp就可以正常工作了！** 🎉