import os
import logging
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
import supabase

# 配置
BOT_TOKEN = os.getenv('BOT_TOKEN')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://telegram-miniapp-demo.vercel.app')

# 日志配置
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 消息模板
MESSAGES = {
    'zh': {
        'welcome': '欢迎来到夺宝平台！🎉\n\n点击下方按钮开始您的夺宝之旅！',
        'help': '''📱 夺宝平台帮助

📋 如何参与：
1️⃣ 选择心仪商品
2️⃣ 购买夺宝份数
3️⃣ 等待开奖
4️⃣ 查看中奖结果

🔧 命令列表：
/start - 启动应用
/products - 查看商品
/profile - 个人中心
/balance - 查看余额
/orders - 我的订单
/referral - 邀请好友
/resales - 转售市场
/help - 获取帮助

💰 需要帮助？联系客服：@your_support''',
        'balance_low': '⚠️ 您的余额不足，请及时充值！',
        'won': '🎉 恭喜您中奖了！\n\n奖品：{product_name}\n价值：{product_price}\n\n请在个人中心查看详细奖品信息。',
        'resale_success': '✅ 您的份额已成功转售！\n\n转售份数：{shares} 份\n收入：{amount}',
        'topup_success': '💰 充值成功！\n\n充值金额：{amount}\n当前余额：{balance}',
        'participation_success': '🎯 参与成功！\n\n商品：{product_name}\n购买份数：{shares} 份\n花费：{amount}',
        'register_success': '✅ 注册成功！\n\n欢迎 {username} 加入夺宝平台！\n您可以开始购买夺宝份额了！'
    },
    'en': {
        'welcome': 'Welcome to the lottery platform! 🎉\n\nClick the button below to start your winning journey!',
        'help': '''📱 Lottery Platform Help

📋 How to participate:
1️⃣ Select desired products
2️⃣ Buy lottery shares
3️⃣ Wait for drawing
4️⃣ Check winning results

🔧 Commands:
/start - Start app
/products - View products
/profile - Profile center
/balance - Check balance
/orders - My orders
/referral - Invite friends
/resales - Resale market
/help - Get help

💰 Need help? Contact support: @your_support''',
        'balance_low': '⚠️ Your balance is low, please top up!',
        'won': '🎉 Congratulations! You won!\n\nPrize: {product_name}\nValue: {product_price}\n\nCheck your profile for details.',
        'resale_success': '✅ Your shares sold successfully!\n\nShares sold: {shares}\nEarnings: {amount}',
        'topup_success': '💰 Top up successful!\n\nAmount: {amount}\nCurrent balance: {balance}',
        'participation_success': '🎯 Participation successful!\n\nProduct: {product_name}\nShares: {shares}\nCost: {amount}',
        'register_success': '✅ Registration successful!\n\nWelcome {username} to the lottery platform!\nYou can start buying lottery shares!'
    }
}

class TelegramBot:
    def __init__(self):
        self.app = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
        
        # Supabase 客户端
        self.supabase = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # 后台任务管理
        self.background_tasks: set[asyncio.Task] = set()
    
    def setup_handlers(self):
        """设置消息处理器"""
        # 命令处理器
        self.app.add_handler(CommandHandler("start", self.start_command))
        self.app.add_handler(CommandHandler("help", self.help_command))
        self.app.add_handler(CommandHandler("products", self.products_command))
        self.app.add_handler(CommandHandler("profile", self.profile_command))
        self.app.add_handler(CommandHandler("balance", self.balance_command))
        self.app.add_handler(CommandHandler("orders", self.orders_command))
        self.app.add_handler(CommandHandler("referral", self.referral_command))
        self.app.add_handler(CommandHandler("resales", self.resales_command))
        
        # 回调处理器
        self.app.add_handler(CallbackQueryHandler(self.button_callback))
        
        # 消息处理器
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.text_message))
    
    def get_user_language(self, user_id: int) -> str:
        """获取用户语言设置"""
        try:
            result = self.supabase.table('users').select('language').eq('telegram_id', user_id).execute()
            if result.data and len(result.data) > 0:
                return result.data[0].get('language', 'en')
        except Exception as e:
            logger.error(f"Error getting user language: {e}")
        return 'en'
    
    def get_message(self, user_id: int, key: str, **kwargs) -> str:
        """获取本地化消息"""
        lang = self.get_user_language(user_id)
        message_template = MESSAGES.get(lang, MESSAGES['en']).get(key, key)
        
        try:
            return message_template.format(**kwargs)
        except:
            return message_template
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /start 命令"""
        user = update.effective_user
        user_lang = user.language_code or 'en'
        
        # 检查用户是否已注册
        is_registered = await self.check_user_registered(user.id)
        
        if not is_registered:
            # 新用户注册
            await self.register_user(user, user_lang)
            message = self.get_message(user.id, 'register_success', username=user.first_name or 'User')
        else:
            message = self.get_message(user.id, 'welcome')
        
        keyboard = [
            [InlineKeyboardButton("🎰 Open App", web_app=WebAppInfo(url=WEB_APP_URL))],
            [InlineKeyboardButton("📱 Products", web_app=WebAppInfo(url=f"{WEB_APP_URL}/"))],
            [InlineKeyboardButton("👤 Profile", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))],
            [InlineKeyboardButton("💰 Balance", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))],
            [InlineKeyboardButton("📦 Orders", web_app=WebAppInfo(url=f"{WEB_APP_URL}/orders"))],
            [InlineKeyboardButton("🛒 Resales", web_app=WebAppInfo(url=f"{WEB_APP_URL}/resale-market"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(message, reply_markup=reply_markup)
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /help 命令"""
        user = update.effective_user
        message = self.get_message(user.id, 'help')
        await update.message.reply_text(message, parse_mode='Markdown')
    
    async def products_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /products 命令"""
        keyboard = [
            [InlineKeyboardButton("🛍️ View Products", web_app=WebAppInfo(url=f"{WEB_APP_URL}/"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Browse all available products!", reply_markup=reply_markup)
    
    async def profile_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /profile 命令"""
        keyboard = [
            [InlineKeyboardButton("👤 Profile Center", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Check your profile and statistics", reply_markup=reply_markup)
    
    async def balance_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /balance 命令"""
        # 获取用户余额
        balance = await self.get_user_balance(update.effective_user.id)
        
        keyboard = [
            [InlineKeyboardButton("💰 View Balance", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))],
            [InlineKeyboardButton("💳 Top Up", web_app=WebAppInfo(url=f"{WEB_APP_URL}/profile"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        message = f"💰 Your current balance: ${balance:.2f}\n\nClick below to top up or view details"
        await update.message.reply_text(message, reply_markup=reply_markup)
    
    async def orders_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /orders 命令"""
        keyboard = [
            [InlineKeyboardButton("📦 My Orders", web_app=WebAppInfo(url=f"{WEB_APP_URL}/orders"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("View your participation records", reply_markup=reply_markup)
    
    async def referral_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /referral 命令"""
        keyboard = [
            [InlineKeyboardButton("👥 Invite Friends", web_app=WebAppInfo(url=f"{WEB_APP_URL}/referral"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Invite friends and earn 5% referral bonus!", reply_markup=reply_markup)
    
    async def resales_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理 /resales 命令"""
        keyboard = [
            [InlineKeyboardButton("🛒 Resale Market", web_app=WebAppInfo(url=f"{WEB_APP_URL}/resale-market"))],
            [InlineKeyboardButton("📋 My Resales", web_app=WebAppInfo(url=f"{WEB_APP_URL}/my-resales"))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Buy and sell lottery shares!", reply_markup=reply_markup)
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理按钮回调"""
        query = update.callback_query
        await query.answer()
        
        # 处理各种按钮回调
        if query.data == 'view_products':
            await query.edit_message_text(
                "Browse products here!",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🛍️ Products", web_app=WebAppInfo(url=f"{WEB_APP_URL}/"))]
                ])
            )
        elif query.data == 'view_balance':
            balance = await self.get_user_balance(query.from_user.id)
            await query.edit_message_text(f"Your balance: ${balance:.2f}")
    
    async def text_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理文本消息"""
        text = update.message.text.lower()
        
        # 简单的文本命令处理
        if any(keyword in text for keyword in ['help', '帮助', 'help me']):
            await self.help_command(update, context)
        elif any(keyword in text for keyword in ['balance', '余额', 'money']):
            await self.balance_command(update, context)
        elif any(keyword in text for keyword in ['products', '商品', 'shop']):
            await self.products_command(update, context)
        else:
            # 默认回复
            await update.message.reply_text(
                "I don't understand that command. Use /help for available commands."
            )
    
    async def check_user_registered(self, telegram_id: int) -> bool:
        """检查用户是否已注册"""
        try:
            result = self.supabase.table('users').select('id').eq('telegram_id', telegram_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking user registration: {e}")
            return False
    
    async def register_user(self, user, language: str):
        """注册新用户"""
        try:
            full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
            username = user.username or f"user_{user.id}"
            
            result = self.supabase.table('users').insert({
                'telegram_id': user.id,
                'username': username,
                'full_name': full_name,
                'language': language,
                'balance': 0.0,
                'created_at': datetime.now().isoformat()
            }).execute()
            
            logger.info(f"User registered: {user.id}")
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error registering user: {e}")
            return None
    
    async def get_user_balance(self, telegram_id: int) -> float:
        """获取用户余额"""
        try:
            result = self.supabase.table('users').select('balance').eq('telegram_id', telegram_id).execute()
            if result.data and len(result.data) > 0:
                return float(result.data[0]['balance'] or 0)
        except Exception as e:
            logger.error(f"Error getting user balance: {e}")
        return 0.0
    
    async def send_notification(self, telegram_id: int, message_key: str, **kwargs):
        """发送通知消息"""
        try:
            message = self.get_message(telegram_id, message_key, **kwargs)
            await self.app.bot.send_message(chat_id=telegram_id, text=message)
            logger.info(f"Notification sent to {telegram_id}: {message_key}")
        except Exception as e:
            logger.error(f"Error sending notification to {telegram_id}: {e}")
    
    async def notify_lottery_winners(self):
        """通知彩票中奖者"""
        try:
            # 获取最近开奖的中奖者
            result = self.supabase.table('lottery_rounds').select('''
                id,
                winner_id,
                product:products(name, price)
            ''').eq('status', 'completed').gte('updated_at', (datetime.now() - timedelta(hours=1)).isoformat()).execute()
            
            for round_data in result.data:
                if round_data.get('winner_id') and round_data.get('product'):
                    # 获取中奖者的 Telegram ID
                    user_result = self.supabase.table('users').select('telegram_id').eq('id', round_data['winner_id']).execute()
                    
                    if user_result.data:
                        telegram_id = user_result.data[0]['telegram_id']
                        await self.send_notification(
                            telegram_id,
                            'won',
                            product_name=round_data['product']['name'],
                            product_price=round_data['product']['price']
                        )
                        
        except Exception as e:
            logger.error(f"Error notifying lottery winners: {e}")
    
    async def notify_low_balance_users(self):
        """通知余额不足的用户"""
        try:
            # 获取余额低于 $5 的用户
            result = self.supabase.table('users').select('telegram_id').lt('balance', 5).execute()
            
            for user_data in result.data:
                telegram_id = user_data['telegram_id']
                await self.send_notification(telegram_id, 'balance_low')
                
        except Exception as e:
            logger.error(f"Error notifying low balance users: {e}")
    
    def start_background_tasks(self):
        """启动后台任务"""
        # 检查是否在事件循环中
        try:
            loop = asyncio.get_running_loop()
            # 如果在事件循环中，使用create_task
            task1 = loop.create_task(self.lottery_check_loop())
            task2 = loop.create_task(self.balance_check_loop())
            self.background_tasks.add(task1)
            self.background_tasks.add(task2)
            
            # 为任务添加完成回调，自动从集合中移除
            def task_done_callback(task):
                self.background_tasks.discard(task)
            
            task1.add_done_callback(task_done_callback)
            task2.add_done_callback(task_done_callback)
            
            logger.info("Background tasks started successfully")
        except RuntimeError:
            # 如果不在事件循环中，在run方法中处理
            logger.info("No running event loop, will start background tasks in run method")
    
    async def lottery_check_loop(self):
        """彩票中奖检查循环"""
        while True:
            try:
                await self.notify_lottery_winners()
                await asyncio.sleep(3600)  # 每小时检查一次
            except Exception as e:
                logger.error(f"Error in lottery check loop: {e}")
                await asyncio.sleep(3600)  # 出错时等待后重试
    
    async def balance_check_loop(self):
        """余额检查循环"""
        while True:
            try:
                await self.notify_low_balance_users()
                await asyncio.sleep(21600)  # 每6小时检查一次
            except Exception as e:
                logger.error(f"Error in balance check loop: {e}")
                await asyncio.sleep(21600)  # 出错时等待后重试
    
    def run(self):
        """启动Bot"""
        try:
            logger.info("Starting Telegram Bot...")
            
            # 启动后台任务
            if not self.background_tasks:
                # 如果在初始化时没有启动任务，在这里启动
                task1 = asyncio.create_task(self.lottery_check_loop())
                task2 = asyncio.create_task(self.balance_check_loop())
                self.background_tasks.add(task1)
                self.background_tasks.add(task2)
                
                # 添加清理回调
                def cleanup_tasks(task):
                    self.background_tasks.discard(task)
                
                task1.add_done_callback(cleanup_tasks)
                task2.add_done_callback(cleanup_tasks)
                
                logger.info("Background tasks started in run method")
            
            # 启动轮询
            self.app.run_polling(
                drop_pending_updates=True,
                allowed_updates=Update.ALL_TYPES
            )
            
        except Exception as e:
            logger.error(f"Error running bot: {e}")
            # 清理后台任务
            for task in self.background_tasks:
                if not task.done():
                    task.cancel()
            raise
        finally:
            # 确保清理所有后台任务
            self._cleanup_background_tasks()
    
    def _cleanup_background_tasks(self):
        """清理后台任务"""
        for task in self.background_tasks.copy():
            if not task.done():
                task.cancel()
                # 等待任务结束
                try:
                    asyncio.create_task(task)
                except Exception as e:
                    logger.warning(f"Error canceling task: {e}")
        self.background_tasks.clear()
        logger.info("Background tasks cleaned up")

def main():
    """主函数"""
    if not BOT_TOKEN:
        raise ValueError("BOT_TOKEN environment variable is required")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
    
    bot = TelegramBot()
    bot.run()

if __name__ == '__main__':
    main()