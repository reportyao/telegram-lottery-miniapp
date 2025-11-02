# 🚀 Telegram彩票小应用 - 快速部署指南

## 项目已成功推送到GitHub！
**仓库地址**: https://github.com/reportyao/telegram-lottery-miniapp

---

## 📋 部署前准备

### 1. 服务器环境要求
```bash
# Node.js 18+ 和 npm
node --version  # 应显示 v18.0.0 或更高版本
npm --version   # 应显示 9.0.0 或更高版本

# PM2 (推荐用于生产部署)
npm install -g pm2
```

### 2. 获取项目代码
```bash
# 方法1: 直接克隆仓库
git clone https://github.com/reportyao/telegram-lottery-miniapp.git
cd telegram-lottery-miniapp

# 方法2: 如果已经有代码，直接pull最新版本
git pull origin main
```

---

## ⚙️ 环境配置

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入实际配置
nano .env.local
```

**必需的环境变量**:
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥

# Telegram Bot配置  
TELEGRAM_BOT_TOKEN=你的机器人令牌

# 应用配置
NEXT_PUBLIC_APP_URL=https://你的域名.com
NODE_ENV=production
```

---

## 🏗️ 构建和测试

### 1. 一键修复和构建
```bash
# 运行自动化修复脚本（推荐）
chmod +x fix-and-deploy.sh
./fix-and-deploy.sh
```

### 2. 手动构建步骤
```bash
# 类型检查
npm run type-check

# 构建项目
npm run build

# 运行测试
npm test
```

---

## 🚀 启动应用

### 1. 开发模式
```bash
npm run dev
# 应用将在 http://localhost:3000 启动
```

### 2. 生产模式
```bash
# 方式1: 使用PM2（推荐）
pm2 start npm --name "telegram-lottery" -- start

# 方式2: 直接运行
npm start
```

### 3. 验证部署
```bash
# 测试API健康状态
curl http://localhost:3000/api/health

# 测试产品API
curl http://localhost:3000/api/get-products
```

---

## 🔧 Supabase配置检查

### 1. 数据库表检查
确保以下表已创建：
- ✅ users (用户表)
- ✅ products (产品表)
- ✅ lottery_rounds (彩票轮次表)
- ✅ participations (参与记录表)
- ✅ transactions (交易记录表)
- ✅ referrals (推荐记录表)
- ✅ posts (帖子表)
- ✅ resales (转售表)

### 2. Edge Functions部署
检查以下函数已部署：
- ✅ telegram-auth (用户认证)
- ✅ get-products (获取产品)
- ✅ participate-lottery (参与彩票)
- ✅ create-order (创建订单)

---

## 🌐 Nginx配置（可选）

如果使用Nginx作为反向代理：

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

---

## 📱 Telegram Bot配置

### 1. 创建机器人
1. 在Telegram中联系 [@BotFather](https://t.me/BotFather)
2. 创建新机器人并获取Token
3. 设置WebApp URL为你的域名

### 2. 配置WebApp
```bash
# 在BotFather中设置
/setwebapp <你的机器人名> https://你的域名.com
```

---

## 🧪 功能测试

### 1. 自动化测试
```bash
node test-functionality.js
```

### 2. 手动测试步骤
1. **用户认证测试**
   - 在Telegram中打开小程序
   - 验证用户信息正确获取

2. **产品列表测试**
   - 检查产品正常显示
   - 验证图片加载正常

3. **彩票购买测试**
   - 选择彩票产品
   - 输入购买数量
   - 确认购买流程

---

## 🔍 故障排除

### 常见问题

**问题1: 构建失败**
```bash
# 清理缓存重新构建
rm -rf .next node_modules/.cache
npm install
npm run build
```

**问题2: 环境变量错误**
```bash
# 检查环境变量
npm run type-check
```

**问题3: Supabase连接失败**
```bash
# 验证Supabase配置
node test-functionality.js
```

**问题4: 端口被占用**
```bash
# 查找占用进程
lsof -ti:3000
# 杀死进程
kill -9 <PID>
```

---

## 📊 监控和维护

### 1. PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs telegram-lottery

# 重启应用
pm2 restart telegram-lottery
```

### 2. 性能监控
- 访问 `/api/health` 检查应用健康状态
- 监控Supabase仪表板查看数据库状态
- 检查Edge Functions日志

---

## ✅ 部署检查清单

在部署完成后，请确认以下项目：

- [ ] Node.js和npm版本符合要求
- [ ] 环境变量配置正确
- [ ] Supabase数据库连接正常
- [ ] Edge Functions部署成功
- [ ] 应用构建无错误
- [ ] Telegram Bot配置正确
- [ ] 域名和SSL证书配置
- [ ] PM2或其他进程管理器运行正常
- [ ] 防火墙和安全组配置
- [ ] 自动化测试通过

---

## 📞 技术支持

如果在部署过程中遇到问题：

1. **查看日志**: 检查PM2日志和浏览器控制台
2. **运行测试**: 使用提供的测试脚本
3. **检查配置**: 验证环境变量和Supabase设置
4. **查看文档**: 参考项目中的 `BUG_FIX_REPORT.md`

---

**🎉 恭喜！您的Telegram彩票小应用已准备就绪！**

**仓库地址**: https://github.com/reportyao/telegram-lottery-miniapp
**部署完成时间**: 2025-11-03