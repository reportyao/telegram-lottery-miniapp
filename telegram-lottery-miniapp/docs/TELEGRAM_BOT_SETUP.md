# Telegram Bot 配置指南

## 1. 创建Bot

### 步骤1: 与BotFather对话
1. 在Telegram中搜索 `@BotFather`
2. 发送 `/newbot`
3. 输入Bot名称（例如：Tajikistan Lottery Bot）
4. 输入Bot用户名（例如：tajik_lottery_bot）
5. 保存Bot Token（格式：`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）

### 步骤2: 配置Bot基本信息
```
/setdescription
选择你的bot
输入描述：
在线夺宝抽奖平台，参与抽奖赢取大奖！
```

```
/setabouttext
选择你的bot
输入简介：
Welcome to Tajikistan Lottery Platform
```

## 2. 配置Web App

### 方法1: 使用菜单按钮（推荐）
```
/setmenubutton
选择你的bot
发送以下文本：
打开应用 - https://your-domain.vercel.app
```

### 方法2: 使用内联键盘
Bot需要返回带有web_app按钮的消息。

## 3. Bot命令设置

```
/setcommands
选择你的bot
输入以下命令列表：

start - 启动应用
help - 获取帮助
products - 查看商品
profile - 个人中心
balance - 查看余额
orders - 我的订单
referral - 邀请好友
```

## 4. Python Bot脚本示例

### 安装依赖
```bash
pip install python-telegram-bot requests
```

### bot.py
```python
import os
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# 配置
BOT_TOKEN = "YOUR_BOT_TOKEN"
WEB_APP_URL = "https://your-domain.vercel.app"

# 日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /start 命令"""
    keyboard = [
        [InlineKeyboardButton("打开应用 🎰", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "欢迎来到夺宝平台！🎉\\n\\n"
        "点击下方按钮打开应用，开始您的夺宝之旅！\\n\\n"
        "每天都有新的商品等你来夺取！",
        reply_markup=reply_markup
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /help 命令"""
    help_text = """
📱 *夺宝平台帮助*

*如何参与：*
1️⃣ 选择心仪商品
2️⃣ 购买夺宝份数
3️⃣ 等待开奖
4️⃣ 查看中奖结果

*命令列表：*
/start - 启动应用
/products - 查看商品
/profile - 个人中心
/balance - 查看余额
/orders - 我的订单
/referral - 邀请好友
/help - 获取帮助

*需要帮助？*
联系客服：@your_support
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /products 命令"""
    keyboard = [
        [InlineKeyboardButton("查看商品 🛍", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "点击下方按钮查看所有可参与的夺宝商品！",
        reply_markup=reply_markup
    )

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /profile 命令"""
    keyboard = [
        [InlineKeyboardButton("个人中心 👤", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "查看您的个人信息和统计数据",
        reply_markup=reply_markup
    )

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /balance 命令"""
    keyboard = [
        [InlineKeyboardButton("查看余额 💰", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "点击查看您的当前余额和充值",
        reply_markup=reply_markup
    )

async def orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /orders 命令"""
    keyboard = [
        [InlineKeyboardButton("我的订单 📦", web_app=WebAppInfo(url=f"{WEB_APP_URL}/orders"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "查看您的所有参与记录",
        reply_markup=reply_markup
    )

async def referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """处理 /referral 命令"""
    keyboard = [
        [InlineKeyboardButton("邀请好友 👥", web_app=WebAppInfo(url=f"{WEB_APP_URL}/referral"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "邀请好友注册，获得5%返利！",
        reply_markup=reply_markup
    )

def main():
    """启动Bot"""
    # 创建Application
    application = Application.builder().token(BOT_TOKEN).build()

    # 注册命令处理器
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("products", products))
    application.add_handler(CommandHandler("profile", profile))
    application.add_handler(CommandHandler("balance", balance))
    application.add_handler(CommandHandler("orders", orders))
    application.add_handler(CommandHandler("referral", referral))

    # 启动Bot
    print("Bot started...")
    application.run_polling()

if __name__ == '__main__':
    main()
```

### 运行Bot
```bash
python bot.py
```

## 5. 部署Bot

### 使用systemd（Linux服务器）
创建 `/etc/systemd/system/telegram-bot.service`：
```ini
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 /path/to/bot/bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

### 使用Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY bot.py .

CMD ["python", "bot.py"]
```

## 6. 安全建议

1. **保护Bot Token**
   - 不要将Token提交到Git
   - 使用环境变量存储

2. **验证用户**
   - 在WebApp中验证initData
   - 使用Telegram的哈希验证

3. **限流**
   - 实现命令调用频率限制
   - 防止滥用

## 7. 多语言支持

Bot可以根据用户语言自动切换：
```python
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_lang = update.effective_user.language_code
    
    messages = {
        'zh': '欢迎来到夺宝平台！',
        'en': 'Welcome to Lottery Platform!',
        'ru': 'Добро пожаловать на платформу лотереи!',
        'tg': 'Хуш омадед ба платформаи қурғакашӣ!'
    }
    
    message = messages.get(user_lang, messages['en'])
    # ... 发送消息
```

## 8. 监控和日志

建议实现：
- 错误日志记录
- 用户活动统计
- 性能监控
- 告警机制

## 需要帮助？

- Telegram Bot API文档: https://core.telegram.org/bots/api
- python-telegram-bot文档: https://docs.python-telegram-bot.org/
