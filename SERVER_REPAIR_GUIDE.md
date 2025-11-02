# 彩票抽奖应用 - 服务器故障修复指南

## 🚨 故障现象
- 访问 http://47.243.83.253:3000/ 加载后提示 "API Error: 404"
- 应用无法正常显示产品列表

## 🔍 原因分析
根本原因是服务器缺少环境变量配置，导致前端无法连接到Supabase后端API。

## 🛠️ 立即修复方案

### 步骤1: 登录服务器
```bash
ssh root@47.243.83.253
# 输入密码: Lingjiu123@
```

### 步骤2: 检查应用状态
```bash
# 查看当前目录
pwd
ls -la

# 检查是否有telegram-lottery-miniapp目录
ls -la | grep telegram
```

### 步骤3: 创建环境变量文件
```bash
# 进入应用目录
cd telegram-lottery-miniapp

# 创建环境变量文件
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF

# 验证文件创建
cat .env.local
```

### 步骤4: 重启应用服务
```bash
# 方法1: 如果使用PM2
pm2 restart all

# 方法2: 如果直接运行
pkill -f "npm run dev"    # 停止现有进程
nohup npm run dev > app.log 2>&1 &    # 重新启动

# 检查是否启动成功
sleep 3
netstat -tulpn | grep 3000
```

### 步骤5: 验证修复结果
```bash
# 检查应用日志
tail -20 app.log

# 测试API连接
curl -I http://localhost:3000
```

## 🎯 自动修复脚本

将以下脚本保存为 `auto_fix.sh` 并执行：

```bash
#!/bin/bash
set -e

echo "🎯 自动修复彩票抽奖应用..."

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo "❌ 未找到package.json，请确保在项目根目录运行此脚本"
    exit 1
fi

# 创建环境变量文件
echo "📝 创建环境变量配置..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mftfgofnosakobjfpzss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8
EOF

echo "✅ 环境变量文件已创建"

# 重启应用
echo "🔄 重启应用服务..."

# 停止现有进程
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# 等待进程完全结束
sleep 2

# 启动新进程
nohup npm run dev > app.log 2>&1 &
APP_PID=$!

echo "✅ 应用已启动，PID: $APP_PID"

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 8

# 检查是否启动成功
if netstat -tulpn | grep -q ":3000"; then
    echo "🎉 应用已成功运行在端口3000"
    echo ""
    echo "请访问以下地址验证修复结果:"
    echo "  - 主页: http://47.243.83.253:3000/"
    echo "  - 管理后台: http://47.243.83.253:3000/admin"
    echo ""
    echo "管理员账号:"
    echo "  - 用户名: admin"
    echo "  - 密码: admin123"
else
    echo "❌ 应用启动失败，请检查日志:"
    tail -20 app.log
    exit 1
fi

echo "🎯 修复完成！"
```

## 📋 故障排除

### 如果修复后仍然404错误：

1. **检查防火墙设置**：
```bash
ufw status
ufw allow 3000
```

2. **检查Nginx配置**：
```bash
nginx -t
systemctl reload nginx
```

3. **检查Node.js和npm版本**：
```bash
node --version
npm --version
```

4. **重新安装依赖**：
```bash
npm install
```

5. **检查Supabase连接**：
```bash
curl -X POST "https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGZnb2Zub3Nha29iamZwenNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDM4OTgsImV4cCI6MjA3NzYxOTg5OH0.9TYA-VqkitQayTkS4IXwOW4aqQ3aa2UKPH2IqBddbJ8"
```

## ✅ 修复验证清单

- [ ] 成功创建 `.env.local` 文件
- [ ] 环境变量包含正确的Supabase URL和密钥
- [ ] 应用进程在端口3000运行
- [ ] 访问 http://47.243.83.253:3000/ 显示产品列表
- [ ] 访问 http://47.243.83.253:3000/admin 可以登录管理后台

## 🆘 获取帮助

如果遇到问题，请运行以下命令并提供输出：
```bash
# 系统状态
uptime
df -h
free -h

# 应用状态
ps aux | grep node
netstat -tulpn | grep 3000

# 最新日志
tail -50 app.log
```