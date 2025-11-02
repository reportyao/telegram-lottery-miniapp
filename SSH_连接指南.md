# SSH服务器检查脚本

## 服务器信息
- 服务器IP: 47.243.83.253
- 用户名: root  
- 密码: Lingjiu123@

## 使用方法

### 方法1: 使用提供的脚本
```bash
# 在您的本地终端中运行:
ssh root@47.243.83.253 "pwd; ls -la; ps aux | head -10"
# 然后手动输入密码: Lingjiu123@
```

### 方法2: 手动连接检查
```bash
ssh root@47.243.83.253
# 输入密码后执行:
pwd
ls -la
ps aux | head -10
df -h
free -h
uptime
```

### 方法3: 一行命令检查
```bash
sshpass -p 'Lingjiu123@' ssh -o StrictHostKeyChecking=no root@47.243.83.253 "pwd && ls -la && ps aux | head -10"
```

## 注意事项
1. 如果没有sshpass工具，请安装它: `apt install sshpass` 或 `brew install hudochenkov/sshpass/sshpass`
2. 服务器可能需要密码确认，这是正常的安全措施
3. 建议在生产环境中使用SSH密钥而不是密码认证

## 常见问题
- 如果连接超时，请检查网络连接
- 如果认证失败，请确认密码正确
- 如果权限被拒绝，请确认用户名和服务器配置