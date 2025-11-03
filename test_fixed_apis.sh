#!/bin/bash

echo "🧪 测试修复后的API..."

BASE_URL="http://localhost:3000"

echo "⏳ 等待应用启动..."
sleep 5

echo ""
echo "📋 API测试开始:"
echo "=================="

# 测试健康检查API
echo "1️⃣ 测试健康检查API: $BASE_URL/api/health"
echo "请求: GET $BASE_URL/api/health"
echo "响应:"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/health" | head -20

echo ""
echo "=================="

# 测试商品列表API
echo "2️⃣ 测试商品列表API: $BASE_URL/api/get-products"
echo "请求: GET $BASE_URL/api/get-products"
echo "响应:"
curl -s -w "\n状态码: %{http_code}\n" "$BASE_URL/api/get-products" | head -20

echo ""
echo "=================="

# 测试主页
echo "3️⃣ 测试主页: $BASE_URL/"
echo "请求: GET $BASE_URL/"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
echo "响应状态码: $HTTP_CODE"

# 测试管理面板
echo "4️⃣ 测试管理面板: $BASE_URL/admin"
echo "请求: GET $BASE_URL/admin"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")
echo "响应状态码: $HTTP_CODE"

echo ""
echo "📋 测试完成！"