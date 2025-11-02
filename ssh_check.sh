#!/bin/bash
# SSH服务器连接脚本
# 使用方法：在终端中运行 bash ssh_check.sh

echo "正在连接到服务器 47.243.83.253..."
echo "请手动输入密码: Lingjiu123@"
echo ""

# 执行连接后的命令
ssh root@47.243.83.253 << 'EOF'
echo "=== 当前工作目录 ==="
pwd

echo ""
echo "=== 目录内容 ==="
ls -la

echo ""
echo "=== 系统信息 ==="
uname -a

echo ""
echo "=== 项目状态检查 ==="
echo "当前运行的进程:"
ps aux | head -10

echo ""
echo "=== 磁盘使用情况 ==="
df -h

echo ""
echo "=== 内存使用情况 ==="
free -h

echo ""
echo "=== 网络连接状态 ==="
netstat -tuln | head -10

echo ""
echo "=== 最近登录记录 ==="
last | head -5

echo ""
echo "=== 系统负载 ==="
uptime

echo ""
echo "=== 日志文件检查 ==="
if [ -f "/var/log/syslog" ]; then
    echo "最近的系统日志:"
    tail -10 /var/log/syslog
elif [ -f "/var/log/messages" ]; then
    echo "最近的系统消息:"
    tail -10 /var/log/messages
else
    echo "无法找到标准系统日志文件"
fi

echo ""
echo "=== 检查常见服务状态 ==="
systemctl status ssh 2>/dev/null || echo "SSH服务状态检查失败"
systemctl status nginx 2>/dev/null || echo "Nginx服务未安装或未运行"
systemctl status apache2 2>/dev/null || echo "Apache服务未安装或未运行"

echo ""
echo "=== 网络端口监听状态 ==="
ss -tuln | grep LISTEN

exit
EOF