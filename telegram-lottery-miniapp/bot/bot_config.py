# 增强版 Telegram Bot 配置

import os
import asyncio
from enhanced_bot import TelegramBot

# 环境变量配置
class BotConfig:
    # Bot Token
    BOT_TOKEN = os.getenv('BOT_TOKEN', 'your_bot_token_here')
    
    # Supabase 配置
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'your_supabase_url')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'your_service_role_key')
    
    # Web App URL
    WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://your-domain.vercel.app')
    
    # 支持的语言
    SUPPORTED_LANGUAGES = ['zh', 'en', 'ru', 'tg']
    
    # 默认设置
    DEFAULT_LANGUAGE = 'en'
    DEFAULT_BALANCE = 0.0
    REFERRAL_BONUS_PERCENT = 5.0
    RESALE_FEE_PERCENT = 2.0
    
    # 通知设置
    LOW_BALANCE_THRESHOLD = 5.0  # $5
    LOTTERY_CHECK_INTERVAL = 3600  # 1小时
    BALANCE_CHECK_INTERVAL = 21600  # 6小时
    
    @classmethod
    def validate_config(cls):
        """验证配置"""
        required_vars = ['BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# 部署配置
DEPLOYMENT_CONFIG = {
    'production': {
        'web_app_url': 'https://your-production-domain.vercel.app',
        'log_level': 'INFO',
        'features': ['notifications', 'auto_responses', 'multilang']
    },
    'development': {
        'web_app_url': 'http://localhost:3000',
        'log_level': 'DEBUG',
        'features': ['notifications', 'auto_responses', 'multilang', 'debug_mode']
    }
}

# 命令配置
BOT_COMMANDS = [
    ('start', 'Start the bot and register'),
    ('help', 'Get help and commands list'),
    ('products', 'View available products'),
    ('profile', 'Open profile center'),
    ('balance', 'Check your balance'),
    ('orders', 'View your orders'),
    ('referral', 'Invite friends and earn rewards'),
    ('resales', 'Access resale market'),
    ('balance_top', 'Quick top up'),
    ('my_tickets', 'View my lottery tickets')
]

# 按钮配置
BOT_KEYBOARDS = {
    'main_menu': [
        ['🎰 Open App', 'products'],
        ['👤 Profile', 'profile'],
        ['💰 Balance', 'balance'],
        ['📦 Orders', 'orders'],
        ['🛒 Resales', 'resales']
    ],
    'quick_actions': [
        ['💳 Top Up', 'topup'],
        ['🎫 Buy Tickets', 'products'],
        ['👥 Invite Friends', 'referral']
    ]
}

# 数据库表结构要求
REQUIRED_TABLES = [
    'users',
    'products',
    'lottery_rounds',
    'participations',
    'orders',
    'transactions',
    'referrals',
    'system_settings',
    'posts',
    'post_likes',
    'post_comments',
    'admins',
    'resales',
    'resale_transactions'
]

# 必需的 Edge Functions
REQUIRED_FUNCTIONS = [
    'telegram-auth',
    'participate-lottery',
    'get-products',
    'user-profile',
    'create-order',
    'posts-manage',
    'auto-draw-lottery',
    'admin-api',
    'resale-api'
]

# 定时任务配置
SCHEDULED_TASKS = {
    'lottery_check': {
        'function': 'auto-draw-lottery',
        'schedule': '0 */6 * * *',  # 每6小时
        'description': 'Check and draw completed lotteries'
    },
    'winner_notification': {
        'function': 'notify_winners',
        'schedule': '*/15 * * * *',  # 每15分钟
        'description': 'Send win notifications'
    },
    'balance_check': {
        'function': 'check_low_balances',
        'schedule': '0 */6 * * *',  # 每6小时
        'description': 'Notify low balance users'
    }
}

# Webhook 配置
WEBHOOK_CONFIG = {
    'url': f'{os.getenv("WEBHOOK_URL", "https://your-bot-domain.com")}/webhook',
    'drop_pending_updates': True,
    'allowed_updates': ['message', 'callback_query', 'inline_query', 'pre_checkout_query', 'shipping_query', 'poll', 'poll_answer']
}

# 安全配置
SECURITY_CONFIG = {
    'max_message_length': 4096,
    'rate_limit': {
        'messages_per_minute': 20,
        'callback_queries_per_minute': 10
    },
    'allowed_user_commands': BOT_COMMANDS,
    'blocked_users': [],  # Telegram user IDs to block
    'admin_users': []     # Telegram user IDs with admin privileges
}

# 日志配置
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'bot.log',
            'maxBytes': 10240000,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file'],
    },
    'loggers': {
        'telegram': {
            'level': 'INFO',
            'handlers': ['console', 'file'],
            'propagate': False,
        },
    },
}

# 性能配置
PERFORMANCE_CONFIG = {
    'max_concurrent_updates': 10,
    'request_timeout': 30,
    'retry_attempts': 3,
    'retry_delay': 1,  # seconds
    'session_timeout': 300,  # 5 minutes
    'memory_limit': '512MB'
}

# 监控配置
MONITORING_CONFIG = {
    'health_check_endpoint': '/health',
    'metrics_endpoint': '/metrics',
    'ping_interval': 30,  # seconds
    'error_threshold': 5,  # errors per minute
    'response_time_threshold': 5000  # milliseconds
}

# 缓存配置
CACHE_CONFIG = {
    'redis_url': os.getenv('REDIS_URL'),
    'default_ttl': 3600,  # 1 hour
    'user_data_ttl': 1800,  # 30 minutes
    'product_cache_ttl': 900,  # 15 minutes
    'balance_cache_ttl': 60   # 1 minute
}