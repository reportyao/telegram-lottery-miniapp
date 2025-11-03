#!/bin/bash

echo "=== 检查项目路径 ==="
cd /workspace/telegram-lottery-miniapp
pwd

echo "=== 检查components目录内容 ==="
ls -la components/

echo "=== 检查git状态 ==="
git status

echo "=== 检查是否在git仓库中 ==="
git log --oneline -1

echo "=== 强制添加并推送components ==="
git add components/
git commit -m "同步组件文件到GitHub"
git push origin master

echo "=== 验证推送成功 ==="
git ls-tree -r HEAD | grep components