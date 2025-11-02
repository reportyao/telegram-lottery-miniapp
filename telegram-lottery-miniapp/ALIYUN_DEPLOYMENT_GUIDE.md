# 🚀 阿里云服务器部署方案

## 当前情况
- 项目文件位置：`/workspace/telegram-lottery-miniapp/`
- 您需要将这些文件传输到您的阿里云服务器：`root@iZj6c0wgvce81u5p5jgrd4Z`

## 📋 部署步骤

### 步骤1: 在阿里云服务器上创建项目目录
```bash
# 在您的阿里云服务器上执行
mkdir -p /root/telegram-lottery-miniapp
cd /root/telegram-lottery-miniapp
```

### 步骤2: 下载项目文件
您可以通过以下方式获取项目文件：

#### 方法A: 如果您有访问权限
```bash
# 复制整个项目目录
cp -r /workspace/telegram-lottery-miniapp/* /root/telegram-lottery-miniapp/
```

#### 方法B: 手动创建项目结构（推荐）
我将为您提供完整的项目结构和内容

### 步骤3: 创建package.json
在您的阿里云服务器上执行：
```bash
cat > /root/telegram-lottery-miniapp/package.json << 'EOF'
{
  "name": "telegram-lottery-miniapp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  },
  "dependencies": {
    "next": "^14.2.33",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@telegram-apps/sdk": "^1.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.1",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.33",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "testMatch": [
      "**/__tests__/**/*.(test|spec).(ts|tsx)",
      "**/*.(test|spec).(ts|tsx)"
    ]
  }
}
EOF
```

### 步骤4: 安装依赖
```bash
# 配置npm镜像
npm config set registry https://registry.npm.taobao.org

# 安装依赖
npm install

# 如果安装失败，尝试分批安装
npm install next react react-dom @supabase/supabase-js @telegram-apps/sdk
npm install clsx tailwind-merge @radix-ui/react-dialog lucide-react
npm install --save-dev typescript @types/node @types/react @types/react-dom
npm install --save-dev eslint eslint-config-next jest @testing-library/react
```

### 步骤5: 环境配置
```bash
# 创建环境变量文件
cat > /root/telegram-lottery-miniapp/.env.local << 'EOF'
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram 配置
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
PORT=3000
EOF
```

### 步骤6: 构建和启动
```bash
# 构建项目
npm run build

# 启动应用
npm start
```

## 🔧 故障排除

### 如果npm install失败:
```bash
# 清理并重试
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --verbose
```

### 如果构建失败:
```bash
# 类型检查
npm run type-check

# 查看详细错误
npm run build --verbose
```

### 如果启动失败:
```bash
# 检查环境变量
cat /root/telegram-lottery-miniapp/.env.local

# 检查端口占用
netstat -tlnp | grep :3000

# 杀死占用进程
kill -9 $(lsof -ti:3000)
```

## 🎯 下一步
部署成功后，请确保：
1. ✅ 应用访问：http://your-server-ip:3000
2. ✅ Telegram Bot配置
3. ✅ Supabase数据库连接
4. ✅ 环境变量正确配置

## 📞 需要帮助？
如果在部署过程中遇到任何问题，请告诉我具体的错误信息，我会提供相应的解决方案。
