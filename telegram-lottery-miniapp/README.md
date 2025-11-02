# Telegram MiniApp 夺宝系统 v2.0

面向塔吉克斯坦市场的夺宝抽奖平台，通过Telegram MiniApp作为用户入口。

## 版本信息

**当前版本**: v2.0.0 完整版
**状态**: ✅ 生产就绪
**更新日期**: 2025-11-02

### v2.0 新增功能
- ✅ **充值系统** - 用户余额充值功能
- ✅ **管理后台** - 完整的管理界面（商品、用户、抽奖、晒单管理）
- ✅ **自动开奖** - 定时任务自动处理抽奖（每6小时）
- ✅ **晒单功能** - 用户分享、点赞、评论系统

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **集成**: Telegram Bot + Web Apps SDK
- **多语言**: 中文、英文、塔吉克语、俄语

## 功能特性

### 用户端功能
- ✅ 用户管理系统（Telegram身份验证）
- ✅ 商品浏览和搜索
- ✅ 夺宝系统核心（参与、开奖、中奖查询）
- ✅ 充值系统（多种金额选择）
- ✅ 订单管理和交易记录
- ✅ 推荐系统（邀请好友赚奖励）
- ✅ 晒单社区（发布、点赞、评论）
- ✅ 多语言支持（中英俄塔四语）

### 管理端功能
- ✅ 管理员登录认证
- ✅ Dashboard统计面板
- ✅ 商品管理（创建、编辑、库存）
- ✅ 用户管理（查看、余额管理）
- ✅ 抽奖管理（创建、手动开奖）
- ✅ 晒单审核（批准、拒绝）
- ✅ 数据统计（用户、收入、订单）

### 自动化功能
- ✅ 定时自动开奖（每6小时）
- ✅ 余额自动更新
- ✅ 统计数据自动计算
- ✅ 库存自动减少

### 数据库架构
12个核心表：
- `users` - 用户信息
- `products` - 商品信息（JSONB多语言支持）
- `lottery_rounds` - 夺宝轮次
- `participations` - 参与记录
- `orders` - 订单
- `transactions` - 交易记录
- `referrals` - 邀请关系
- `system_settings` - 系统设置
- `posts` - 晒单帖子 ⭐新增
- `post_likes` - 点赞记录 ⭐新增
- `post_comments` - 评论 ⭐新增
- `admins` - 管理员 ⭐新增

### Edge Functions
用户端：
- `telegram-auth` - Telegram用户身份验证
- `participate-lottery` - 用户参与夺宝
- `get-products` - 获取商品列表
- `user-profile` - 获取用户信息和统计
- `create-order` - 充值订单处理 ⭐新增
- `posts-manage` - 晒单管理 ⭐新增

管理端与自动化：
- `admin-api` - 管理后台API ⭐新增
- `auto-draw-lottery` - 自动开奖定时任务 ⭐新增

## 快速开始

### 1. 安装依赖

```bash
cd telegram-lottery-miniapp
pnpm install
```

### 2. 配置环境变量

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：
```bash
# Supabase配置 - 请替换为您的实际值
NEXT_PUBLIC_SUPABASE_URL=您的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的Supabase匿名密钥

# Telegram Bot配置（可选）
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=您的Telegram Bot Token

# 应用配置
NODE_ENV=production
PORT=3000
```

⚠️ **重要**: 生产环境必须使用环境变量，不要在代码中硬编码凭证！

### 3. 运行开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
pnpm build
pnpm start
```

## Telegram Bot 配置

### 1. 创建Bot
1. 在Telegram中找到 @BotFather
2. 发送 `/newbot` 创建新Bot
3. 获取Bot Token

### 2. 配置Web App
```
/setmenubutton
选择你的bot
发送以下JSON:
{
  "text": "打开应用",
  "web_app": {
    "url": "https://your-domain.vercel.app"
  }
}
```

### 3. Bot命令
```
/start - 启动应用
/help - 获取帮助
/products - 查看商品
/my - 个人中心
```

## 管理后台使用

### 访问管理后台

**URL**: `https://your-domain.vercel.app/admin`

**演示账号**:
- 用户名: `admin`
- 密码: `admin123`

### 功能说明

#### 1. Dashboard（仪表板）
- 查看总用户数、商品数、抽奖数
- 查看订单总数和总收入
- 快速访问各管理模块

#### 2. 商品管理 (`/admin/products`)
- 查看所有商品列表
- 查看商品价格、库存、状态

#### 3. 用户管理 (`/admin/users`)
- 查看所有注册用户
- 查看用户余额
- 用户注册时间

#### 4. 抽奖管理 (`/admin/lottery-rounds`)
- 查看所有抽奖轮次
- 查看抽奖进度（已售/总份数）
- 手动触发开奖（ready_to_draw状态）
- 查看中奖者信息

#### 5. 晒单审核 (`/admin/posts`)
- 查看待审核晒单
- 批准或拒绝晒单
- 管理社区内容

#### 6. 手动开奖
两种方式：
- Dashboard中点击"Manual Draw"卡片
- 抽奖管理页面点击特定轮次的"Draw Now"按钮

### 生产环境注意
⚠️ **重要**: 生产环境必须修改管理员密码并使用proper认证系统

## 部署

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 部署完成后获取URL
4. 在Telegram Bot中配置Web App URL

### 环境要求
- Node.js 18+
- pnpm 8+

## 数据库管理

### 初始数据
系统已包含3个测试商品：
- iPhone 15 Pro Max
- AirPods Pro 2
- MacBook Air M3

### 添加商品
使用Supabase Dashboard直接在`products`表中添加：
```sql
INSERT INTO products (name, description, price, stock, category, image_url, status) 
VALUES (
  '{"zh": "商品名", "en": "Product Name", "tg": "...", "ru": "..."}',
  '{"zh": "描述", "en": "Description", "tg": "...", "ru": "..."}',
  999.99,
  10,
  'electronics',
  'https://example.com/image.jpg',
  'active'
);
```

### 创建夺宝轮次
```sql
INSERT INTO lottery_rounds (product_id, total_shares, price_per_share, status)
VALUES (
  'product-uuid',
  100,
  10.00,
  'active'
);
```

## 多语言支持

翻译文件位于 `locales/` 目录：
- `zh.json` - 中文
- `en.json` - 英文
- `ru.json` - 俄语
- `tg.json` - 塔吉克语

## 安全特性

- ✅ Row Level Security (RLS) 策略
- ✅ Telegram身份验证
- ✅ 服务端API保护
- ✅ 防刷机制（余额检查、库存验证）

## API端点

### Edge Functions
- `POST /functions/v1/telegram-auth` - 用户认证
- `POST /functions/v1/participate-lottery` - 参与夺宝
- `GET /functions/v1/get-products` - 获取商品列表
- `GET /functions/v1/user-profile?user_id=xxx` - 获取用户信息

## 项目结构

```
telegram-lottery-miniapp/
├── app/
│   ├── page.tsx              # 主页
│   ├── profile/              # 个人中心
│   ├── orders/               # 订单页
│   ├── referral/             # 推荐页
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── ProductCard.tsx       # 商品卡片
│   ├── LotteryModal.tsx      # 夺宝弹窗
│   ├── UserBalance.tsx       # 用户余额
│   └── Navigation.tsx        # 底部导航
├── lib/
│   ├── supabase.ts           # Supabase客户端
│   └── telegram.ts           # Telegram SDK
├── types/
│   └── database.ts           # 数据库类型
├── locales/                  # 多语言翻译
└── supabase/
    └── functions/            # Edge Functions
```

## 开发说明

### 添加新功能
1. 数据库：在Supabase中创建表和函数
2. Edge Function：在 `supabase/functions/` 中创建
3. 前端：在 `app/` 或 `components/` 中实现
4. 类型：在 `types/database.ts` 中定义

### 调试
- 查看Supabase日志：Supabase Dashboard > Logs
- Edge Function日志：Edge Functions > Logs
- 前端错误：浏览器Console

## 常见问题

### 1. Telegram WebApp无法加载
- 确保域名使用HTTPS
- 检查Bot配置是否正确
- 验证Web App URL

### 2. 参与夺宝失败
- 检查用户余额是否充足
- 验证夺宝轮次状态
- 查看Edge Function日志

### 3. 图片无法显示
- 验证图片URL可访问
- 检查Next.js配置中的域名白名单

## 许可证

MIT License

## 联系方式

技术支持：通过GitHub Issues反馈问题
