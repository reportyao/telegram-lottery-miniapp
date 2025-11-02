#!/bin/bash

# Telegram彩票小程序 - 阿里云一键部署脚本
# 作者: MiniMax Agent
# 日期: 2025-11-03

set -e  # 遇到错误立即退出

echo "🚀 Telegram彩票小程序 - 阿里云一键部署脚本"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查当前目录
if [ ! -f "package.json" ]; then
    log_error "未找到package.json文件"
    echo "请确保脚本在项目根目录中运行，或者使用："
    echo "bash deploy.sh /path/to/project"
    exit 1
fi

PROJECT_DIR=$(pwd)
log_info "项目目录: $PROJECT_DIR"

# 检查Node.js版本
check_nodejs() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        echo "请先安装Node.js 18或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js版本过低: $(node --version)"
        echo "请升级到Node.js 18或更高版本"
        exit 1
    fi
    
    log_success "Node.js版本检查通过: $(node --version)"
}

# 安装PM2（如果没有）
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_info "安装PM2进程管理器..."
        npm install -g pm2
        log_success "PM2安装完成"
    else
        log_success "PM2已安装"
    fi
}

# 清理旧文件
cleanup_old_files() {
    log_info "清理旧文件..."
    rm -rf node_modules package-lock.json .next dist
    log_success "清理完成"
}

# 配置npm镜像源
configure_npm_registry() {
    log_info "配置npm镜像源..."
    
    # 使用淘宝镜像源
    npm config set registry https://registry.npm.taobao.org
    
    log_success "npm镜像源配置完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 如果遇到ECONNRESET错误，自动重试
    MAX_RETRIES=3
    for i in $(seq 1 $MAX_RETRIES); do
        log_info "尝试安装依赖 (第 $i 次)..."
        
        if npm install; then
            log_success "依赖安装完成"
            return 0
        else
            if [ $i -eq $MAX_RETRIES ]; then
                log_error "依赖安装失败，已重试 $MAX_RETRIES 次"
                exit 1
            else
                log_warning "安装失败，5秒后重试..."
                sleep 5
            fi
        fi
    done
}

# 创建环境变量文件
create_env_file() {
    if [ ! -f ".env.local" ]; then
        log_info "创建环境变量文件..."
        
        cat > .env.local << 'EOF'
# Supabase配置 - 请替换为您的实际值
NEXT_PUBLIC_SUPABASE_URL=您的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的Supabase匿名密钥

# Telegram Bot配置（可选）
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=您的Telegram Bot Token

# 应用配置
NODE_ENV=production
PORT=3000
EOF
        
        log_warning "请编辑 .env.local 文件，填入您的实际配置"
        echo ""
        echo "📝 环境变量配置说明:"
        echo "NEXT_PUBLIC_SUPABASE_URL: 您的Supabase项目URL"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: 您的Supabase匿名密钥"
        echo ""
        
        read -p "按Enter键继续部署，或按Ctrl+C退出编辑环境变量..."
    else
        log_success "环境变量文件已存在"
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    if npm run build; then
        log_success "项目构建完成"
    else
        log_error "项目构建失败"
        echo ""
        echo "常见问题及解决方案:"
        echo "1. TypeScript类型错误 - 检查类型定义"
        echo "2. 依赖版本冲突 - 运行 'npm audit fix'"
        echo "3. 内存不足 - 增加Node.js内存限制"
        echo ""
        
        # 尝试修复常见问题
        log_info "尝试修复常见问题..."
        npm audit fix --force
        npm run build || {
            log_error "构建失败，请手动检查错误"
            exit 1
        }
    fi
}

# 停止现有进程
stop_existing_processes() {
    log_info "停止现有进程..."
    
    # 停止PM2中的相关进程
    if command -v pm2 &> /dev/null; then
        pm2 delete telegram-lottery 2>/dev/null || true
        pm2 delete lottery-app 2>/dev/null || true
        pm2 delete nextjs-app 2>/dev/null || true
    fi
    
    # 杀死占用3000端口的进程
    PORT_PID=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$PORT_PID" ]; then
        log_info "杀死占用端口3000的进程: $PORT_PID"
        kill -9 $PORT_PID
    fi
    
    log_success "现有进程清理完成"
}

# 启动应用
start_app() {
    log_info "启动应用..."
    
    # 使用PM2启动
    pm2 start npm --name "telegram-lottery" -- start
    
    # 等待服务启动
    sleep 5
    
    # 检查应用状态
    if pm2 list | grep -q "telegram-lottery.*online"; then
        log_success "应用启动成功"
    else
        log_error "应用启动失败"
        pm2 logs telegram-lottery --lines 20
        exit 1
    fi
}

# 配置PM2自启动
setup_pm2_startup() {
    log_info "配置PM2自启动..."
    
    pm2 startup >/dev/null 2>&1
    pm2 save >/dev/null 2>&1
    
    log_success "PM2自启动配置完成"
}

# 测试应用
test_app() {
    log_info "测试应用连接..."
    
    # 等待服务完全启动
    sleep 3
    
    # 测试HTTP连接
    if curl -s http://localhost:3000 >/dev/null; then
        log_success "应用测试通过 - http://localhost:3000"
        echo ""
        echo "🎉 部署成功！"
        echo ""
        echo "📊 应用状态:"
        pm2 list
        echo ""
        echo "📝 常用命令:"
        echo "pm2 logs telegram-lottery     - 查看应用日志"
        echo "pm2 restart telegram-lottery  - 重启应用"
        echo "pm2 stop telegram-lottery     - 停止应用"
        echo ""
    else
        log_warning "应用连接测试失败，但可能仍在启动中"
        echo "请稍后访问: http://localhost:3000"
        echo "或查看日志: pm2 logs telegram-lottery"
    fi
}

# 显示部署总结
show_deployment_summary() {
    echo ""
    echo "=============================================="
    echo "           🚀 部署完成总结"
    echo "=============================================="
    echo ""
    echo "✅ 项目信息:"
    echo "   目录: $PROJECT_DIR"
    echo "   端口: 3000"
    echo "   进程管理器: PM2"
    echo ""
    echo "🌐 访问地址:"
    echo "   本地: http://localhost:3000"
    echo "   外部: http://$(curl -s ifconfig.me 2>/dev/null || echo '您的服务器IP'):3000"
    echo ""
    echo "📋 下一步:"
    echo "1. 编辑 .env.local 文件，配置您的Supabase和Telegram信息"
    echo "2. 重启应用: pm2 restart telegram-lottery"
    echo "3. 配置Nginx反向代理（可选）"
    echo "4. 设置域名和HTTPS（推荐）"
    echo ""
    echo "🛠️ 管理命令:"
    echo "pm2 list                  - 查看进程状态"
    echo "pm2 logs telegram-lottery - 查看应用日志"
    echo "pm2 restart telegram-lottery - 重启应用"
    echo "pm2 stop telegram-lottery  - 停止应用"
    echo ""
    echo "如需帮助，请查看: 阿里云部署完整指南.md"
    echo ""
}

# 主执行流程
main() {
    log_info "开始部署..."
    
    check_nodejs
    install_pm2
    cleanup_old_files
    configure_npm_registry
    install_dependencies
    create_env_file
    stop_existing_processes
    build_project
    start_app
    setup_pm2_startup
    test_app
    show_deployment_summary
    
    log_success "部署脚本执行完成！"
}

# 执行主函数
main