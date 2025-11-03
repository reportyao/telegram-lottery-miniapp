# 部署指南

## 概述

本指南详细说明了如何将Telegram夺宝MiniApp部署到生产环境。我们支持多种部署方式，包括Vercel、阿里云和Docker容器化部署。

## 准备工作

### 环境要求

- **Node.js**: 18.0+ 
- **npm/yarn**: 最新版本
- **Git**: 用于版本控制
- **Supabase账户**: 后端服务
- **Telegram Bot Token**: 机器人令牌

### 必需的环境变量

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram配置
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# 应用配置
NEXT_PUBLIC_APP_URL=your_deployed_app_url
NEXT_PUBLIC_ENVIRONMENT=production

# 可选配置
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn
```

## 部署方式

### 1. Vercel部署（推荐）

#### 1.1 通过GitHub部署

1. **Fork项目到GitHub**
   ```bash
   git clone https://github.com/your-username/telegram-lottery-miniapp.git
   cd telegram-lottery-miniapp
   ```

2. **连接GitHub到Vercel**
   - 访问 [Vercel.com](https://vercel.com)
   - 使用GitHub账户登录
   - 点击"New Project"
   - 选择你的仓库

3. **配置构建设置**
   ```bash
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node Version: 18.x
   ```

4. **配置环境变量**
   在Vercel项目设置中添加所有必需的环境变量

5. **部署**
   Vercel会自动部署，每次推送到main分支都会触发新的部署

#### 1.2 通过Vercel CLI部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

3. **配置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # ... 添加其他环境变量
   ```

#### 1.3 自定义域名

1. **在Vercel项目设置中添加域名**
2. **配置DNS记录**
   ```
   类型: CNAME
   名称: www
   值: cname.vercel-dns.com
   
   类型: A
   名称: @
   值: 76.76.21.21
   ```

### 2. 阿里云部署

#### 2.1 服务器准备

1. **购买ECS实例**
   - 推荐配置: 2核4G，带宽5Mbps
   - 操作系统: Ubuntu 20.04 LTS

2. **安全组配置**
   - 开放80端口 (HTTP)
   - 开放443端口 (HTTPS)
   - 开放22端口 (SSH)

#### 2.2 环境配置

1. **更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **安装Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **安装Nginx**
   ```bash
   sudo apt install -y nginx
   ```

4. **安装PM2**
   ```bash
   sudo npm install -g pm2
   ```

#### 2.3 应用部署

1. **上传项目**
   ```bash
   git clone https://github.com/your-username/telegram-lottery-miniapp.git
   cd telegram-lottery-miniapp
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建应用**
   ```bash
   npm run build
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑.env.local文件
   ```

5. **配置Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/telegram-lottery-miniapp
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **启用站点**
   ```bash
   sudo ln -s /etc/nginx/sites-available/telegram-lottery-miniapp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

#### 2.4 SSL证书配置

1. **安装Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **获取SSL证书**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **自动续期**
   ```bash
   sudo crontab -e
   # 添加以下行
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### 3. Docker容器化部署

#### 3.1 创建Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 3.2 创建docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped
```

#### 3.3 部署命令

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 更新部署
docker-compose pull
docker-compose up -d
```

## Supabase配置

### 1. 创建数据库表

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    full_name VARCHAR(255),
    balance DECIMAL(10,2) DEFAULT 0.00,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建产品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    description JSONB,
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建抽奖轮次表
CREATE TABLE lottery_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    total_shares INTEGER NOT NULL,
    sold_shares INTEGER DEFAULT 0,
    price_per_share DECIMAL(10,2) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建参与记录表
CREATE TABLE participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    round_id UUID REFERENCES lottery_rounds(id) ON DELETE CASCADE,
    shares INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    product_id UUID,
    round_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建转售表
CREATE TABLE resales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participation_id UUID REFERENCES participations(id) ON DELETE CASCADE,
    shares INTEGER NOT NULL,
    asking_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建交易记录表
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建推荐表
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 配置RLS策略

```sql
-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own participations" ON participations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);
```

### 3. 部署Edge Functions

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 部署函数
supabase functions deploy telegram-auth
supabase functions deploy get-products
supabase functions deploy participate-lottery
supabase functions deploy user-profile
supabase functions deploy create-order
supabase functions deploy resale-api
supabase functions deploy auto-draw-lottery
supabase functions deploy admin-api
supabase functions deploy posts-manage
```

## Telegram Bot部署

### 1. 准备Bot代码

```bash
cd bot/
pip install -r requirements.txt
```

### 2. 配置Bot环境变量

```bash
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WEB_APP_URL=https://your-deployed-app-url.com
```

### 3. 部署Bot

#### 使用systemd服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/telegram-lottery-bot.service
```

```ini
[Unit]
Description=Telegram Lottery Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/telegram-lottery-miniapp/bot
Environment=BOT_TOKEN=your_bot_token
Environment=SUPABASE_URL=your_supabase_url
Environment=SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Environment=WEB_APP_URL=https://your-app-url.com
ExecStart=/usr/bin/python3 bot/enhanced_bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl enable telegram-lottery-bot
sudo systemctl start telegram-lottery-bot
sudo systemctl status telegram-lottery-bot
```

#### 使用Docker部署Bot

```dockerfile
# Dockerfile.bot
FROM python:3.9-slim

WORKDIR /app
COPY bot/requirements.txt .
RUN pip install -r requirements.txt

COPY bot/ .
CMD ["python", "enhanced_bot.py"]
```

```bash
# 构建并运行
docker build -f Dockerfile.bot -t telegram-bot .
docker run -d --name telegram-bot \
  -e BOT_TOKEN=your_token \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e WEB_APP_URL=https://your-app.com \
  telegram-bot
```

## 监控和维护

### 1. 日志监控

#### 使用PM2监控

```bash
# 查看应用状态
pm2 status
pm2 monit

# 查看日志
pm2 logs telegram-lottery-miniapp

# 重启应用
pm2 restart telegram-lottery-miniapp

# 零停机重载
pm2 reload telegram-lottery-miniapp
```

#### 配置日志轮转

```bash
# 创建logrotate配置
sudo nano /etc/logrotate.d/telegram-lottery
```

```
/var/www/telegram-lottery-miniapp/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. 性能监控

#### 使用Sentry监控错误

```javascript
// pages/_error.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### 使用New Relic监控性能

```bash
# 安装New Relic
npm install newrelic
```

### 3. 备份策略

#### 数据库备份

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/supabase"

# 创建备份
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/backup_$DATE.sql

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

#### 文件备份

```bash
# 备份上传的文件
tar -czf /var/backups/uploads_$(date +%Y%m%d).tar.gz /var/www/telegram-lottery-miniapp/public/uploads
```

### 4. 更新部署

#### 使用Git部署脚本

```bash
#!/bin/bash
# deploy.sh

echo "开始部署..."

# 拉取最新代码
git pull origin main

# 安装依赖
npm ci

# 运行测试
npm test

# 构建应用
npm run build

# 重启服务
pm2 reload telegram-lottery-miniapp

echo "部署完成！"
```

#### 使用CI/CD自动化

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本
   - 清理缓存：`npm run clean`
   - 重新安装依赖：`rm -rf node_modules && npm install`

2. **数据库连接失败**
   - 验证Supabase URL和API密钥
   - 检查网络连接
   - 确认RLS策略配置

3. **Bot不响应**
   - 检查Bot Token是否正确
   - 查看Bot日志：`pm2 logs telegram-bot`
   - 确认Webhook URL配置

4. **性能问题**
   - 检查内存使用：`pm2 monit`
   - 分析慢查询日志
   - 优化数据库索引

### 联系支持

如果遇到部署问题，请：

1. 查看应用日志
2. 检查环境变量配置
3. 验证网络连接
4. 联系技术支持

---

**部署完成后，建议进行全面的功能测试，确保所有功能正常工作。**