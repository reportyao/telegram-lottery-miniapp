# 快速启动指南

## 3分钟快速上手

### 第1步：运行前端应用（1分钟）

```bash
# 进入项目目录
cd /workspace/telegram-lottery-miniapp

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问: http://localhost:3000

### 第2步：测试核心功能（1分钟）

在浏览器中打开应用，你会看到：
- ✅ 3个测试商品（iPhone、AirPods、MacBook）
- ✅ 每个商品都有活跃的夺宝轮次
- ✅ 完整的用户界面

**注意**: 由于需要Telegram环境，本地测试时某些功能可能受限。

### 第3步：部署到Vercel（1分钟）

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd /workspace/telegram-lottery-miniapp
vercel --prod
```

完成！获取部署URL并配置Telegram Bot。

---

## 完整部署流程

### A. 准备工作

#### 已完成✅
- [x] Supabase数据库（8个表）
- [x] Edge Functions（4个已部署）
- [x] Storage Buckets（2个）
- [x] 测试数据
- [x] 前端代码

#### 需要配置
- [ ] Vercel部署
- [ ] Telegram Bot创建
- [ ] Bot服务器运行

---

### B. Telegram Bot配置

#### 1. 创建Bot（2分钟）

与@BotFather对话：
```
/newbot
输入名称: Tajikistan Lottery
输入用户名: tajik_lottery_bot
保存Token: 123456:ABC-DEF...
```

#### 2. 配置菜单按钮（1分钟）

```
/setmenubutton
选择你的bot
输入: 打开应用 - https://your-domain.vercel.app
```

#### 3. 设置命令（1分钟）

```
/setcommands
输入:
start - 启动应用
products - 查看商品
profile - 个人中心
orders - 我的订单
referral - 邀请好友
```

---

### C. Bot服务器（可选）

如果需要Bot处理命令：

#### Python简易版

创建 `bot.py`:
```python
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "YOUR_BOT_TOKEN"
WEB_APP_URL = "https://your-domain.vercel.app"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("打开应用", web_app=WebAppInfo(url=WEB_APP_URL))]]
    await update.message.reply_text(
        "欢迎来到夺宝平台！点击下方按钮开始：",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

def main():
    Application.builder().token(BOT_TOKEN).build().add_handler(
        CommandHandler("start", start)
    ).run_polling()

if __name__ == '__main__':
    main()
```

运行:
```bash
pip install python-telegram-bot
python bot.py
```

---

## 验证测试

### 1. 本地测试

```bash
# 测试前端
cd telegram-lottery-miniapp
pnpm dev

# 访问页面
http://localhost:3000

# 检查
- [ ] 页面正常加载
- [ ] 商品显示正常
- [ ] 点击商品弹出夺宝窗口
- [ ] 导航栏正常工作
```

### 2. API测试

```bash
# 测试获取商品
curl https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products

# 应该返回3个商品
```

### 3. 生产测试

部署到Vercel后：
1. 在Telegram中打开Bot
2. 点击"打开应用"按钮
3. 验证所有功能：
   - [ ] 用户自动登录
   - [ ] 商品列表显示
   - [ ] 可以参与夺宝
   - [ ] 个人中心正常
   - [ ] 推荐链接可用

---

## 常见问题

### Q1: pnpm install失败？
```bash
# 使用npm代替
npm install
```

### Q2: 本地无法测试Telegram功能？
- 正常，需要部署到线上才能完整测试
- 本地可以测试UI和基础功能

### Q3: Vercel部署失败？
```bash
# 检查依赖
pnpm build

# 如果成功，再部署
vercel --prod
```

### Q4: Bot无法打开WebApp？
- 确认域名是HTTPS
- 检查Bot菜单按钮配置
- 验证Vercel部署成功

### Q5: 用户余额为0？
- 这是正常的
- 需要实现充值功能或手动添加测试余额：

```sql
-- 在Supabase SQL Editor中运行
UPDATE users 
SET balance = 1000 
WHERE telegram_id = YOUR_TELEGRAM_ID;
```

---

## 核心文件说明

### 前端
- `app/page.tsx` - 主页（商品列表）
- `app/profile/page.tsx` - 个人中心
- `app/orders/page.tsx` - 订单页
- `app/referral/page.tsx` - 推荐页
- `lib/supabase.ts` - Supabase客户端（凭证已配置）
- `lib/telegram.ts` - Telegram SDK集成

### 后端
- Supabase Dashboard: https://supabase.com/dashboard/project/mftfgofnosakobjfpzss
- Edge Functions已部署并可用

### 文档
- `README.md` - 项目概述
- `docs/API.md` - API文档
- `docs/DEPLOYMENT.md` - 详细部署指南
- `docs/TELEGRAM_BOT_SETUP.md` - Bot配置教程
- `PROJECT_SUMMARY.md` - 项目总结

---

## 数据库管理

### 查看数据

访问Supabase Dashboard:
https://supabase.com/dashboard/project/mftfgofnosakobjfpzss

导航到 Table Editor 查看：
- `users` - 用户列表
- `products` - 商品列表
- `lottery_rounds` - 夺宝轮次
- `participations` - 参与记录

### 添加测试用户余额

```sql
-- 方法1: 直接更新余额
UPDATE users 
SET balance = 1000 
WHERE telegram_id = YOUR_TELEGRAM_ID;

-- 方法2: 使用函数（推荐）
SELECT update_user_balance(
  'user-uuid'::uuid,
  1000.00,
  'deposit',
  'Test balance'
);
```

### 手动开奖

```sql
-- 为指定轮次开奖
SELECT draw_lottery('lottery-round-uuid'::uuid);
```

---

## 监控和日志

### Supabase日志
Dashboard > Logs > 选择服务:
- API Logs - REST API调用
- Edge Function Logs - 函数执行日志
- Database Logs - 数据库查询

### Vercel日志
```bash
vercel logs [deployment-url]
```

### Bot日志
查看Bot服务器控制台输出

---

## 下一步建议

### 1. 实现支付功能
- 集成塔吉克斯坦本地支付
- 添加充值接口
- 实现订单支付流程

### 2. 完善管理后台
- 管理员登录
- 商品管理
- 用户管理
- 数据统计

### 3. 增强用户体验
- 实时推送通知
- 自动开奖机制
- 中奖动画效果
- 分享功能

### 4. 性能优化
- 图片CDN加速
- API响应缓存
- 数据库查询优化

---

## 获取帮助

1. **文档**: 查看 `docs/` 目录下的详细文档
2. **API参考**: `docs/API.md`
3. **部署问题**: `docs/DEPLOYMENT.md`
4. **Bot配置**: `docs/TELEGRAM_BOT_SETUP.md`

---

## 成功标志

系统正常运行的标志：
- ✅ 在Telegram中点击Bot可以打开WebApp
- ✅ 用户可以浏览商品
- ✅ 可以查看个人中心
- ✅ 推荐链接可以复制
- ✅ 多语言正常切换

恭喜！系统已准备就绪。🎉
