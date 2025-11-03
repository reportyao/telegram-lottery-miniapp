# 服务器环境变量配置指南

## 问题原因
您的应用出现 "API Error: 404" 是因为服务器上缺少环境变量配置。

## 解决方案

### 1. 在服务器上创建环境变量文件

在您的项目根目录 `/path/to/your/telegram-lottery-miniapp/` 下创建 `.env.local` 文件：

```bash
# 进入项目目录
cd /path/to/your/telegram-lottery-miniapp/

# 创建环境变量文件
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF
```

### 2. 重启应用

```bash
# 如果使用PM2
pm2 restart all

# 或者杀死现有进程并重新启动
pkill -f "npm run dev"
npm run dev
```

### 3. 验证修复

访问 http://47.243.83.253:3000/ 应该可以看到：
- 应用正常加载
- 显示产品列表
- 无404错误

## API端点（已部署完成）

后端API已全部部署到Supabase：

### ✅ 已部署的Edge Functions
- **get-products**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products
- **admin-api**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/admin-api  
- **create-order**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/create-order
- **auto-draw-lottery**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/auto-draw-lottery
- **participate-lottery**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/participate-lottery
- **resale-api**: https://mftfgofnosakobjfpzss.supabase.co/functions/v1/resale-api

### ✅ 数据库表（已存在）
- users（用户表）
- products（产品表） 
- orders（订单表）
- admins（管理员表）
- posts（晒单表）

## 管理员后台

**访问地址**: http://47.243.83.253:3000/admin

**登录信息**:
- 用户名: `admin`
- 密码: `admin123`

## 测试结果

API测试已通过，返回正常数据：
- 产品数量: 3个
- 包含iPhone 15 Pro Max、AirPods Pro 2、MacBook Air M3
- 支持多语言（中文、英文、俄文、塔吉克语）

## 如果仍然有问题

请检查以下项目：
1. 环境变量文件是否创建成功
2. 应用是否重新启动
3. 网络连接是否正常

执行命令验证：
```bash
# 检查环境变量
cat .env.local

# 检查应用运行状态
ps aux | grep node

# 检查应用端口
netstat -tulpn | grep 3000
```