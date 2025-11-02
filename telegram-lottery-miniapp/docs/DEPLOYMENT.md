# 部署指南

## 概述

本指南将帮助您将Telegram MiniApp夺宝系统部署到生产环境。

## 前置要求

- Node.js 18+
- pnpm 8+
- Vercel账号（或其他Next.js托管平台）
- Telegram Bot Token
- Supabase项目（已配置）

## 部署步骤

### 1. 准备代码

```bash
# 克隆或下载项目
cd telegram-lottery-miniapp

# 安装依赖
pnpm install

# 构建测试
pnpm build
```

### 2. 配置Supabase（已完成）

系统已配置以下内容：
- ✅ 8个数据库表
- ✅ RLS安全策略
- ✅ 4个Edge Functions
- ✅ 2个Storage Buckets
- ✅ 测试数据

Supabase URL: `https://mftfgofnosakobjfpzss.supabase.co`

### 3. Vercel部署

#### 方法1: 通过GitHub（推荐）

1. 推送代码到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/telegram-lottery-miniapp.git
git push -u origin main
```

2. 在Vercel中导入
- 访问 https://vercel.com/new
- 选择你的GitHub仓库
- 点击"Import"
- Vercel会自动检测Next.js项目
- 点击"Deploy"

3. 等待部署完成
- 部署完成后会获得一个URL（例如：`https://telegram-lottery-miniapp.vercel.app`）

#### 方法2: 通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 4. 配置自定义域名（可选）

在Vercel项目设置中：
1. 进入 Settings > Domains
2. 添加你的域名
3. 配置DNS记录（按照Vercel的指示）
4. 等待SSL证书生成

### 5. 配置Telegram Bot

#### 创建Bot
```
1. 打开Telegram，搜索 @BotFather
2. 发送 /newbot
3. 按提示创建Bot
4. 保存Bot Token
```

#### 配置Web App
```
/setmenubutton
选择你的bot
输入：
打开应用 - https://your-domain.vercel.app
```

#### 设置命令
```
/setcommands
输入：
start - 启动应用
help - 获取帮助
products - 查看商品
profile - 个人中心
orders - 我的订单
referral - 邀请好友
```

### 6. 运行Telegram Bot服务器

参考 `docs/TELEGRAM_BOT_SETUP.md` 配置Bot服务器。

简单的运行方式：
```bash
# 创建bot.py（参考TELEGRAM_BOT_SETUP.md）
python bot.py
```

生产环境建议：
- 使用systemd管理进程
- 使用Docker容器化
- 配置自动重启
- 实现日志记录

### 7. 测试部署

#### 功能测试清单

- [ ] Telegram Bot可以正常启动
- [ ] 点击菜单按钮可以打开WebApp
- [ ] 用户身份验证正常
- [ ] 可以浏览商品列表
- [ ] 可以参与夺宝（测试账户需要有余额）
- [ ] 个人中心显示正常
- [ ] 订单记录显示正常
- [ ] 推荐链接可以复制
- [ ] 多语言切换正常
- [ ] 移动端响应式正常

#### 测试脚本

在浏览器控制台中运行：
```javascript
// 测试Telegram WebApp
console.log('Telegram WebApp:', window.Telegram?.WebApp)
console.log('User:', window.Telegram?.WebApp.initDataUnsafe.user)

// 测试Supabase连接
fetch('https://mftfgofnosakobjfpzss.supabase.co/rest/v1/products?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

### 8. 监控和维护

#### Vercel监控
- 访问 Vercel Dashboard
- 查看部署日志
- 监控性能指标
- 设置告警

#### Supabase监控
- Supabase Dashboard > Logs
- 查看API请求
- 监控数据库性能
- 查看Edge Function日志

#### 数据库维护

定期任务：
```sql
-- 清理过期数据（可选）
DELETE FROM transactions WHERE created_at < NOW() - INTERVAL '1 year';

-- 数据库优化
VACUUM ANALYZE;

-- 检查索引
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 9. 性能优化

#### Next.js优化
- 启用图片优化
- 使用动态导入
- 实现缓存策略

#### Supabase优化
- 添加适当的索引
- 使用连接池
- 启用缓存

#### CDN配置
Vercel自动提供全球CDN，但可以：
- 优化图片大小
- 使用WebP格式
- 实现懒加载

### 10. 安全加固

#### 环境变量（生产环境）
虽然当前是硬编码，建议改为环境变量：
```bash
# Vercel环境变量设置
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 安全检查清单
- [ ] 启用HTTPS（Vercel自动）
- [ ] 配置CORS策略
- [ ] 启用RLS策略
- [ ] 验证Telegram initData
- [ ] 限制API调用频率
- [ ] 保护敏感端点

### 11. 备份策略

#### 数据库备份
Supabase提供自动备份，但建议：
```bash
# 手动备份
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# 定期备份脚本
0 2 * * * /path/to/backup-script.sh
```

#### 代码备份
- 使用Git进行版本控制
- 定期推送到远程仓库
- 标记重要版本

## 故障排查

### 常见问题

#### 1. WebApp无法加载
```
检查项：
- 确认Vercel部署成功
- 检查域名DNS配置
- 验证SSL证书
- 查看浏览器控制台错误
```

#### 2. 用户认证失败
```
检查项：
- Telegram Bot Token是否正确
- initData是否有效
- Edge Function是否正常运行
- Supabase凭证是否正确
```

#### 3. 参与夺宝失败
```
检查项：
- 用户余额是否充足
- 夺宝轮次状态是否为active
- RLS策略是否正确
- Edge Function日志
```

### 日志查看

#### Vercel日志
```bash
vercel logs [deployment-url]
```

#### Supabase日志
在Dashboard中查看：
- API Logs
- Edge Function Logs
- Database Logs

### 性能问题

如果遇到性能问题：
1. 检查数据库查询效率
2. 添加必要的索引
3. 优化Edge Function
4. 使用缓存策略
5. 考虑升级Supabase套餐

## 扩展和升级

### 添加新功能
1. 在本地开发和测试
2. 推送到GitHub
3. Vercel自动部署
4. 测试生产环境

### 数据库迁移
```sql
-- 创建迁移文件
-- 在Supabase SQL Editor中执行
-- 或使用Supabase CLI
```

### Edge Function更新
```bash
# 更新函数代码
# 使用Supabase CLI重新部署
supabase functions deploy function-name
```

## 生产环境清单

部署前确认：
- [ ] 所有功能测试通过
- [ ] 安全策略配置正确
- [ ] 备份策略已实施
- [ ] 监控和告警已设置
- [ ] 文档已更新
- [ ] 团队成员已培训
- [ ] 回滚方案已准备

## 联系支持

如遇到问题：
1. 查看本文档故障排查部分
2. 查看Vercel和Supabase文档
3. 在GitHub Issues中提问
4. 联系技术支持

## 成本估算

### Vercel
- Hobby Plan: 免费
- Pro Plan: $20/月（推荐生产环境）

### Supabase
- Free Tier: 适合开发和小规模使用
- Pro Plan: $25/月（推荐生产环境）
- 按需扩展

### 总计
- 开发/测试: $0/月
- 小规模生产: $0-45/月
- 中等规模生产: $45-100/月

## 后续优化

1. 实现支付集成（塔吉克斯坦本地支付）
2. 添加管理后台
3. 实现晒单功能
4. 优化推荐系统
5. 添加实时通知
6. 实现自动开奖
7. 添加数据分析面板
