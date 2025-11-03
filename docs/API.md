# API文档

## 概述

本文档描述了Telegram MiniApp夺宝系统的所有API端点。

## 基础信息

- **Base URL**: `https://mftfgofnosakobjfpzss.supabase.co`
- **Edge Functions URL**: `https://mftfgofnosakobjfpzss.supabase.co/functions/v1`

## 身份验证

所有API请求都需要在请求头中包含以下信息：

```http
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
apikey: YOUR_SUPABASE_ANON_KEY
```

## API端点

### 1. 用户认证

#### 获取用户信息
```http
POST /functions/v1/telegram-auth
```

**请求体**:
```json
{
  "initData": "user={\"id\":123456789,\"first_name\":\"John\"}&auth_date=1640995200&hash=xxx"
}
```

**响应**:
```json
{
  "user": {
    "id": "user-uuid",
    "telegram_id": 123456789,
    "username": "johndoe",
    "full_name": "John Doe",
    "balance": 100.00,
    "language": "en",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### 2. 产品管理

#### 获取产品列表
```http
GET /functions/v1/get-products
```

**查询参数**:
- `limit` (可选): 限制返回数量，默认20
- `offset` (可选): 偏移量，默认0
- `category` (可选): 产品分类
- `active_only` (可选): 只返回活跃产品，默认为true

**响应**:
```json
{
  "products": [
    {
      "id": "product-uuid",
      "name": {
        "en": "iPhone 15 Pro",
        "zh": "iPhone 15 Pro"
      },
      "description": {
        "en": "Latest iPhone model",
        "zh": "最新iPhone型号"
      },
      "image_url": "https://example.com/image.jpg",
      "price": 999.00,
      "active_rounds": [
        {
          "id": "round-uuid",
          "status": "active",
          "total_shares": 100,
          "sold_shares": 50,
          "price_per_share": 10.00,
          "end_time": "2024-12-31T23:59:59Z"
        }
      ]
    }
  ],
  "total": 25
}
```

#### 获取单个产品详情
```http
GET /functions/v1/get-products?id=product-uuid
```

### 3. 抽奖参与

#### 参与抽奖
```http
POST /functions/v1/participate-lottery
```

**请求体**:
```json
{
  "product_id": "product-uuid",
  "round_id": "round-uuid",
  "shares": 5,
  "user_id": "user-uuid"
}
```

**响应**:
```json
{
  "success": true,
  "participation": {
    "id": "participation-uuid",
    "user_id": "user-uuid",
    "product_id": "product-uuid",
    "round_id": "round-uuid",
    "shares": 5,
    "amount": 50.00,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "new_balance": 50.00
}
```

### 4. 用户管理

#### 获取用户档案
```http
POST /functions/v1/user-profile
```

**请求体**:
```json
{
  "user_id": "user-uuid"
}
```

**响应**:
```json
{
  "user": {
    "id": "user-uuid",
    "telegram_id": 123456789,
    "username": "johndoe",
    "full_name": "John Doe",
    "balance": 100.00,
    "language": "en",
    "total_spent": 500.00,
    "total_wins": 3,
    "participations": 15,
    "referrals": 5
  },
  "recent_participations": [...],
  "recent_wins": [...]
}
```

#### 更新用户信息
```http
PUT /functions/v1/user-profile
```

**请求体**:
```json
{
  "user_id": "user-uuid",
  "language": "en",
  "notification_preferences": {
    "email": true,
    "push": false
  }
}
```

### 5. 订单管理

#### 创建订单
```http
POST /functions/v1/create-order
```

**请求体**:
```json
{
  "user_id": "user-uuid",
  "type": "lottery_participation",
  "amount": 50.00,
  "product_id": "product-uuid",
  "round_id": "round-uuid",
  "shares": 5
}
```

**响应**:
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "user_id": "user-uuid",
    "type": "lottery_participation",
    "status": "pending",
    "amount": 50.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 获取用户订单
```http
POST /functions/v1/user-profile
```

**查询参数**:
- `status` (可选): 订单状态筛选
- `limit` (可选): 限制数量
- `offset` (可选): 偏移量

### 6. 转售市场

#### 获取转售列表
```http
GET /functions/v1/resale-api?action=get_resales
```

**响应**:
```json
{
  "resales": [
    {
      "id": "resale-uuid",
      "product_id": "product-uuid",
      "seller_id": "seller-uuid",
      "buyer_id": null,
      "shares": 1,
      "asking_price": 15.00,
      "original_price": 10.00,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 创建转售
```http
POST /functions/v1/resale-api?action=create_resale
```

**请求体**:
```json
{
  "user_id": "user-uuid",
  "product_id": "product-uuid",
  "participation_id": "participation-uuid",
  "asking_price": 15.00
}
```

#### 购买转售
```http
POST /functions/v1/resale-api?action=purchase_resale
```

**请求体**:
```json
{
  "user_id": "buyer-uuid",
  "resale_id": "resale-uuid"
}
```

### 7. 推荐系统

#### 获取推荐信息
```http
POST /functions/v1/user-profile
```

**请求体**:
```json
{
  "user_id": "user-uuid",
  "include_referrals": true
}
```

**响应**:
```json
{
  "user": {...},
  "referral_info": {
    "referral_code": "ABC123",
    "referral_link": "https://t.me/yourbot?start=ABC123",
    "total_referrals": 5,
    "total_rewards": 25.00,
    "referrals": [
      {
        "id": "referred-user-uuid",
        "username": "friend_user",
        "joined_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 8. 管理功能

#### 获取统计数据
```http
GET /functions/v1/admin-api?action=get_stats
```

**响应**:
```json
{
  "stats": {
    "total_users": 1250,
    "total_products": 45,
    "active_rounds": 23,
    "total_revenue": 125000.00,
    "today_revenue": 1250.00,
    "recent_transactions": [...]
  }
}
```

#### 添加产品
```http
POST /functions/v1/admin-api?action=add_product
```

**请求体**:
```json
{
  "name": {
    "en": "Product Name",
    "zh": "产品名称"
  },
  "description": {
    "en": "Product description",
    "zh": "产品描述"
  },
  "image_url": "https://example.com/image.jpg",
  "price": 99.99
}
```

### 9. 自动化功能

#### 自动开奖
```http
POST /functions/v1/auto-draw-lottery
```

**响应**:
```json
{
  "drawn_rounds": [
    {
      "round_id": "round-uuid",
      "winner_id": "winner-uuid",
      "winning_shares": 5,
      "prize_value": 500.00
    }
  ]
}
```

#### 通知获奖者
```http
POST /functions/v1/notify-winners
```

## 错误处理

### 错误响应格式

所有错误都遵循以下格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### 常见错误代码

| 代码 | HTTP状态码 | 说明 |
|------|-----------|------|
| `AUTH_REQUIRED` | 401 | 需要身份验证 |
| `INSUFFICIENT_BALANCE` | 400 | 余额不足 |
| `PRODUCT_NOT_FOUND` | 404 | 产品不存在 |
| `ROUND_NOT_ACTIVE` | 400 | 抽奖轮次未激活 |
| `INVALID_SHARES` | 400 | 无效的份额数量 |
| `RESALE_NOT_AVAILABLE` | 400 | 转售不可用 |
| `ALREADY_PARTICIPATED` | 400 | 已经参与过 |
| `RATE_LIMIT_EXCEEDED` | 429 | 超出速率限制 |

## 速率限制

- 每个用户每分钟最多100个请求
- 每个IP每分钟最多1000个请求
- 超限将返回429状态码

## SDK示例

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mftfgofnosakobjfpzss.supabase.co',
  'your-anon-key'
)

// 获取产品列表
const { data, error } = await supabase.functions.invoke('get-products', {
  body: { limit: 20, offset: 0 }
})

// 参与抽奖
const { data, error } = await supabase.functions.invoke('participate-lottery', {
  body: {
    product_id: 'product-uuid',
    round_id: 'round-uuid',
    shares: 5,
    user_id: 'user-uuid'
  }
})
```

### Python
```python
import requests

base_url = 'https://mftfgofnosakobjfpzss.supabase.co'
headers = {
    'Authorization': 'Bearer your-anon-key',
    'apikey': 'your-anon-key',
    'Content-Type': 'application/json'
}

# 获取产品列表
response = requests.post(
    f'{base_url}/functions/v1/get-products',
    headers=headers,
    json={'limit': 20}
)

if response.status_code == 200:
    products = response.json()
else:
    error = response.json()
```

### cURL
```bash
curl -X POST 'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "limit": 20,
    "offset": 0
  }'
```

## WebSocket连接

部分功能支持实时更新，通过WebSocket连接：

```javascript
const ws = new WebSocket('wss://mftfgofnosakobjfpzss.supabase.co/realtime/v1/websocket')

ws.onopen = () => {
  // 订阅产品更新
  ws.send(JSON.stringify({
    topic: 'lottery_rounds',
    event: 'phx_join',
    payload: {}
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // 处理实时更新
}
```

---

**注意**: 此API文档基于当前实现，具体的端点和参数可能会根据实际部署情况有所调整。建议在实际使用前先进行测试。