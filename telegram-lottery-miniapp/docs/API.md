# API文档

## 概述

本文档描述了Telegram MiniApp夺宝系统的所有API端点。

## 基础信息

- **Base URL**: `https://mftfgofnosakobjfpzss.supabase.co`
- **Edge Functions URL**: `https://mftfgofnosakobjfpzss.supabase.co/functions/v1`
- **认证方式**: Bearer Token（Supabase Anon Key）

## Edge Functions

### 1. Telegram用户认证

**端点**: `POST /functions/v1/telegram-auth`

**描述**: 验证Telegram用户并创建或更新用户记录

**请求体**:
```json
{
  "telegram_id": 123456789,
  "username": "john_doe",
  "full_name": "John Doe",
  "language": "en"
}
```

**响应**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "telegram_id": 123456789,
      "username": "john_doe",
      "full_name": "John Doe",
      "balance": 0,
      "language": "en",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "is_new": true
  }
}
```

**错误响应**:
```json
{
  "error": {
    "code": "TELEGRAM_AUTH_FAILED",
    "message": "Error description"
  }
}
```

---

### 2. 参与夺宝

**端点**: `POST /functions/v1/participate-lottery`

**描述**: 用户参与指定的夺宝轮次

**请求体**:
```json
{
  "user_id": "uuid",
  "lottery_round_id": "uuid",
  "shares_count": 5
}
```

**响应**:
```json
{
  "data": {
    "participation": {
      "id": "uuid",
      "user_id": "uuid",
      "lottery_round_id": "uuid",
      "shares_count": 5,
      "amount_paid": 50.00,
      "created_at": "2025-01-01T00:00:00Z"
    },
    "new_balance": 950.00,
    "lottery_round": {
      "id": "uuid",
      "sold_shares": 50,
      "status": "active"
    }
  }
}
```

**错误响应**:
```json
{
  "error": {
    "code": "PARTICIPATE_FAILED",
    "message": "Insufficient balance"
  }
}
```

**可能的错误**:
- `Lottery round not found`
- `Lottery round is not active`
- `Only X shares available`
- `Insufficient balance`

---

### 3. 获取商品列表

**端点**: `GET /functions/v1/get-products`

**描述**: 获取所有商品及其活跃的夺宝轮次

**查询参数**:
- `category` (可选): 商品分类
- `status` (可选): 商品状态（默认: active）

**示例**:
```
GET /functions/v1/get-products?category=electronics&status=active
```

**响应**:
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": {
          "zh": "iPhone 15 Pro Max",
          "en": "iPhone 15 Pro Max",
          "tg": "iPhone 15 Pro Max",
          "ru": "iPhone 15 Pro Max"
        },
        "description": {
          "zh": "最新款苹果旗舰手机",
          "en": "Latest Apple flagship smartphone"
        },
        "price": 999.99,
        "stock": 10,
        "category": "electronics",
        "image_url": "https://...",
        "status": "active",
        "active_rounds": [
          {
            "id": "uuid",
            "product_id": "uuid",
            "total_shares": 100,
            "sold_shares": 25,
            "price_per_share": 10.00,
            "status": "active",
            "draw_date": null,
            "winner_id": null
          }
        ]
      }
    ],
    "count": 3
  }
}
```

---

### 4. 获取用户信息

**端点**: `GET /functions/v1/user-profile`

**描述**: 获取用户详细信息和统计数据

**查询参数**:
- `user_id` (可选): 用户UUID
- `telegram_id` (可选): Telegram用户ID

**示例**:
```
GET /functions/v1/user-profile?user_id=uuid
```

**响应**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "telegram_id": 123456789,
      "username": "john_doe",
      "full_name": "John Doe",
      "balance": 1000.00,
      "language": "en"
    },
    "stats": {
      "total_participations": 15,
      "total_wins": 2,
      "total_spent": 500.00,
      "total_referrals": 5,
      "total_referral_rewards": 25.00
    },
    "recent_participations": [...],
    "wins": [...]
  }
}
```

---

## 直接数据库访问（REST API）

使用Supabase的自动生成REST API。

### 基础URL
```
https://mftfgofnosakobjfpzss.supabase.co/rest/v1
```

### 认证
```
Headers:
  apikey: YOUR_SUPABASE_ANON_KEY
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

### 示例查询

#### 获取所有商品
```bash
GET /rest/v1/products?select=*
```

#### 获取用户参与记录
```bash
GET /rest/v1/participations?user_id=eq.uuid&select=*,lottery_rounds(*)
```

#### 获取夺宝轮次详情
```bash
GET /rest/v1/lottery_rounds?id=eq.uuid&select=*,products(*)
```

#### 创建订单
```bash
POST /rest/v1/orders
Content-Type: application/json

{
  "user_id": "uuid",
  "total_amount": 100.00,
  "status": "pending",
  "payment_method": "card"
}
```

---

## 数据库函数

### 1. 更新用户余额

**函数**: `update_user_balance`

**描述**: 安全地更新用户余额并记录交易

**参数**:
```sql
SELECT update_user_balance(
  p_user_id := 'uuid',
  p_amount := 100.00,
  p_type := 'deposit',
  p_description := 'Top up balance',
  p_reference_id := NULL
);
```

**返回值**: `boolean` (成功/失败)

---

### 2. 自动开奖

**函数**: `draw_lottery`

**描述**: 为指定夺宝轮次随机选择中奖者

**参数**:
```sql
SELECT draw_lottery('lottery-round-uuid');
```

**返回值**: `uuid` (中奖者用户ID)

---

## 错误代码

| 错误码 | 描述 | 解决方法 |
|--------|------|----------|
| `TELEGRAM_AUTH_FAILED` | Telegram认证失败 | 检查用户数据是否完整 |
| `PARTICIPATE_FAILED` | 参与夺宝失败 | 检查余额和夺宝轮次状态 |
| `GET_PRODUCTS_FAILED` | 获取商品失败 | 检查数据库连接 |
| `GET_PROFILE_FAILED` | 获取用户信息失败 | 确认用户存在 |
| `INSUFFICIENT_BALANCE` | 余额不足 | 提示用户充值 |
| `INVALID_SHARES` | 无效的份数 | 检查份数范围 |

---

## 数据模型

### User（用户）
```typescript
{
  id: string (uuid)
  telegram_id: number (unique)
  username: string | null
  full_name: string | null
  balance: number (decimal)
  language: string
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### Product（商品）
```typescript
{
  id: string (uuid)
  name: Record<string, string> (jsonb)
  description: Record<string, string> (jsonb)
  price: number (decimal)
  stock: number
  category: string
  image_url: string
  status: string
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### LotteryRound（夺宝轮次）
```typescript
{
  id: string (uuid)
  product_id: string (uuid)
  total_shares: number
  sold_shares: number
  price_per_share: number (decimal)
  status: 'active' | 'ready_to_draw' | 'completed' | 'cancelled'
  draw_date: string | null (timestamp)
  winner_id: string | null (uuid)
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

### Participation（参与记录）
```typescript
{
  id: string (uuid)
  user_id: string (uuid)
  lottery_round_id: string (uuid)
  shares_count: number
  amount_paid: number (decimal)
  created_at: string (timestamp)
}
```

---

## 速率限制

目前未实施速率限制，但建议：
- 每个用户每分钟最多10次API调用
- 批量操作建议使用批处理接口

---

## WebSocket / Realtime

使用Supabase Realtime订阅数据变化：

```javascript
import { supabase } from './lib/supabase'

// 订阅夺宝轮次更新
const channel = supabase
  .channel('lottery-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'lottery_rounds'
    },
    (payload) => {
      console.log('Lottery updated:', payload)
    }
  )
  .subscribe()
```

---

## 测试端点

### 使用cURL

```bash
# 获取商品列表
curl -X GET \
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# 参与夺宝
curl -X POST \
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/participate-lottery' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "lottery_round_id": "uuid",
    "shares_count": 5
  }'
```

### 使用JavaScript

```javascript
// 获取商品
const response = await fetch(
  'https://mftfgofnosakobjfpzss.supabase.co/functions/v1/get-products',
  {
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY'
    }
  }
)
const data = await response.json()
```

---

## 版本历史

- **v1.0.0** (2025-01-01): 初始版本
  - 基础夺宝功能
  - 用户管理
  - 推荐系统

---

## 支持

如有问题，请：
1. 查看错误代码表
2. 检查请求格式
3. 查看Supabase日志
4. 提交GitHub Issue
