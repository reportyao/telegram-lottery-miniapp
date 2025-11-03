# Telegram Bot设置指南

## 概述

本指南将详细介绍如何创建和配置Telegram机器人，为夺宝MiniApp提供完整的Bot功能支持。

## 创建Telegram Bot

### 1. 通过BotFather创建Bot

1. **在Telegram中搜索@BotFather**
   - 与BotFather对话
   - 发送 `/newbot` 命令

2. **设置Bot基本信息**
   ```
   BotName: 选择一个Bot名称（如：Lottery MiniApp Bot）
   Username: 设置唯一的用户名（如：lottery_miniapp_bot）
   ```

3. **获取Bot Token**
   - BotFather会返回Bot Token
   - 格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **请妥善保管此Token，不要泄露给他人**

### 2. 配置Bot设置

#### 设置Bot命令列表

在BotFather中发送：
```
/setcommands
```

然后输入以下命令列表：
```
start - 开始使用夺宝平台
help - 获取帮助信息
products - 查看所有商品
profile - 个人中心
balance - 查看余额
orders - 我的订单
referral - 邀请好友获得奖励
resales - 转售市场
balance_top - 快速充值
my_tickets - 我的彩票
settings - 设置
about - 关于我们
```

#### 设置Bot描述

```
/setdescription
```

```
🎯 欢迎来到夺宝平台！

这是一个有趣的抽奖平台，您可以：
🎲 购买彩票参与抽奖
💰 转售中奖产品
👥 邀请好友获得奖励
🏆 查看中奖记录

点击下方按钮开始您的夺宝之旅！
```

#### 设置Bot关于信息

```
/setabouttext
```

```
🎯 Telegram夺宝系统
在线抽奖平台，支持多种产品夺宝
安全可靠，公平公正
立即开始参与抽奖！
```

#### 设置Bot头像

```
/setuserpic
```

上传Bot头像图片（建议尺寸：512x512像素）

### 3. 配置Bot菜单

#### 设置Inline Keyboard菜单

在Bot代码中配置主菜单按钮：

```python
MAIN_KEYBOARD = [
    ["🎰 打开应用", "products"],
    ["👤 个人中心", "profile"],
    ["💰 余额管理", "balance"],
    ["📦 我的订单", "orders"],
    ["🛒 转售市场", "resales"],
    ["👥 邀请好友", "referral"]
]

QUICK_ACTIONS = [
    ["💳 快速充值", "balance_top"],
    ["🎫 购买彩票", "products"],
    ["📊 我的统计", "stats"]
]
```

## 部署Bot

### 1. 环境准备

#### 服务器要求
- **CPU**: 1核心以上
- **内存**: 1GB以上
- **存储**: 10GB以上
- **网络**: 稳定的互联网连接

#### 系统要求
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 7+
- **Python**: 3.8+
- **依赖库**: 见 requirements.txt

### 2. Bot部署步骤

#### 步骤1: 安装Python环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python和pip
sudo apt install -y python3 python3-pip python3-venv

# 安装系统依赖
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev
```

#### 步骤2: 创建Bot目录

```bash
# 创建项目目录
mkdir -p /var/www/telegram-lottery-bot
cd /var/www/telegram-lottery-bot

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 激活虚拟环境
source venv/bin/activate
```

#### 步骤3: 部署Bot代码

```bash
# 复制Bot文件到服务器
scp -r bot/ user@server:/var/www/telegram-lottery-bot/

# 或使用Git克隆
git clone https://github.com/your-repo/telegram-lottery-bot.git .
```

#### 步骤4: 安装依赖

```bash
# 进入虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

#### 步骤5: 配置环境变量

```bash
# 创建环境变量文件
cp .env.example .env

# 编辑环境变量
nano .env
```

```bash
# Bot配置
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=your_bot_username

# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 应用配置
WEB_APP_URL=https://your-miniapp-url.com
DEBUG=False

# 通知设置
LOW_BALANCE_THRESHOLD=5.0
LOTTERY_CHECK_INTERVAL=3600

# 日志设置
LOG_LEVEL=INFO
LOG_FILE=/var/log/telegram-bot/bot.log

# 安全设置
MAX_MESSAGE_LENGTH=4096
RATE_LIMIT_MESSAGES=20
RATE_LIMIT_CALLBACK=10
```

#### 步骤6: 测试Bot

```bash
# 测试Bot启动
python enhanced_bot.py
```

如果看到以下输出，说明Bot启动成功：
```
[INFO] Starting Telegram Bot...
[INFO] Bot initialized successfully
[INFO] Webhook configured
```

#### 步骤7: 创建系统服务

```bash
# 创建服务用户
sudo useradd -r -s /bin/false telegram-bot

# 创建日志目录
sudo mkdir -p /var/log/telegram-bot
sudo chown telegram-bot:telegram-bot /var/log/telegram-bot

# 创建systemd服务文件
sudo nano /etc/systemd/system/telegram-bot.service
```

```ini
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=telegram-bot
Group=telegram-bot
WorkingDirectory=/var/www/telegram-lottery-bot
Environment=PATH=/var/www/telegram-lottery-bot/venv/bin
EnvironmentFile=/var/www/telegram-lottery-bot/.env
ExecStart=/var/www/telegram-lottery-bot/venv/bin/python enhanced_bot.py
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=telegram-bot

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/log/telegram-bot /var/www/telegram-lottery-bot

[Install]
WantedBy=multi-user.target
```

#### 步骤8: 启动服务

```bash
# 重新加载systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable telegram-bot

# 启动服务
sudo systemctl start telegram-bot

# 查看状态
sudo systemctl status telegram-bot

# 查看日志
sudo journalctl -u telegram-bot -f
```

### 3. 高级配置

#### 配置Webhook（推荐生产环境）

```python
# webhook.py
import requests

def setup_webhook(bot_token, webhook_url):
    """设置WebHook"""
    url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    data = {
        "url": webhook_url,
        "drop_pending_updates": True,
        "allowed_updates": [
            "message",
            "callback_query", 
            "inline_query",
            "pre_checkout_query",
            "shipping_query",
            "poll",
            "poll_answer"
        ]
    }
    
    response = requests.post(url, json=data)
    return response.json()

# 使用示例
webhook_url = "https://your-server.com/webhook"
setup_webhook(BOT_TOKEN, webhook_url)
```

#### 配置Webhook服务

```python
# webhook_server.py
from flask import Flask, request, jsonify
import logging
from enhanced_bot import TelegramBot

app = Flask(__name__)
bot = TelegramBot()

@app.route('/webhook', methods=['POST'])
def webhook():
    """处理Webhook请求"""
    try:
        update = request.get_json()
        bot.process_update(update)
        return jsonify({'status': 'ok'})
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return jsonify({'status': 'error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8443, ssl_context='adhoc')
```

#### 性能优化配置

```python
# performance_config.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

class PerformanceConfig:
    # 并发处理
    MAX_CONCURRENT_UPDATES = 10
    
    # 线程池
    EXECUTOR = ThreadPoolExecutor(max_workers=4)
    
    # 缓存配置
    CACHE_TTL = 3600  # 1小时
    USER_CACHE_SIZE = 1000
    PRODUCT_CACHE_SIZE = 100
    
    # 速率限制
    RATE_LIMIT_MESSAGES_PER_MINUTE = 20
    RATE_LIMIT_CALLBACK_PER_MINUTE = 10
    
    # 批处理
    BATCH_SIZE = 50
    BATCH_TIMEOUT = 5  # 秒
```

## Bot功能测试

### 1. 基础功能测试

#### 测试命令响应

```python
# test_bot_commands.py
import pytest
from enhanced_bot import TelegramBot

def test_start_command():
    """测试/start命令"""
    bot = TelegramBot()
    
    # 模拟用户发送/start
    update = {
        'message': {
            'message_id': 1,
            'chat': {'id': 123456, 'type': 'private'},
            'from': {'id': 123456, 'first_name': 'Test'},
            'text': '/start'
        }
    }
    
    # 测试响应
    bot.process_update(update)
    # 验证发送的消息内容

def test_help_command():
    """测试/help命令"""
    bot = TelegramBot()
    
    update = {
        'message': {
            'message_id': 1,
            'chat': {'id': 123456, 'type': 'private'},
            'from': {'id': 123456, 'first_name': 'Test'},
            'text': '/help'
        }
    }
    
    bot.process_update(update)
    # 验证帮助消息发送
```

#### 测试按钮响应

```python
def test_callback_query():
    """测试按钮回调"""
    bot = TelegramBot()
    
    update = {
        'callback_query': {
            'id': '1',
            'from': {'id': 123456, 'first_name': 'Test'},
            'message': {'message_id': 1},
            'data': 'products'
        }
    }
    
    bot.process_update(update)
    # 验证按钮响应逻辑
```

### 2. 集成测试

#### 数据库集成测试

```python
# test_database_integration.py
import pytest
from supabase import create_client
from enhanced_bot import TelegramBot

@pytest.fixture
def bot():
    return TelegramBot()

@pytest.fixture
def supabase():
    url = "https://your-project.supabase.co"
    key = "your-service-role-key"
    return create_client(url, key)

def test_user_registration(bot, supabase):
    """测试用户注册"""
    user_data = {
        'telegram_id': 123456,
        'username': 'testuser',
        'full_name': 'Test User',
        'language': 'en'
    }
    
    result = bot.register_user(user_data)
    assert result is not None
    
    # 验证用户是否正确保存到数据库
    user = supabase.table('users').select('*').eq('telegram_id', 123456).execute()
    assert len(user.data) > 0

def test_user_balance_update(bot, supabase):
    """测试余额更新"""
    initial_balance = 100.0
    update_amount = 50.0
    
    result = bot.update_user_balance(123456, initial_balance + update_amount)
    assert result is True
    
    # 验证余额更新
    user = supabase.table('users').select('balance').eq('telegram_id', 123456).execute()
    assert user.data[0]['balance'] == initial_balance + update_amount
```

### 3. 性能测试

#### 负载测试

```python
# load_test.py
import asyncio
import aiohttp
import time

async def send_messages(session, chat_id, count):
    """发送批量消息"""
    tasks = []
    for i in range(count):
        task = send_message(session, chat_id, f"Test message {i}")
        tasks.append(task)
    
    start_time = time.time()
    await asyncio.gather(*tasks)
    end_time = time.time()
    
    return end_time - start_time

async def send_message(session, chat_id, text):
    """发送单条消息"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text
    }
    
    async with session.post(url, json=data) as response:
        return await response.json()

async def run_load_test():
    """运行负载测试"""
    async with aiohttp.ClientSession() as session:
        chat_id = 123456
        message_count = 100
        
        # 串行发送
        serial_time = await send_messages(session, chat_id, message_count)
        print(f"Serial: {serial_time:.2f}s for {message_count} messages")
        
        # 并行发送
        parallel_time = await send_messages(session, chat_id, message_count)
        print(f"Parallel: {parallel_time:.2f}s for {message_count} messages")

if __name__ == "__main__":
    asyncio.run(run_load_test())
```

## 监控和维护

### 1. 日志配置

#### 结构化日志

```python
# logger_config.py
import logging
import json
from datetime import datetime

class TelegramBotFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'message': record.getMessage(),
            'bot_user': getattr(record, 'bot_user', None),
            'chat_id': getattr(record, 'chat_id', None)
        }
        return json.dumps(log_entry)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[
        logging.FileHandler('/var/log/telegram-bot/bot.log'),
        logging.StreamHandler()
    ]
)

# 应用自定义格式器
formatter = TelegramBotFormatter()
for handler in logging.getLogger().handlers:
    handler.setFormatter(formatter)
```

### 2. 错误监控

#### 错误通知

```python
# error_monitoring.py
import logging
import requests
from datetime import datetime

class ErrorMonitor:
    def __init__(self, webhook_url=None):
        self.webhook_url = webhook_url
    
    def report_error(self, error, context=None):
        """报告错误到监控系统"""
        error_info = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context or {}
        }
        
        # 记录到日志
        logging.error(f"Error reported: {error_info}")
        
        # 发送到监控系统
        if self.webhook_url:
            try:
                requests.post(self.webhook_url, json=error_info)
            except Exception as e:
                logging.error(f"Failed to send error report: {e}")

# 使用示例
error_monitor = ErrorMonitor(webhook_url="https://your-monitoring-system.com/errors")

try:
    # Bot操作
    pass
except Exception as e:
    error_monitor.report_error(e, {'chat_id': 123456, 'action': 'send_message'})
```

### 3. 健康检查

#### Bot健康状态

```python
# health_check.py
import asyncio
import aiohttp
from datetime import datetime

class HealthChecker:
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    async def check_bot_status(self):
        """检查Bot状态"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/getMe"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('ok'):
                            return {
                                'status': 'healthy',
                                'bot_info': data['result'],
                                'timestamp': datetime.utcnow().isoformat()
                            }
            
            return {
                'status': 'unhealthy',
                'error': 'Bot API call failed',
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    async def check_webhook_status(self):
        """检查Webhook状态"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/getWebhookInfo"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            'webhook_info': data.get('result', {}),
                            'timestamp': datetime.utcnow().isoformat()
                        }
        except Exception as e:
            return {
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# 健康检查端点
async def health_check():
    checker = HealthChecker(BOT_TOKEN)
    bot_status = await checker.check_bot_status()
    webhook_status = await checker.check_webhook_status()
    
    return {
        'bot': bot_status,
        'webhook': webhook_status,
        'overall_status': 'healthy' if bot_status['status'] == 'healthy' else 'unhealthy'
    }
```

## 安全最佳实践

### 1. 安全配置

#### 输入验证

```python
# input_validation.py
import re
import html

class InputValidator:
    @staticmethod
    def validate_user_id(user_id):
        """验证用户ID"""
        return isinstance(user_id, int) and user_id > 0
    
    @staticmethod
    def validate_amount(amount):
        """验证金额"""
        return isinstance(amount, (int, float)) and amount >= 0
    
    @staticmethod
    def sanitize_text(text, max_length=1024):
        """清理文本输入"""
        if not isinstance(text, str):
            return ""
        
        # 限制长度
        text = text[:max_length]
        
        # 转义HTML
        text = html.escape(text)
        
        # 移除危险字符
        text = re.sub(r'[<>"\']', '', text)
        
        return text.strip()
    
    @staticmethod
    def validate_callback_data(data):
        """验证回调数据"""
        if not isinstance(data, str):
            return False
        
        # 只允许字母、数字、下划线和连字符
        pattern = r'^[a-zA-Z0-9_-]+$'
        return bool(re.match(pattern, data)) and len(data) <= 64
```

#### 速率限制

```python
# rate_limiting.py
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self):
        self.user_limits = defaultdict(list)
        self.global_limits = []
    
    def is_rate_limited(self, user_id, limit_type='message'):
        """检查是否超出速率限制"""
        now = time.time()
        
        if limit_type == 'message':
            limit_count = 20
            limit_window = 60  # 60秒内最多20条消息
        elif limit_type == 'callback':
            limit_count = 10
            limit_window = 60  # 60秒内最多10个回调
        else:
            limit_count = 100
            limit_window = 60
        
        # 清理过期记录
        self.user_limits[user_id] = [
            timestamp for timestamp in self.user_limits[user_id]
            if now - timestamp < limit_window
        ]
        
        # 检查限制
        if len(self.user_limits[user_id]) >= limit_count:
            return True
        
        # 记录当前请求
        self.user_limits[user_id].append(now)
        return False
    
    def reset_user_limit(self, user_id):
        """重置用户限制"""
        self.user_limits[user_id] = []
```

### 2. 数据保护

#### 敏感信息处理

```python
# data_protection.py
import hashlib
import secrets

class DataProtection:
    @staticmethod
    def hash_sensitive_data(data):
        """哈希敏感数据"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def generate_secure_token(length=32):
        """生成安全令牌"""
        return secrets.token_hex(length)
    
    @staticmethod
    def mask_user_id(user_id):
        """掩码用户ID"""
        user_str = str(user_id)
        if len(user_str) <= 4:
            return "*" * len(user_str)
        return user_str[:2] + "*" * (len(user_str) - 4) + user_str[-2:]
    
    @staticmethod
    def encrypt_sensitive_data(data, key):
        """加密敏感数据"""
        from cryptography.fernet import Fernet
        
        f = Fernet(key)
        encrypted_data = f.encrypt(data.encode())
        return encrypted_data.decode()
    
    @staticmethod
    def decrypt_sensitive_data(encrypted_data, key):
        """解密敏感数据"""
        from cryptography.fernet import Fernet
        
        f = Fernet(key)
        decrypted_data = f.decrypt(encrypted_data.encode())
        return decrypted_data.decode()
```

## 常见问题排查

### 1. Bot无响应

**问题**: Bot不响应用户消息
**解决方案**:
- 检查Bot Token是否正确
- 验证Bot是否已启动
- 查看日志文件中的错误信息
- 检查网络连接

```bash
# 检查服务状态
sudo systemctl status telegram-bot

# 查看实时日志
sudo journalctl -u telegram-bot -f

# 测试Bot API
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

### 2. 数据库连接失败

**问题**: Bot无法连接Supabase
**解决方案**:
- 验证Supabase URL和API密钥
- 检查网络访问权限
- 确认RLS策略配置

```python
# 测试数据库连接
from supabase import create_client

def test_db_connection():
    url = "your-supabase-url"
    key = "your-supabase-key"
    
    try:
        supabase = create_client(url, key)
        result = supabase.table('users').select('count').execute()
        print("Database connection successful")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
```

### 3. 内存泄漏

**问题**: Bot运行时间长了内存占用过高
**解决方案**:
- 优化代码，释放不必要的对象
- 定期重启Bot服务
- 使用内存监控工具

```bash
# 监控内存使用
ps aux | grep telegram-bot
top -p $(pgrep -f telegram-bot)

# 定期重启服务
sudo crontab -e
# 添加: 0 6 * * * /usr/bin/systemctl restart telegram-bot
```

### 4. 消息发送失败

**问题**: 某些消息无法发送
**解决方案**:
- 检查消息长度限制
- 验证用户是否存在
- 处理API错误

```python
# 处理消息发送错误
async def safe_send_message(bot, chat_id, text):
    try:
        await bot.send_message(chat_id, text)
    except Exception as e:
        error_code = e.args[0].get('error_code', 0)
        error_description = e.args[0].get('description', '')
        
        if error_code == 400:
            if 'chat not found' in error_description:
                print(f"User {chat_id} has blocked the bot")
            elif 'message is too long' in error_description:
                # 分割长消息
                await send_long_message(bot, chat_id, text)
            else:
                print(f"Send message failed: {error_description}")
        else:
            print(f"Unknown error: {error_code} - {error_description}")
```

## 联系支持

如果遇到Bot配置或部署问题，请：

1. 查看Bot日志文件
2. 检查所有环境变量配置
3. 验证网络连接和防火墙设置
4. 参考常见问题解决方案
5. 联系技术支持团队

---

**配置完成后，请进行全面的功能测试，确保Bot能正常工作并与MiniApp正确集成。**