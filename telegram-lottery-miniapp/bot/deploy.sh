#!/bin/bash

# Telegram Bot 部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env_vars() {
    print_info "检查环境变量..."
    
    required_vars=(
        "BOT_TOKEN"
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "WEB_APP_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "环境变量 $var 未设置"
            exit 1
        fi
        print_success "$var 已设置"
    done
}

# 安装依赖
install_dependencies() {
    print_info "安装 Python 依赖..."
    
    # 检查 Python 版本
    python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
    required_version="3.8"
    
    if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
        print_success "Python 版本检查通过: $python_version"
    else
        print_error "需要 Python 3.8 或更高版本，当前版本: $python_version"
        exit 1
    fi
    
    # 升级 pip
    python3 -m pip install --upgrade pip
    
    # 安装依赖
    python3 -m pip install -r requirements.txt
    
    print_success "依赖安装完成"
}

# 检查 Supabase 连接
check_supabase() {
    print_info "检查 Supabase 连接..."
    
    python3 -c "
import os
from supabase import create_client

try:
    supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
    result = supabase.table('users').select('count').execute()
    print('Supabase 连接正常')
except Exception as e:
    print(f'Supabase 连接失败: {e}')
    exit(1)
"
    
    print_success "Supabase 连接正常"
}

# 测试 Bot Token
test_bot_token() {
    print_info "测试 Bot Token..."
    
    python3 -c "
import os
import requests

token = os.getenv('BOT_TOKEN')
url = f'https://api.telegram.org/bot{token}/getMe'

try:
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            bot_info = data.get('result', {})
            print(f'Bot Token 有效: @{bot_info.get(\"username\", \"Unknown\")}')
        else:
            print('Bot Token 验证失败')
            exit(1)
    else:
        print(f'HTTP 错误: {response.status_code}')
        exit(1)
except Exception as e:
    print(f'Bot Token 测试失败: {e}')
    exit(1)
"
    
    print_success "Bot Token 测试通过"
}

# 设置 Bot 命令
setup_bot_commands() {
    print_info "设置 Bot 命令..."
    
    python3 -c "
import os
import requests

token = os.getenv('BOT_TOKEN')
commands = [
    {'command': 'start', 'description': 'Start the bot and register'},
    {'command': 'help', 'description': 'Get help and commands list'},
    {'command': 'products', 'description': 'View available products'},
    {'command': 'profile', 'description': 'Open profile center'},
    {'command': 'balance', 'description': 'Check your balance'},
    {'command': 'orders', 'description': 'View your orders'},
    {'command': 'referral', 'description': 'Invite friends and earn rewards'},
    {'command': 'resales', 'description': 'Access resale market'},
    {'command': 'balance_top', 'description': 'Quick top up'},
    {'command': 'my_tickets', 'description': 'View my lottery tickets'}
]

url = f'https://api.telegram.org/bot{token}/setMyCommands'

try:
    response = requests.post(url, json={'commands': commands})
    if response.status_code == 200:
        print('Bot 命令设置成功')
    else:
        print(f'Bot 命令设置失败: {response.status_code}')
except Exception as e:
    print(f'Bot 命令设置错误: {e}')
"
    
    print_success "Bot 命令设置完成"
}

# 创建系统服务文件
create_systemd_service() {
    print_info "创建 systemd 服务..."
    
    # 获取当前用户
    current_user=$(whoami)
    
    # 创建服务文件
    sudo tee /etc/systemd/system/telegram-lottery-bot.service > /dev/null <<EOF
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=$current_user
WorkingDirectory=$(pwd)
Environment=BOT_TOKEN=$BOT_TOKEN
Environment=SUPABASE_URL=$SUPABASE_URL
Environment=SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
Environment=WEB_APP_URL=$WEB_APP_URL
ExecStart=/usr/bin/python3 enhanced_bot.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=telegram-bot

[Install]
WantedBy=multi-user.target
EOF

    print_success "systemd 服务文件已创建"
}

# 创建 Docker 配置
create_docker_config() {
    print_info "创建 Docker 配置..."
    
    # Dockerfile
    cat > Dockerfile <<EOF
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建日志目录
RUN mkdir -p /app/logs

# 设置权限
RUN chmod +x enhanced_bot.py

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD python health_check.py || exit 1

EXPOSE 8080

CMD ["python", "enhanced_bot.py"]
EOF

    # docker-compose.yml
    cat > docker-compose.yml <<EOF
version: '3.8'

services:
  bot:
    build: .
    container_name: telegram-lottery-bot
    restart: unless-stopped
    environment:
      - BOT_TOKEN=\${BOT_TOKEN}
      - SUPABASE_URL=\${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
      - WEB_APP_URL=\${WEB_APP_URL}
    volumes:
      - ./logs:/app/logs
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - bot-network

networks:
  bot-network:
    driver: bridge
EOF

    # .dockerignore
    cat > .dockerignore <<EOF
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
.env
*.log
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
.npm
node_modules
EOF

    print_success "Docker 配置已创建"
}

# 创建监控脚本
create_monitoring_scripts() {
    print_info "创建监控脚本..."
    
    # 健康检查脚本
    cat > health_check.py <<'EOF'
#!/usr/bin/env python3
import os
import sys
import time
import psutil
import requests

def check_telegram_bot():
    """检查 Telegram Bot 状态"""
    token = os.getenv('BOT_TOKEN')
    if not token:
        return False
    
    try:
        response = requests.get(f'https://api.telegram.org/bot{token}/getMe', timeout=10)
        return response.status_code == 200
    except:
        return False

def check_supabase():
    """检查 Supabase 连接"""
    try:
        from supabase import create_client
        supabase = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        result = supabase.table('users').select('count').execute()
        return True
    except:
        return False

def check_memory_usage():
    """检查内存使用率"""
    memory = psutil.virtual_memory()
    return memory.percent < 80

def main():
    checks = [
        ('Telegram Bot', check_telegram_bot),
        ('Supabase', check_supabase),
        ('Memory Usage', check_memory_usage)
    ]
    
    all_healthy = True
    for check_name, check_func in checks:
        try:
            if check_func():
                print(f"✓ {check_name} is healthy")
            else:
                print(f"✗ {check_name} is not healthy")
                all_healthy = False
        except Exception as e:
            print(f"✗ {check_name} check failed: {e}")
            all_healthy = False
    
    return 0 if all_healthy else 1

if __name__ == '__main__':
    sys.exit(main())
EOF

    # 重启脚本
    cat > restart_bot.sh <<'EOF'
#!/bin/bash
echo "Restarting Telegram Lottery Bot..."
sudo systemctl restart telegram-lottery-bot
sleep 5
if sudo systemctl is-active --quiet telegram-lottery-bot; then
    echo "Bot restarted successfully"
else
    echo "Bot restart failed, checking logs..."
    sudo journalctl -u telegram-lottery-bot --no-pager -n 20
fi
EOF

    chmod +x health_check.py restart_bot.sh
    
    print_success "监控脚本已创建"
}

# 启动服务
start_service() {
    print_info "启动 Bot 服务..."
    
    # 重新加载 systemd 配置
    sudo systemctl daemon-reload
    
    # 启用服务
    sudo systemctl enable telegram-lottery-bot
    
    # 启动服务
    sudo systemctl start telegram-lottery-bot
    
    # 检查服务状态
    sleep 5
    if sudo systemctl is-active --quiet telegram-lottery-bot; then
        print_success "Bot 服务已启动"
        
        # 显示服务状态
        echo
        print_info "服务状态："
        sudo systemctl status telegram-lottery-bot --no-pager -l
        
        # 显示日志
        echo
        print_info "最新日志："
        sudo journalctl -u telegram-lottery-bot --no-pager -n 10
    else
        print_error "Bot 服务启动失败"
        exit 1
    fi
}

# 主函数
main() {
    echo "======================================"
    echo "    Telegram Lottery Bot 部署脚本"
    echo "======================================"
    echo
    
    # 检查参数
    if [ "$1" = "docker" ]; then
        print_info "使用 Docker 模式部署..."
        docker-compose up -d
        print_success "Docker 部署完成"
        return
    elif [ "$1" = "development" ]; then
        print_info "开发模式启动..."
        install_dependencies
        check_env_vars
        check_supabase
        print_success "开发环境准备完成，运行: python3 enhanced_bot.py"
        return
    fi
    
    # 标准化部署
    check_env_vars
    install_dependencies
    check_supabase
    test_bot_token
    setup_bot_commands
    create_systemd_service
    create_docker_config
    create_monitoring_scripts
    start_service
    
    echo
    print_success "Bot 部署完成！"
    echo
    echo "管理命令："
    echo "  启动: sudo systemctl start telegram-lottery-bot"
    echo "  停止: sudo systemctl stop telegram-lottery-bot"
    echo "  重启: sudo systemctl restart telegram-lottery-bot"
    echo "  状态: sudo systemctl status telegram-lottery-bot"
    echo "  日志: sudo journalctl -u telegram-lottery-bot -f"
    echo
    echo "Docker 管理："
    echo "  启动: docker-compose up -d"
    echo "  停止: docker-compose down"
    echo "  重启: ./restart_bot.sh"
    echo
}

# 错误处理
set -e
trap 'print_error "脚本执行失败，请检查错误信息"' ERR

# 执行主函数
main "$@"