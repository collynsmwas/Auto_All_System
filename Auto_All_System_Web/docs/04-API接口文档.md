# API接口文档

## 📚 文档说明

本文档详细说明了Auto All System的所有API接口，包括请求参数、响应格式、权限要求、开发规范等。

**文档版本**: 1.1.0  
**最后更新**: 2026-01-19  
**API版本**: v1

---

## 🎯 快速导航

### 按模块查找
- [API开发规范](#api开发规范) - **必读** 路径规范、响应格式、常见问题
- [认证管理](#1-认证管理) - 登录、注册、Token刷新
- [用户管理](#2-用户管理) - 用户CRUD、权限管理
- [用户余额](#3-用户余额) - 余额查询、充值记录
- [专区管理](#4-专区管理) - 专区查询、配置获取
- [任务管理](#5-任务管理) - 任务创建、查询、取消
- [虚拟卡管理](#6-虚拟卡管理) - 虚拟卡CRUD、导入
- [支付管理](#7-支付管理) - 支付配置、卡密充值
- [订单管理](#8-订单管理) - 订单查询、取消、退款
- [管理后台](#9-管理后台) - 统计数据、仪表盘
- [比特浏览器API](#10-比特浏览器api集成) - 浏览器自动化、指纹管理
- [Google 业务插件](#11-google-业务插件-api) - Google账号、SheerID验证、自动绑卡

### 按HTTP方法查找
- **GET** - 查询数据（28个接口）
- **POST** - 创建数据（16个接口）
- **PUT** - 更新数据（3个接口）
- **DELETE** - 删除数据（3个接口）

---

## API开发规范

> **重要**: 统一前后端API调用标准，避免路径重复和格式不一致问题

### 核心规范

#### 1. API路径规范

**后端路径结构**:
```
/api/v1/                              # API根路径（Django urls.py配置）
├─ auth/                              # 认证
├─ users/                             # 用户
├─ zones/                             # 专区
├─ tasks/                             # 任务
├─ cards/                             # 虚拟卡
├─ payments/                          # 支付
├─ admin/                             # 管理后台
└─ plugins/                           # 插件
   ├─ /                               # GET 插件列表
   ├─ {name}/enable/                  # POST 启用插件
   └─ google-business/                # Google插件
      ├─ accounts/                    # 账号管理
      ├─ tasks/                       # 任务管理
      └─ cards/                       # 卡片管理
```

**前端API调用规范**（核心原则：前端API路径相对于 baseURL）:

```typescript
// ✅ 正确的配置
// request.ts
const service = axios.create({
  baseURL: '/api/v1',  // 统一baseURL
  timeout: 30000
})

// auth.ts
export function login(username: string, password: string) {
  return request({
    url: '/auth/login/',  // ✅ 相对路径，实际：/api/v1/auth/login/
    method: 'post',
    data: { username, password }
  })
}

// google_business.ts
export function getGoogleAccounts() {
  return request({
    url: '/plugins/google-business/accounts/',  // ✅ 实际：/api/v1/plugins/google-business/accounts/
    method: 'get'
  })
}
```

**❌ 错误示例（导致路径重复）**:
```typescript
// ❌ 错误：会导致 /api/v1/api/v1/plugins/...
export function getGoogleAccounts() {
  return request({
    url: '/api/v1/plugins/google-business/accounts/',  // ❌ 已包含baseURL
    method: 'get'
  })
}
```

#### 2. 响应格式规范

**Django REST Framework 标准格式**:

单个对象:
```json
{
  "id": 1,
  "name": "示例",
  "created_at": "2026-01-19T10:00:00Z"
}
```

列表（分页）:
```json
{
  "count": 100,
  "next": "http://api.example.com/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "用户1"
    }
  ]
}
```

**前端响应拦截器**（request.ts会自动解包）:
```typescript
// ✅ 正确：request.ts已解包，直接使用
const data = await getGoogleAccounts()
accounts.value = data  // 或 data.results（如果是分页）

// ❌ 错误：重复 .data
const response = await getGoogleAccounts()
accounts.value = response.data  // ❌ 多余的.data
```

#### 3. 常见问题

**Q1: API返回404**
- 检查后端URL是否正确配置
- 插件是否已启用
- 前端路径是否正确
- baseURL配置是否正确

**Q2: 路径重复 `/api/v1/api/v1/...`**
- 原因：前端API文件中使用了完整路径
- 解决：使用相对路径（不包含`/api/v1`）

**Q3: response.data undefined**
- 原因：request.ts已经解包
- 解决：直接使用返回值，不要再访问`.data`

---

## 🔐 认证机制

### JWT Token认证

所有需要认证的接口都使用JWT Token：

```typescript
// 请求头
headers: {
  'Authorization': 'Bearer <access_token>'
}
```

### Token刷新

Access Token过期后，使用Refresh Token获取新的Token：

```typescript
POST /api/v1/auth/refresh/
Body: {
  "refresh": "<refresh_token>"
}
```

### 权限级别

- **公开** - 无需认证
- **已认证** - 需要登录
- **管理员** - 需要管理员权限

---

## 📊 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "errors": { ... }
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1️⃣ 认证管理

### 1.1 用户注册

**接口**: `POST /auth/register/`  
**权限**: 公开  
**说明**: 注册新用户

**请求参数**:
```json
{
  "username": "string",      // 用户名（唯一）
  "email": "string",         // 邮箱（唯一）
  "password": "string",      // 密码（至少8位）
  "password2": "string",     // 确认密码
  "phone": "string"          // 手机号（可选）
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

**代码示例**:
```typescript
import { authApi } from '@/api/auth'

const result = await authApi.register({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  password2: 'password123'
})
```

---

### 1.2 用户登录

**接口**: `POST /auth/login/`  
**权限**: 公开  
**说明**: 用户登录获取Token

**请求参数**:
```json
{
  "username": "string",  // 用户名或邮箱
  "password": "string"   // 密码
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "is_superuser": false
    }
  }
}
```

**代码示例**:
```typescript
const result = await authApi.login('testuser', 'password123')
localStorage.setItem('access_token', result.access_token)
localStorage.setItem('refresh_token', result.refresh_token)
```

---

### 1.3 刷新Token

**接口**: `POST /auth/refresh/`  
**权限**: 公开  
**说明**: 使用Refresh Token获取新的Access Token

**请求参数**:
```json
{
  "refresh": "string"  // Refresh Token
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "access": "eyJ..."
  }
}
```

**代码示例**:
```typescript
const result = await authApi.refreshToken(refreshToken)
localStorage.setItem('access_token', result.access)
```

---

### 1.4 用户登出

**接口**: `POST /auth/logout/`  
**权限**: 已认证  
**说明**: 用户登出，使Token失效

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

**代码示例**:
```typescript
await authApi.logout()
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
```

---

## 2️⃣ 用户管理

### 2.1 获取用户列表

**接口**: `GET /users/`  
**权限**: 管理员  
**说明**: 获取所有用户列表（分页）

**查询参数**:
- `page` - 页码（默认1）
- `page_size` - 每页数量（默认10）
- `search` - 搜索关键词
- `is_active` - 是否激活

**响应示例**:
```json
{
  "count": 100,
  "next": "http://localhost/api/v1/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "phone": "13800138000",
      "role": "user",
      "is_active": true,
      "is_verified": false,
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const users = await usersApi.getUsers({ page: 1, page_size: 10 })
```

---

### 2.2 获取单个用户

**接口**: `GET /users/{id}/`  
**权限**: 管理员  
**说明**: 获取指定用户详情

**响应示例**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "phone": "13800138000",
  "role": "user",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:00:00Z",
  "last_login": "2026-01-16T12:00:00Z"
}
```

**代码示例**:
```typescript
const user = await usersApi.getUser(1)
```

---

### 2.3 获取当前用户

**接口**: `GET /users/me/`  
**权限**: 已认证  
**说明**: 获取当前登录用户信息

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "role": "user",
    "is_active": true,
    "is_verified": false,
    "balance": "1000.00",
    "created_at": "2026-01-16T12:00:00Z",
    "updated_at": "2026-01-16T12:00:00Z",
    "last_login": "2026-01-16T12:00:00Z"
  }
}
```

**代码示例**:
```typescript
const currentUser = await usersApi.getCurrentUser()
```

---

### 2.4 创建用户

**接口**: `POST /users/`  
**权限**: 管理员  
**说明**: 创建新用户

**请求参数**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "is_active": true
}
```

**代码示例**:
```typescript
const user = await usersApi.createUser({
  username: 'newuser',
  email: 'new@example.com',
  password: 'password123'
})
```

---

### 2.5 更新用户

**接口**: `PUT /users/{id}/`  
**权限**: 管理员  
**说明**: 更新用户信息

**请求参数**:
```json
{
  "email": "string",
  "phone": "string",
  "is_active": true
}
```

**代码示例**:
```typescript
await usersApi.updateUser(1, {
  email: 'updated@example.com',
  is_active: false
})
```

---

### 2.6 更新个人资料

**接口**: `PUT /users/update_profile/`  
**权限**: 已认证  
**说明**: 更新当前用户个人资料

**请求参数**:
```json
{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "avatar": "string"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "first_name": "张",
    "last_name": "三",
    "phone": "13800138000"
  }
}
```

**代码示例**:
```typescript
await usersApi.updateProfile({
  first_name: '张',
  last_name: '三',
  phone: '13800138000'
})
```

---

### 2.7 删除用户

**接口**: `DELETE /users/{id}/`  
**权限**: 管理员  
**说明**: 删除用户（软删除）

**代码示例**:
```typescript
await usersApi.deleteUser(1)
```

---

### 2.8 重置密码

**接口**: `POST /users/{id}/reset_password/`  
**权限**: 管理员  
**说明**: 管理员重置用户密码

**请求参数**:
```json
{
  "password": "string"  // 新密码
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "密码重置成功"
}
```

**代码示例**:
```typescript
await usersApi.resetPassword(1, 'newpassword123')
```

---

## 3️⃣ 用户余额

### 3.1 获取余额列表

**接口**: `GET /balance/`  
**权限**: 管理员  
**说明**: 获取所有用户余额（管理员）

**响应示例**:
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "user": 1,
      "balance": "1000.00",
      "frozen_amount": "100.00",
      "currency": "CNY",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

---

### 3.2 获取我的余额

**接口**: `GET /balance/my_balance/`  
**权限**: 已认证  
**说明**: 获取当前用户余额信息

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "user": 1,
    "balance": "1000.00",
    "frozen_amount": "100.00",
    "currency": "CNY",
    "available_balance": "900.00",
    "created_at": "2026-01-16T12:00:00Z",
    "updated_at": "2026-01-16T12:00:00Z"
  }
}
```

**代码示例**:
```typescript
const balance = await balanceApi.getMyBalance()
```

---

### 3.3 充值

**接口**: `POST /balance/recharge/`  
**权限**: 已认证  
**说明**: 用户充值（演示用，实际需要集成支付网关）

**请求参数**:
```json
{
  "amount": "100.00",
  "payment_method": "alipay"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "充值成功",
  "data": {
    "amount": 100.00,
    "new_balance": 1100.00
  }
}
```

**代码示例**:
```typescript
await balanceApi.recharge({
  amount: "100.00",
  payment_method: "alipay"
})
```

---

### 3.4 获取余额日志

**接口**: `GET /balance/logs/`  
**权限**: 已认证  
**说明**: 获取余额变动记录

**查询参数**:
- `page` - 页码
- `page_size` - 每页数量
- `type` - 变动类型（recharge/consume/refund/freeze/unfreeze）

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "user": 1,
      "amount": "100.00",
      "balance_before": "900.00",
      "balance_after": "1000.00",
      "type": "recharge",
      "description": "充值-alipay",
      "related_order_id": null,
      "created_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const logs = await balanceApi.getBalanceLogs({ page: 1 })
```

---

## 4️⃣ 专区管理

### 4.1 获取专区列表

**接口**: `GET /zones/`  
**权限**: 已认证  
**说明**: 获取所有启用的专区

**查询参数**:
- `page` - 页码（默认1）
- `page_size` - 每页数量（默认10）

**响应示例**:
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "Google注册专区",
      "code": "google_register",
      "description": "自动注册Google账号",
      "icon": "🔍",
      "plugin_class": "apps.plugins.google_business.GooglePlugin",
      "is_active": true,
      "sort_order": 1,
      "price_per_task": "10.00",
      "metadata": {
        "features": ["自动验证", "邮箱激活", "批量处理"],
        "supported_task_types": ["google_register", "google_verify"]
      },
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const zones = await zonesApi.getZones()
```

---

### 4.2 获取专区详情

**接口**: `GET /zones/{id}/`  
**权限**: 已认证  
**说明**: 获取专区详细信息

**响应示例**:
```json
{
  "id": 1,
  "name": "Google注册专区",
  "code": "google_register",
  "description": "自动注册Google账号，支持批量处理和自动验证",
  "icon": "🔍",
  "plugin_class": "apps.plugins.google_business.GooglePlugin",
  "is_active": true,
  "sort_order": 1,
  "price_per_task": "10.00",
  "metadata": {
    "features": ["自动验证", "邮箱激活", "批量处理"],
    "supported_task_types": ["google_register", "google_verify"],
    "max_tasks_per_batch": 100,
    "required_fields": ["proxy", "phone"],
    "optional_fields": ["recovery_email"]
  },
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:00:00Z"
}
```

**代码示例**:
```typescript
const zone = await zonesApi.getZone(1)
```

---

### 4.3 创建专区

**接口**: `POST /zones/`  
**权限**: 管理员  
**说明**: 创建新专区

**请求参数**:
```json
{
  "name": "新专区",
  "code": "new_zone",
  "description": "专区描述",
  "icon": "🎯",
  "plugin_class": "apps.plugins.new_zone.NewZonePlugin",
  "price_per_task": "20.00",
  "sort_order": 10,
  "metadata": {
    "features": ["功能1", "功能2"]
  }
}
```

**代码示例**:
```typescript
const zone = await zonesApi.createZone({
  name: "新专区",
  code: "new_zone",
  plugin_class: "apps.plugins.new_zone.NewZonePlugin"
})
```

---

### 4.4 更新专区

**接口**: `PUT /zones/{id}/`  
**权限**: 管理员  
**说明**: 更新专区信息

**请求参数**:
```json
{
  "name": "更新的专区名称",
  "description": "更新的描述",
  "price_per_task": "15.00",
  "is_active": false
}
```

**代码示例**:
```typescript
await zonesApi.updateZone(1, {
  name: "更新的专区名称",
  price_per_task: "15.00"
})
```

---

### 4.5 删除专区

**接口**: `DELETE /zones/{id}/`  
**权限**: 管理员  
**说明**: 删除专区

**代码示例**:
```typescript
await zonesApi.deleteZone(1)
```

---

### 4.6 获取专区配置

**接口**: `GET /zones/{id}/config/`  
**权限**: 已认证  
**说明**: 获取专区配置项（敏感配置仅管理员可见）

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "zone": 1,
      "config_key": "max_concurrent_tasks",
      "config_value": "10",
      "value_type": "number",
      "description": "最大并发任务数",
      "is_secret": false,
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    },
    {
      "id": 2,
      "zone": 1,
      "config_key": "api_settings",
      "config_value": "{\"timeout\": 30, \"retries\": 3}",
      "value_type": "json",
      "description": "API配置",
      "is_secret": false,
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const config = await zonesApi.getZoneConfig(1)
```

---

### 4.7 获取用户专区权限列表

**接口**: `GET /zones/access/`  
**权限**: 已认证  
**说明**: 获取用户专区权限（用户只能看自己的，管理员看所有）

**查询参数**:
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": 1,
      "zone": 1,
      "zone_info": {
        "id": 1,
        "name": "Google注册专区",
        "code": "google_register",
        "icon": "🔍"
      },
      "is_enabled": true,
      "quota_limit": 100,
      "quota_used": 25,
      "expires_at": "2026-12-31T23:59:59Z",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const accesses = await zonesApi.getUserZoneAccesses()
```

---

### 4.8 获取我的专区

**接口**: `GET /zones/access/my_zones/`  
**权限**: 已认证  
**说明**: 获取当前用户有权访问的专区

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "user": 1,
      "zone": 1,
      "zone_info": {
        "id": 1,
        "name": "Google注册专区",
        "code": "google_register",
        "description": "自动注册Google账号",
        "icon": "🔍",
        "price_per_task": "10.00"
      },
      "is_enabled": true,
      "quota_limit": 100,
      "quota_used": 25,
      "expires_at": "2026-12-31T23:59:59Z",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const myZones = await zonesApi.getMyZones()
```

---

### 4.9 创建用户专区权限

**接口**: `POST /zones/access/`  
**权限**: 管理员  
**说明**: 为用户授予专区访问权限

**请求参数**:
```json
{
  "user": 1,
  "zone": 1,
  "quota_limit": 100,
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**代码示例**:
```typescript
await zonesApi.createUserZoneAccess({
  user: 1,
  zone: 1,
  quota_limit: 100
})
```

---

### 4.10 更新用户专区权限

**接口**: `PUT /zones/access/{id}/`  
**权限**: 管理员  
**说明**: 更新用户专区权限

**请求参数**:
```json
{
  "quota_limit": 200,
  "is_enabled": false
}
```

**代码示例**:
```typescript
await zonesApi.updateUserZoneAccess(1, {
  quota_limit: 200,
  is_enabled: false
})
```

---

### 4.11 删除用户专区权限

**接口**: `DELETE /zones/access/{id}/`  
**权限**: 管理员  
**说明**: 删除用户专区权限

**代码示例**:
```typescript
await zonesApi.deleteUserZoneAccess(1)
```

---

## 5️⃣ 任务管理

### 5.1 获取任务列表

**接口**: `GET /tasks/`  
**权限**: 已认证  
**说明**: 获取任务列表（用户只能看自己的任务，管理员看所有任务）

**查询参数**:
- `page` - 页码（默认1）
- `page_size` - 每页数量（默认10）
- `status` - 任务状态（pending/running/success/failed/cancelled）
- `zone` - 专区ID
- `task_type` - 任务类型
- `ordering` - 排序字段（created_at/-created_at, priority/-priority）

**响应示例**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "user": 1,
      "zone": 1,
      "zone_info": {
        "id": 1,
        "name": "Google注册专区",
        "code": "google_register"
      },
      "task_type": "google_register",
      "status": "success",
      "status_display": "成功",
      "priority": "normal",
      "priority_display": "普通",
      "progress": 100,
      "input_data": {
        "count": 10,
        "use_proxy": true
      },
      "output_data": {
        "success_count": 9,
        "failed_count": 1,
        "accounts": [...]
      },
      "error_message": null,
      "cost_amount": "90.00",
      "celery_task_id": "celery-task-uuid-123",
      "duration": 600.5,
      "start_time": "2026-01-16T12:00:00Z",
      "end_time": "2026-01-16T12:10:00Z",
      "metadata": {},
      "created_at": "2026-01-16T11:59:00Z",
      "updated_at": "2026-01-16T12:10:05Z"
    }
  ]
}
```

**代码示例**:
```typescript
const tasks = await tasksApi.getTasks({ 
  status: 'running',
  zone: 1,
  ordering: '-created_at'
})
```

---

### 5.2 创建任务

**接口**: `POST /tasks/`  
**权限**: 已认证  
**说明**: 创建新任务

**请求参数**:
```json
{
  "zone": 1,
  "task_type": "google_register",
  "input_data": {
    "count": 10,
    "use_proxy": true,
    "proxy_type": "socks5",
    "delay_range": [5, 10]
  },
  "priority": "normal"
}
```

**响应示例**:
```json
{
  "id": 1,
  "user": 1,
  "zone": 1,
  "zone_info": {
    "id": 1,
    "name": "Google注册专区",
    "code": "google_register"
  },
  "task_type": "google_register",
  "status": "pending",
  "status_display": "待处理",
  "priority": "normal",
  "priority_display": "普通",
  "progress": 0,
  "input_data": {
    "count": 10,
    "use_proxy": true,
    "proxy_type": "socks5",
    "delay_range": [5, 10]
  },
  "output_data": {},
  "error_message": null,
  "cost_amount": "0.00",
  "celery_task_id": "",
  "duration": null,
  "start_time": null,
  "end_time": null,
  "metadata": {},
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:00:00Z"
}
```

**代码示例**:
```typescript
const task = await tasksApi.createTask({
  zone: 1,
  task_type: 'google_register',
  input_data: { 
    count: 10,
    use_proxy: true
  }
})
```

---

### 5.3 获取任务详情

**接口**: `GET /tasks/{id}/`  
**权限**: 已认证  
**说明**: 获取任务详情

**响应示例**:
```json
{
  "id": 1,
  "user": 1,
  "zone": 1,
  "zone_info": {
    "id": 1,
    "name": "Google注册专区",
    "code": "google_register",
    "description": "自动注册Google账号",
    "price_per_task": "10.00"
  },
  "task_type": "google_register",
  "status": "running",
  "status_display": "执行中",
  "priority": "high",
  "priority_display": "高",
  "progress": 60,
  "input_data": {
    "count": 10,
    "use_proxy": true,
    "proxy_type": "socks5"
  },
  "output_data": {
    "processed": 6,
    "success_count": 5,
    "failed_count": 1,
    "current_step": "验证邮箱"
  },
  "error_message": null,
  "cost_amount": "60.00",
  "celery_task_id": "celery-task-uuid-123",
  "duration": 300.5,
  "start_time": "2026-01-16T12:00:00Z",
  "end_time": null,
  "metadata": {
    "batch_id": "batch_20260116_001"
  },
  "created_at": "2026-01-16T11:59:00Z",
  "updated_at": "2026-01-16T12:05:00Z"
}
```

**代码示例**:
```typescript
const task = await tasksApi.getTask(1)
```

---

### 5.4 更新任务

**接口**: `PUT /tasks/{id}/`  
**权限**: 已认证（仅能修改自己的任务，管理员可修改所有任务）  
**说明**: 更新任务信息（通常由系统后台使用，用户一般只能取消）

**请求参数**:
```json
{
  "priority": "urgent",
  "metadata": {
    "notes": "紧急处理"
  }
}
```

**代码示例**:
```typescript
await tasksApi.updateTask(1, {
  priority: 'urgent'
})
```

---

### 5.5 删除任务

**接口**: `DELETE /tasks/{id}/`  
**权限**: 已认证（仅能删除自己的任务，管理员可删除所有任务）  
**说明**: 删除任务记录

**代码示例**:
```typescript
await tasksApi.deleteTask(1)
```

---

### 5.6 取消任务

**接口**: `POST /tasks/{id}/cancel/`  
**权限**: 已认证  
**说明**: 取消正在执行或待处理的任务

**响应示例**:
```json
{
  "code": 200,
  "message": "任务已取消",
  "data": {
    "id": 1,
    "status": "cancelled",
    "status_display": "已取消",
    "progress": 45,
    "updated_at": "2026-01-16T12:05:30Z"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "任务已完成，无法取消"
}
```

**代码示例**:
```typescript
await tasksApi.cancelTask(1)
```

---

### 5.7 获取任务日志

**接口**: `GET /tasks/{id}/logs/`  
**权限**: 已认证  
**说明**: 获取任务执行日志

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "task": 1,
      "level": "info",
      "level_display": "信息",
      "message": "任务开始执行，准备注册10个Google账号",
      "step": "init",
      "extra_data": {
        "config": {
          "count": 10,
          "use_proxy": true
        }
      },
      "created_at": "2026-01-16T12:00:01Z"
    },
    {
      "id": 2,
      "task": 1,
      "level": "info",
      "level_display": "信息",
      "message": "开始处理第1个账号",
      "step": "account_1",
      "extra_data": {
        "account_index": 1
      },
      "created_at": "2026-01-16T12:00:05Z"
    },
    {
      "id": 3,
      "task": 1,
      "level": "warning",
      "level_display": "警告",
      "message": "账号验证失败，正在重试",
      "step": "verify",
      "extra_data": {
        "retry_count": 1,
        "error": "验证码错误"
      },
      "created_at": "2026-01-16T12:01:20Z"
    }
  ]
}
```

**代码示例**:
```typescript
const logs = await tasksApi.getTaskLogs(1)
```

---

### 5.8 获取任务统计

**接口**: `GET /tasks/statistics/`  
**权限**: 已认证  
**说明**: 获取任务统计数据

**查询参数**:
- `zone` - 专区ID（筛选特定专区）
- `period_type` - 统计周期（daily/weekly/monthly）
- `limit` - 限制返回数量（默认30）

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "zone": 1,
      "zone_info": {
        "id": 1,
        "name": "Google注册专区",
        "code": "google_register"
      },
      "date": "2026-01-16",
      "period_type": "daily",
      "total_tasks": 25,
      "success_tasks": 20,
      "failed_tasks": 5,
      "total_cost": "250.00",
      "avg_duration": 480.5,
      "success_rate": 80.0,
      "created_at": "2026-01-16T23:59:59Z",
      "updated_at": "2026-01-16T23:59:59Z"
    },
    {
      "id": 2,
      "zone": 1,
      "zone_info": {
        "id": 1,
        "name": "Google注册专区",
        "code": "google_register"
      },
      "date": "2026-01-15",
      "period_type": "daily",
      "total_tasks": 18,
      "success_tasks": 16,
      "failed_tasks": 2,
      "total_cost": "180.00",
      "avg_duration": 420.3,
      "success_rate": 88.89,
      "created_at": "2026-01-15T23:59:59Z",
      "updated_at": "2026-01-15T23:59:59Z"
    }
  ]
}
```

**代码示例**:
```typescript
// 获取指定专区的统计数据
const stats = await tasksApi.getStatistics({ 
  zone: 1, 
  period_type: 'daily' 
})

// 获取所有专区的月度统计
const monthlyStats = await tasksApi.getStatistics({
  period_type: 'monthly'
})
```

---

## 6️⃣ 虚拟卡管理

### 6.1 获取虚拟卡列表

**接口**: `GET /cards/`  
**权限**: 已认证  
**说明**: 获取虚拟卡列表（权限控制：管理员看所有，用户看公共卡+自己的私有卡）

**查询参数**:
- `status` - 状态（available/in_use/used/invalid/expired）
- `pool_type` - 卡池类型（public/private）
- `owner_user` - 所有者ID
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "masked_card_number": "****1111",
      "card_holder": "John Doe",
      "expiry_month": 12,
      "expiry_year": 2025,
      "card_type": "visa",
      "bank_name": "Chase Bank",
      "balance": "100.00",
      "pool_type": "public",
      "pool_type_display": "公共卡池",
      "owner_user": null,
      "owner_user_name": null,
      "status": "available",
      "status_display": "可用",
      "use_count": 0,
      "success_count": 0,
      "success_rate": 0.0,
      "max_use_count": 1,
      "is_available": true,
      "remaining_usage": 1,
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z",
      "last_used_at": null
    }
  ]
}
```

---

### 6.2 创建虚拟卡

**接口**: `POST /cards/`  
**权限**: 已认证  
**说明**: 创建新虚拟卡（私有卡自动归属当前用户）

**请求参数**:
```json
{
  "card_number": "4111111111111111",
  "card_holder": "John Doe",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cvv": "123",
  "card_type": "visa",
  "bank_name": "Chase Bank",
  "balance": "100.00",
  "pool_type": "private",
  "max_use_count": 1,
  "notes": "测试卡片"
}
```

**代码示例**:
```typescript
const card = await cardsApi.createCard({
  card_number: '4111111111111111',
  cvv: '123',
  expiry_month: 12,
  expiry_year: 2025,
  pool_type: 'private'
})
```

---

### 6.3 批量导入虚拟卡

**接口**: `POST /cards/import_cards/`  
**权限**: 已认证  
**说明**: 批量导入虚拟卡

**请求参数**:
```json
{
  "pool_type": "public",
  "cards_data": [
    {
      "card_number": "4111111111111111",
      "card_holder": "John Doe",
      "expiry_month": 12,
      "expiry_year": 2025,
      "cvv": "123",
      "card_type": "visa",
      "bank_name": "Chase Bank",
      "balance": "100.00",
      "notes": "测试卡片"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "导入完成",
  "data": {
    "success": 10,
    "failed": 0,
    "total": 10,
    "errors": []
  }
}
```

**代码示例**:
```typescript
await cardsApi.importCards({
  pool_type: 'public',
  cards_data: [
    { 
      card_number: '4111111111111111', 
      cvv: '123', 
      expiry_month: 12,
      expiry_year: 2025 
    }
  ]
})
```

---

### 6.4 获取可用虚拟卡

**接口**: `GET /cards/available/`  
**权限**: 已认证  
**说明**: 获取可用的虚拟卡列表

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "masked_card_number": "****1111",
      "card_type": "visa",
      "balance": "100.00",
      "expiry_month": 12,
      "expiry_year": 2025,
      "pool_type": "public",
      "status": "available"
    }
  ]
}
```

**代码示例**:
```typescript
const availableCards = await cardsApi.getAvailableCards()
```

---

### 6.5 获取我的虚拟卡

**接口**: `GET /cards/my_cards/`  
**权限**: 已认证  
**说明**: 获取当前用户的私有虚拟卡

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "cards": [
      {
        "id": 1,
        "masked_card_number": "****1111",
        "card_type": "visa",
        "expiry_month": 12,
        "expiry_year": 2025,
        "status": "available",
        "use_count": 0,
        "success_count": 0,
        "created_at": "2026-01-16T12:00:00Z"
      }
    ],
    "statistics": {
      "total": 10,
      "available": 8,
      "used": 2
    }
  }
}
```

**代码示例**:
```typescript
const myCards = await cardsApi.getMyCards()
```

---

### 6.6 更新虚拟卡

**接口**: `PUT /cards/{id}/`  
**权限**: 已认证（仅能修改自己的私有卡或管理员修改所有卡）  
**说明**: 更新虚拟卡信息

**请求参数**:
```json
{
  "status": "invalid",
  "notes": "卡片失效",
  "max_use_count": 0
}
```

---

### 6.7 删除虚拟卡

**接口**: `DELETE /cards/{id}/`  
**权限**: 已认证（仅能删除自己的私有卡或管理员删除所有卡）  
**说明**: 删除虚拟卡

---

### 6.8 获取卡使用记录

**接口**: `GET /cards/usage-logs/`  
**权限**: 已认证  
**说明**: 获取虚拟卡使用记录（用户只能看自己的记录）

**查询参数**:
- `card` - 卡片ID
- `success` - 是否成功（true/false）
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "card": 1,
      "user": 1,
      "task": 123,
      "purpose": "Google订阅",
      "success": true,
      "error_message": "",
      "transaction_id": "txn_abc123",
      "amount": "20.00",
      "currency": "CNY",
      "extra_data": {},
      "created_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const logs = await cardsApi.getUsageLogs({ card: 1, success: true })
```

---

### 6.9 获取卡使用记录详情

**接口**: `GET /cards/usage-logs/{id}/`  
**权限**: 已认证  
**说明**: 获取单条卡使用记录详情

**响应示例**:
```json
{
  "id": 1,
  "card": {
    "id": 1,
    "masked_card_number": "****1111",
    "card_type": "visa"
  },
  "user": 1,
  "task": 123,
  "purpose": "Google订阅",
  "success": true,
  "error_message": "",
  "transaction_id": "txn_abc123",
  "amount": "20.00",
  "currency": "CNY",
  "extra_data": {
    "screenshot": "base64...",
    "response_data": {}
  },
  "created_at": "2026-01-16T12:00:00Z"
}
```

---

## 7️⃣ 支付管理

### 7.1 获取启用的支付方式

**接口**: `GET /payments/payment-configs/enabled/`  
**权限**: 公开  
**说明**: 获取当前启用的支付方式

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "gateway": "alipay",
      "name": "支付宝",
      "icon": "alipay.png",
      "min_amount": "1.00",
      "max_amount": "10000.00"
    },
    {
      "gateway": "wechat",
      "name": "微信支付",
      "icon": "wechat.png",
      "min_amount": "1.00",
      "max_amount": "10000.00"
    },
    {
      "gateway": "card_code",
      "name": "卡密充值",
      "icon": "card.png",
      "min_amount": "1.00",
      "max_amount": "99999.00"
    }
  ]
}
```

**代码示例**:
```typescript
const paymentMethods = await paymentsApi.getEnabledPaymentMethods()
```

---

### 7.2 使用卡密充值

**接口**: `POST /payments/card-recharge/use/`  
**权限**: 已认证  
**说明**: 使用充值卡密进行充值

**请求参数**:
```json
{
  "card_code": "ABCD-1234-EFGH-5678"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "充值成功！到账 ¥100.00",
  "data": {
    "amount": 100.00,
    "new_balance": 1100.00,
    "card_code": "ABCD-1234-EFGH-5678"
  }
}
```

**错误响应**:
```json
{
  "code": 404,
  "message": "卡密不存在或已失效"
}
```

```json
{
  "code": 400,
  "message": "卡密已过期"
}
```

**代码示例**:
```typescript
await paymentsApi.useRechargeCard('ABCD-1234-EFGH-5678')
```

---

### 7.3 获取支付配置列表

**接口**: `GET /payments/payment-configs/`  
**权限**: 管理员  
**说明**: 获取所有支付配置

**查询参数**:
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "gateway": "alipay",
      "name": "支付宝",
      "is_enabled": true,
      "sort_order": 1,
      "icon": "alipay.png",
      "fee_rate": "0.0060",
      "min_amount": "1.00",
      "max_amount": "10000.00",
      "description": "支付宝扫码支付",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const configs = await paymentsApi.getPaymentConfigs()
```

---

### 7.4 创建支付配置

**接口**: `POST /payments/payment-configs/`  
**权限**: 管理员  
**说明**: 创建新的支付配置

**请求参数**:
```json
{
  "gateway": "stripe",
  "name": "Stripe支付",
  "is_enabled": true,
  "sort_order": 10,
  "icon": "stripe.png",
  "fee_rate": "0.0290",
  "min_amount": "1.00",
  "max_amount": "50000.00",
  "description": "国际信用卡支付"
}
```

**代码示例**:
```typescript
const config = await paymentsApi.createPaymentConfig({
  gateway: "stripe",
  name: "Stripe支付",
  fee_rate: "0.0290"
})
```

---

### 7.5 更新支付配置

**接口**: `PUT /payments/payment-configs/{id}/`  
**权限**: 管理员  
**说明**: 更新支付配置

**请求参数**:
```json
{
  "is_enabled": false,
  "fee_rate": "0.0050",
  "max_amount": "20000.00"
}
```

**代码示例**:
```typescript
await paymentsApi.updatePaymentConfig(1, {
  is_enabled: false,
  fee_rate: "0.0050"
})
```

---

### 7.6 删除支付配置

**接口**: `DELETE /payments/payment-configs/{id}/`  
**权限**: 管理员  
**说明**: 删除支付配置

**代码示例**:
```typescript
await paymentsApi.deletePaymentConfig(1)
```

---

### 7.7 获取充值卡密列表

**接口**: `GET /payments/recharge-cards/`  
**权限**: 管理员  
**说明**: 获取充值卡密列表

**查询参数**:
- `page` - 页码
- `page_size` - 每页数量  
- `status` - 状态筛选（unused/used/expired/disabled）
- `amount` - 面值筛选
- `batch_no` - 批次号筛选

**响应示例**:
```json
{
  "count": 1000,
  "results": [
    {
      "id": 1,
      "card_code": "ABCD-1234-EFGH-5678",
      "amount": "100.00",
      "status": "unused",
      "batch_no": "batch_202601161200",
      "expires_at": "2026-12-31T23:59:59Z",
      "used_by": null,
      "used_by_username": null,
      "used_at": null,
      "created_by": 1,
      "created_by_username": "admin",
      "notes": "测试批次",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const cards = await paymentsApi.getRechargeCards({
  status: 'unused',
  amount: '100.00'
})
```

---

### 7.8 批量生成卡密

**接口**: `POST /payments/recharge-cards/batch_create/`  
**权限**: 管理员  
**说明**: 批量生成充值卡密

**请求参数**:
```json
{
  "count": 100,
  "amount": "50.00",
  "expires_days": 365,
  "notes": "50元面值卡密",
  "prefix": "VIP"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "成功生成 100 张卡密",
  "data": {
    "count": 100,
    "batch_no": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 50.0,
    "expires_at": "2027-01-16T12:00:00Z"
  }
}
```

**代码示例**:
```typescript
await paymentsApi.batchCreateRechargeCards({
  count: 100,
  amount: "50.00",
  expires_days: 365,
  prefix: "VIP"
})
```

---

### 7.9 导出批次卡密

**接口**: `GET /payments/recharge-cards/export_batch/?batch_no={batch_no}`  
**权限**: 管理员  
**说明**: 导出指定批次的卡密

**查询参数**:
- `batch_no` - 批次号（必需）

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "card_code": "VIP-ABCD-1234-EFGH",
      "amount": "50.00",
      "status": "unused",
      "batch_no": "550e8400-e29b-41d4-a716-446655440000",
      "expires_at": "2027-01-16T12:00:00Z",
      "used_by": null,
      "used_by_username": null,
      "created_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

**代码示例**:
```typescript
const cards = await paymentsApi.exportBatchCards('550e8400-e29b-41d4-a716-446655440000')
```

---

### 7.10 批量导出卡密

**接口**: `GET /payments/recharge-cards/export_filtered/`  
**权限**: 管理员  
**说明**: 根据筛选条件批量导出卡密（最多10000张）

**查询参数**:
- `status` - 状态筛选
- `amount` - 面值筛选  
- `batch_no` - 批次号筛选

**响应示例**:
```json
{
  "code": 200,
  "message": "成功导出 500 张卡密",
  "data": {
    "count": 500,
    "cards": [
      {
        "id": 1,
        "card_code": "ABCD-1234-EFGH-5678",
        "amount": "100.00",
        "status": "unused",
        "batch_no": "batch_202601161200",
        "expires_at": "2026-12-31T23:59:59Z",
        "created_at": "2026-01-16T12:00:00Z",
        "notes": "测试批次"
      }
    ]
  }
}
```

**代码示例**:
```typescript
const exportData = await paymentsApi.exportFilteredCards({
  status: 'unused',
  amount: '100.00'
})
```

---

### 7.11 创建单个卡密

**接口**: `POST /payments/recharge-cards/`  
**权限**: 管理员  
**说明**: 创建单个充值卡密

**请求参数**:
```json
{
  "card_code": "CUSTOM-ABCD-1234",
  "amount": "200.00",
  "expires_at": "2026-12-31T23:59:59Z",
  "notes": "自定义卡密"
}
```

---

### 7.12 更新卡密

**接口**: `PUT /payments/recharge-cards/{id}/`  
**权限**: 管理员  
**说明**: 更新卡密信息

**请求参数**:
```json
{
  "status": "disabled",
  "notes": "停用此卡密",
  "expires_at": "2026-06-30T23:59:59Z"
}
```

---

### 7.13 删除卡密

**接口**: `DELETE /payments/recharge-cards/{id}/`  
**权限**: 管理员  
**说明**: 删除卡密记录

**代码示例**:
```typescript
await paymentsApi.deleteRechargeCard(1)
```

---

### 7.14 获取支付记录列表

**接口**: `GET /payments/`  
**权限**: 已认证  
**说明**: 获取支付记录列表（用户只能看自己的，管理员看所有）

**查询参数**:
- `page` - 页码
- `page_size` - 每页数量
- `status` - 支付状态（pending/processing/success/failed/cancelled/refunded）
- `gateway` - 支付网关（alipay/wechat/stripe/paypal/card_code）
- `ordering` - 排序字段

**响应示例**:
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "payment_no": "PAY202601161200001",
      "order_id": 1,
      "user": 1,
      "gateway": "alipay",
      "transaction_id": "2026011612001234567890123",
      "amount": "100.00",
      "currency": "CNY",
      "status": "success",
      "pay_url": null,
      "paid_at": "2026-01-16T12:01:00Z",
      "expired_at": "2026-01-16T12:30:00Z",
      "created_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

---

### 7.15 获取支付记录详情

**接口**: `GET /payments/{id}/`  
**权限**: 已认证  
**说明**: 获取支付记录详情

**响应示例**:
```json
{
  "id": 1,
  "payment_no": "PAY202601161200001",
  "order": {
    "id": 1,
    "order_no": "ORD202601161200001",
    "amount": "100.00"
  },
  "user": 1,
  "gateway": "alipay",
  "transaction_id": "2026011612001234567890123",
  "amount": "100.00",
  "currency": "CNY",
  "status": "success",
  "pay_url": null,
  "qr_code": null,
  "notify_data": {
    "trade_status": "TRADE_SUCCESS",
    "total_amount": "100.00"
  },
  "paid_at": "2026-01-16T12:01:00Z",
  "expired_at": "2026-01-16T12:30:00Z",
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:01:05Z"
}
```

---

### 7.16 创建支付记录

**接口**: `POST /payments/`  
**权限**: 已认证  
**说明**: 创建支付记录

**请求参数**:
```json
{
  "order_id": 1,
  "gateway": "alipay",
  "amount": "100.00",
  "currency": "CNY"
}
```

---

### 7.17 获取支付日志

**接口**: `GET /payments/{payment_id}/logs/`  
**权限**: 已认证（管理员可查看所有，用户只能看自己的）  
**说明**: 获取支付过程日志

**响应示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "payment": 1,
      "log_type": "create",
      "message": "创建支付记录",
      "request_data": {
        "order_id": 1,
        "gateway": "alipay",
        "amount": "100.00"
      },
      "response_data": {
        "payment_no": "PAY202601161200001"
      },
      "created_at": "2026-01-16T12:00:00Z"
    },
    {
      "id": 2,
      "payment": 1,
      "log_type": "notify",
      "message": "收到支付宝回调通知",
      "request_data": {
        "trade_status": "TRADE_SUCCESS"
      },
      "response_data": {
        "result": "success"
      },
      "created_at": "2026-01-16T12:01:00Z"
    }
  ]
}
```

---

## 8️⃣ 订单管理

### 8.1 获取订单列表

**接口**: `GET /payments/orders/`  
**权限**: 已认证  
**说明**: 获取订单列表（用户只能看自己的订单，管理员可查看所有）

**查询参数**:
- `page` - 页码（默认1）
- `page_size` - 每页数量（默认10）
- `status` - 订单状态（pending/paid/processing/completed/cancelled/refunded）
- `order_type` - 订单类型（recharge/service_purchase/vip）
- `ordering` - 排序字段（created_at/-created_at）

**响应示例**:
```json
{
  "count": 30,
  "results": [
    {
      "id": 1,
      "order_no": "ORD202601161200001",
      "user": 1,
      "user_info": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
      },
      "amount": "100.00",
      "actual_amount": "95.00",
      "currency": "CNY",
      "order_type": "recharge",
      "status": "paid",
      "description": "余额充值",
      "items": [
        {
          "name": "余额充值",
          "amount": "100.00",
          "quantity": 1
        }
      ],
      "payment_method": "alipay",
      "paid_at": "2026-01-16T12:01:00Z",
      "created_at": "2026-01-16T12:00:00Z",
      "updated_at": "2026-01-16T12:01:05Z"
    }
  ]
}
```

**代码示例**:
```typescript
const orders = await paymentsApi.getOrders({ 
  status: 'paid',
  order_type: 'recharge',
  ordering: '-created_at'
})
```

---

### 8.2 创建订单

**接口**: `POST /payments/orders/`  
**权限**: 已认证  
**说明**: 创建新订单

**请求参数**:
```json
{
  "amount": "100.00",
  "order_type": "recharge",
  "description": "余额充值100元",
  "items": [
    {
      "name": "余额充值",
      "amount": "100.00",
      "quantity": 1
    }
  ],
  "payment_method": "alipay"
}
```

**响应示例**:
```json
{
  "id": 1,
  "order_no": "ORD202601161200001",
  "user": 1,
  "user_info": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "amount": "100.00",
  "actual_amount": null,
  "currency": "CNY",
  "order_type": "recharge",
  "status": "pending",
  "description": "余额充值100元",
  "items": [
    {
      "name": "余额充值",
      "amount": "100.00",
      "quantity": 1
    }
  ],
  "payment_method": "alipay",
  "paid_at": null,
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:00:00Z"
}
```

**代码示例**:
```typescript
const order = await paymentsApi.createOrder({
  amount: "100.00",
  order_type: "recharge",
  description: "余额充值",
  payment_method: "alipay"
})
```

---

### 8.3 获取订单详情

**接口**: `GET /payments/orders/{id}/`  
**权限**: 已认证  
**说明**: 获取订单详情

**响应示例**:
```json
{
  "id": 1,
  "order_no": "ORD202601161200001",
  "user": 1,
  "user_info": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "amount": "100.00",
  "actual_amount": "95.00",
  "currency": "CNY",
  "order_type": "recharge",
  "status": "paid",
  "description": "余额充值100元",
  "items": [
    {
      "name": "余额充值",
      "amount": "100.00",
      "quantity": 1,
      "description": "充值到账户余额"
    }
  ],
  "payment_method": "alipay",
  "paid_at": "2026-01-16T12:01:00Z",
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:01:05Z"
}
```

**代码示例**:
```typescript
const order = await paymentsApi.getOrder(1)
```

---

### 8.4 更新订单

**接口**: `PUT /payments/orders/{id}/`  
**权限**: 已认证（仅能修改自己的订单，管理员可修改所有）  
**说明**: 更新订单信息

**请求参数**:
```json
{
  "description": "更新的订单描述",
  "payment_method": "wechat"
}
```

**代码示例**:
```typescript
await paymentsApi.updateOrder(1, {
  description: "更新的订单描述",
  payment_method: "wechat"
})
```

---

### 8.5 删除订单

**接口**: `DELETE /payments/orders/{id}/`  
**权限**: 已认证（仅能删除自己的订单，管理员可删除所有）  
**说明**: 删除订单记录

**代码示例**:
```typescript
await paymentsApi.deleteOrder(1)
```

---

### 8.6 取消订单

**接口**: `POST /payments/orders/{id}/cancel/`  
**权限**: 已认证  
**说明**: 取消未支付或处理中的订单

**响应示例**:
```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "id": 1,
    "order_no": "ORD202601161200001",
    "status": "cancelled",
    "updated_at": "2026-01-16T12:05:00Z"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "订单状态不允许取消"
}
```

**代码示例**:
```typescript
await paymentsApi.cancelOrder(1)
```

---

### 8.7 订单退款

**接口**: `POST /payments/orders/{id}/refund/`  
**权限**: 管理员  
**说明**: 对已支付订单进行退款

**请求参数**:
```json
{
  "reason": "用户申请退款",
  "refund_amount": "95.00"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "退款成功",
  "data": {
    "id": 1,
    "order_no": "ORD202601161200001",
    "status": "refunded",
    "refund_amount": "95.00",
    "updated_at": "2026-01-16T15:30:00Z"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "只能退款已支付的订单"
}
```

**代码示例**:
```typescript
await paymentsApi.refundOrder(1, {
  reason: "用户申请退款",
  refund_amount: "95.00"
})
```

---

## 9️⃣ 管理后台

### 9.1 获取仪表盘统计

**接口**: `GET /api/admin/statistics/dashboard/`  
**权限**: 管理员  
**说明**: 获取管理后台仪表盘统计数据

**响应示例**:
```json
{
  "users": {
    "total": 1000,
    "active": 800,
    "vip": 200,
    "new_today": 10
  },
  "tasks": {
    "total": 5000,
    "running": 50,
    "completed": 4500,
    "failed": 400
  },
  "revenue": {
    "today": "1000.00",
    "this_month": "50000.00",
    "total": "500000.00"
  },
  "cards": {
    "total": 500,
    "available": 300,
    "in_use": 150,
    "expired": 50
  }
}
```

**代码示例**:
```typescript
const stats = await adminApi.getDashboardStatistics()
```

---

## 🔟 集成管理

### 10.1 代理管理API

#### 获取代理列表

**接口**: `GET /proxies/`  
**权限**: 已认证  
**说明**: 获取代理列表

**查询参数**:
- `status` - 状态筛选（active/inactive/testing）
- `country` - 国家筛选
- `proxy_type` - 代理类型（http/https/socks5）

**响应示例**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "proxy_type": "socks5",
      "host": "1.2.3.4",
      "port": 1080,
      "username": "user",
      "password": "****",
      "country": "美国",
      "region": "加州",
      "city": "洛杉矶",
      "status": "active",
      "response_time": 150.5,
      "success_rate": 98.5,
      "use_count": 100,
      "last_used_at": "2026-01-16T12:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### 创建代理

**接口**: `POST /proxies/`  
**权限**: 已认证  
**说明**: 创建新代理

**请求参数**:
```json
{
  "proxy_type": "socks5",
  "host": "1.2.3.4",
  "port": 1080,
  "username": "user",
  "password": "pass",
  "country": "美国"
}
```

#### 批量导入代理

**接口**: `POST /proxies/batch_import/`  
**权限**: 已认证  
**说明**: 批量导入代理

**请求参数**:
```json
{
  "proxies": [
    {
      "proxy_type": "socks5",
      "host": "1.2.3.4",
      "port": 1080,
      "username": "user",
      "password": "pass"
    }
  ]
}
```

---

### 10.2 用户APIkey管理

#### 获取我的APIkey列表

**接口**: `GET /integrations/api-keys/`  
**权限**: 已认证  
**说明**: 获取当前用户的APIkey

**响应示例**:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "service": "sheerid",
      "key_name": "主要Key",
      "masked_api_key": "sk-1234...xyz9",
      "usage_quota_limit": 1000,
      "usage_quota_used": 250,
      "quota_remaining": 750,
      "is_active": true,
      "is_valid": true,
      "success_rate": 95.5,
      "last_used_at": "2026-01-16T10:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### 创建APIkey

**接口**: `POST /integrations/api-keys/`  
**权限**: 已认证  
**说明**: 添加新的APIkey

**请求参数**:
```json
{
  "service": "openai",
  "key_name": "GPT-4 Key",
  "api_key": "sk-1234567890abcdef",
  "usage_quota_limit": 500
}
```

#### 验证APIkey

**接口**: `POST /integrations/api-keys/{id}/validate/`  
**权限**: 已认证  
**说明**: 验证APIkey是否有效

**响应示例**:
```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "is_valid": true,
    "validated_at": "2026-01-16T12:00:00Z"
  }
}
```

---

### 10.3 比特浏览器配置管理

#### 获取浏览器配置列表

**接口**: `GET /integrations/bitbrowser/profiles/`  
**权限**: 已认证  
**说明**: 获取比特浏览器配置列表

**查询参数**:
- `user` - 用户ID筛选
- `is_active` - 是否激活（true/false）
- `google_account` - 关联的Google账号ID
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "profile_id": "profile_123456",
      "profile_name": "测试配置1",
      "user": 1,
      "google_account": 1,
      "proxy": 1,
      "browser_config": {
        "coreVersion": "130",
        "ostype": "PC",
        "os": "Win32"
      },
      "fingerprint_config": {
        "canvas": "0",
        "webGL": "0"
      },
      "is_active": true,
      "use_count": 5,
      "last_used_at": "2026-01-16T12:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### 创建浏览器配置

**接口**: `POST /integrations/bitbrowser/profiles/`  
**权限**: 已认证  
**说明**: 创建新的浏览器配置

**请求参数**:
```json
{
  "profile_name": "新配置",
  "google_account": 1,
  "proxy": 1,
  "browser_config": {
    "coreVersion": "130",
    "ostype": "PC",
    "os": "Win32"
  },
  "fingerprint_config": {
    "canvas": "0",
    "webGL": "0",
    "audioContext": "0"
  }
}
```

#### 获取配置详情

**接口**: `GET /integrations/bitbrowser/profiles/{id}/`  
**权限**: 已认证  
**说明**: 获取浏览器配置详情

**响应示例**:
```json
{
  "id": 1,
  "profile_id": "profile_123456",
  "profile_name": "测试配置1",
  "user": 1,
  "google_account": {
    "id": 1,
    "email": "user@gmail.com"
  },
  "proxy": {
    "id": 1,
    "host": "1.2.3.4",
    "port": 1080
  },
  "browser_config": {
    "coreVersion": "130",
    "ostype": "PC",
    "os": "Win32",
    "osVersion": "11,10"
  },
  "fingerprint_config": {
    "canvas": "0",
    "webGL": "0",
    "audioContext": "0"
  },
  "is_active": true,
  "use_count": 5,
  "last_used_at": "2026-01-16T12:00:00Z",
  "metadata": {},
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-16T12:00:00Z"
}
```

#### 更新配置

**接口**: `PUT /integrations/bitbrowser/profiles/{id}/`  
**权限**: 已认证（仅能修改自己的配置）  
**说明**: 更新浏览器配置

**请求参数**:
```json
{
  "profile_name": "更新的配置名称",
  "is_active": false,
  "proxy": 2
}
```

#### 删除配置

**接口**: `DELETE /integrations/bitbrowser/profiles/{id}/`  
**权限**: 已认证（仅能删除自己的配置）  
**说明**: 删除浏览器配置

---

### 10.4 Google集成记录管理

#### 获取SheerID验证记录

**接口**: `GET /integrations/google/sheerid-verifications/`  
**权限**: 已认证  
**说明**: 获取SheerID验证记录

**查询参数**:
- `google_account` - Google账号ID
- `verification_type` - 验证类型（student/teacher）
- `verified` - 是否通过验证（true/false）
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "google_account": 1,
      "task": 123,
      "verification_type": "student",
      "verification_link": "https://services.sheerid.com/verify/...",
      "submitted_data": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "user@gmail.com"
      },
      "verified": true,
      "verified_at": "2026-01-16T12:00:00Z",
      "error_message": null,
      "created_at": "2026-01-16T11:30:00Z"
    }
  ]
}
```

#### 获取Gemini订阅记录

**接口**: `GET /integrations/google/gemini-subscriptions/`  
**权限**: 已认证  
**说明**: 获取Gemini订阅记录

**查询参数**:
- `google_account` - Google账号ID
- `subscription_plan` - 订阅计划
- `success` - 是否成功（true/false）
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "google_account": 1,
      "task": 123,
      "card": 1,
      "subscription_plan": "Advanced",
      "start_date": "2026-01-16",
      "end_date": "2026-02-16",
      "amount": "20.00",
      "success": true,
      "error_message": null,
      "created_at": "2026-01-16T12:00:00Z"
    }
  ]
}
```

---

## 📖 常见问题

### 1. 如何处理Token过期？

```typescript
import axios from 'axios'

axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshToken = localStorage.getItem('refresh_token')
      const result = await authApi.refreshToken(refreshToken)
      localStorage.setItem('access_token', result.access)
      
      // 重试原请求
      error.config.headers['Authorization'] = `Bearer ${result.access}`
      return axios(error.config)
    }
    return Promise.reject(error)
  }
)
```

### 2. 如何处理分页数据？

```typescript
// 方式1: 手动分页
let page = 1
while (true) {
  const result = await usersApi.getUsers({ page })
  // 处理数据
  if (!result.next) break
  page++
}

// 方式2: 一次性加载所有数据
async function getAllUsers() {
  const users = []
  let page = 1
  while (true) {
    const result = await usersApi.getUsers({ page })
    users.push(...result.results)
    if (!result.next) break
    page++
  }
  return users
}
```

### 3. 如何上传文件？

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'filename')

await axios.post('/api/upload/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

---

## 🔧 调试工具

### Swagger UI

**地址**: http://localhost/api/docs/

**功能**:
- 📖 交互式API文档
- 🧪 在线测试接口
- 📝 自动生成请求示例
- 🔐 支持Token认证

### ReDoc

**地址**: http://localhost/api/redoc/

**功能**:
- 📚 更美观的文档界面
- 📄 适合阅读和打印
- 🗂️ 清晰的结构导航

### 浏览器开发者工具

```javascript
// 在浏览器控制台查看请求
// 1. 打开开发者工具 (F12)
// 2. 切换到 Network 标签
// 3. 筛选 XHR 请求
// 4. 查看请求详情
```

---

## 🔟 比特浏览器API集成

### 10.1 概述

比特浏览器（BitBrowser）是一款指纹浏览器工具，本系统通过Local API与其集成，实现自动化浏览器操作、账号管理等功能。

**API地址**: `http://127.0.0.1:54345`  
**Docker环境**: `http://host.docker.internal:54345`  
**请求方式**: 统一使用 `POST + JSON Body`

### 10.2 核心要点

#### ⚠️ 重要规范

**统一请求方式**:
- ✅ **统一使用**: `POST` 请求
- ✅ **统一传参**: `JSON Body` 格式
- ❌ **不接受**: URL参数、FormData等其他方式

```python
# ✅ 正确示例
requests.post(
    "http://127.0.0.1:54345/browser/list",
    json={'page': 0, 'pageSize': 10},
    headers={'Content-Type': 'application/json'}
)

# ❌ 错误示例
requests.get("http://127.0.0.1:54345/browser/list?page=0")
```

#### 统一响应格式

```json
{
    "success": true,
    "data": { /* 返回数据 */ }
}
```

### 10.3 API封装

#### Python封装类

**文件**: `bitbrowser_complete_api.py`

**初始化**:
```python
from bitbrowser_complete_api import BitBrowserCompleteAPI

# 本地环境
api = BitBrowserCompleteAPI()

# Docker环境
api = BitBrowserCompleteAPI("http://host.docker.internal:54345")

# 健康检查
if api.health_check():
    print("✅ 连接成功")
```

#### Django集成

**文件**: `Auto_All_System/backend/apps/integrations/bitbrowser/api.py`

**配置**:
```python
# settings/base.py
BITBROWSER_API_URL = "http://127.0.0.1:54345"
```

**使用**:
```python
from apps.integrations.bitbrowser.api import BitBrowserAPI

api = BitBrowserAPI()
result = api.list_browsers(page=0, page_size=10)
```

### 10.4 接口分类

#### 分组管理接口

| 接口 | 端点 | 说明 | 请求参数 |
|------|------|------|----------|
| 查询分组列表 | `/group/list` | 分页查询 | `page`, `pageSize` |
| 添加分组 | `/group/add` | 创建新分组 | `groupName`, `sortNum` |
| 修改分组 | `/group/edit` | 更新分组 | `id`, `groupName` |
| 删除分组 | `/group/delete` | 删除分组 | `id` |
| 获取分组详情 | `/group/detail` | 查询单个 | `id` |

**示例**:
```python
# 查询分组
result = api.list_groups()
groups = result['data']['list']

# 添加分组
result = api.add_group("新分组", sort_num=1)
group_id = result['data']['id']
```

#### 浏览器窗口接口

| 类别 | 接口 | 端点 | 说明 |
|------|------|------|------|
| **创建** | 创建窗口 | `/browser/update` | 创建新窗口 |
| **查询** | 分页列表 | `/browser/list` | 分页查询窗口 |
| | 窗口详情 | `/browser/detail` | 查询单个窗口 |
| **打开关闭** | 打开窗口 | `/browser/open` | 打开指定窗口 |
| | 关闭窗口 | `/browser/close` | 关闭指定窗口 |
| | 关闭所有 | `/browser/close/all` | 关闭所有窗口 |
| | 重置状态 | `/browser/closing/reset` | 重置关闭状态 |
| **删除** | 删除单个 | `/browser/delete` | 删除窗口 |
| | 批量删除 | `/browser/delete/ids` | 批量删除 |
| **修改** | 部分更新 | `/browser/update/partial` | 更新部分字段 |
| | 批量修改分组 | `/browser/group/update` | 批量移动分组 |
| | 批量修改备注 | `/browser/remark/update` | 批量修改备注 |

**创建窗口示例**:
```python
result = api.create_browser(
    name="测试窗口",
    browser_fingerprint={
        "coreVersion": "130",
        "ostype": "PC",
        "os": "Win32"
    }
)
browser_id = result['data']['id']
```

**打开窗口示例**:
```python
result = api.open_browser(browser_id, queue=True)
ws_endpoint = result['data']['ws']      # WebSocket连接地址
http_debug = result['data']['http']    # HTTP调试地址
pid = result['data']['pid']            # 进程PID
```

#### 代理管理接口

| 接口 | 端点 | 说明 |
|------|------|------|
| 批量配置代理 | `/browser/proxy/update` | 批量修改窗口代理 |
| 代理检测 | `/checkagent` | 检测代理可用性 |

**配置代理示例**:
```python
api.update_browsers_proxy(
    browser_ids=["id1", "id2"],
    proxy_config={
        "proxyType": "socks5",
        "host": "1.2.3.4",
        "port": 1080,
        "proxyUserName": "user",
        "proxyPassword": "pass"
    }
)
```

**检测代理示例**:
```python
result = api.check_proxy(
    host="1.2.3.4",
    port=1080,
    proxy_type="socks5",
    username="user",
    password="pass"
)
ip_info = result['data']['data']
# ip_info['ip'], ip_info['country'], ip_info['city']
```

#### Cookie管理接口

| 接口 | 端点 | 说明 |
|------|------|------|
| 获取Cookie | `/browser/cookies/get` | 获取已打开窗口的Cookie |
| 设置Cookie | `/browser/cookies/set` | 设置Cookie |
| 清空Cookie | `/browser/cookies/clear` | 清空Cookie |
| 格式化Cookie | `/browser/cookies/format` | 格式化Cookie数据 |

**Cookie操作示例**:
```python
# 获取
result = api.get_browser_cookies(browser_id)
cookies = result['data']

# 设置
api.set_browser_cookies(browser_id, cookies)

# 清空
api.clear_browser_cookies(browser_id, save_synced=False)
```

#### 进程管理接口

| 接口 | 端点 | 说明 |
|------|------|------|
| 获取PID | `/browser/pids` | 批量查询进程PID |
| 获取所有PID | `/browser/pids/all` | 查询所有已打开窗口 |
| 获取活跃PID | `/browser/pids/alive` | 过滤死进程 |
| 获取调试端口 | `/browser/ports` | 获取调试端口 |

### 10.5 Playwright集成

比特浏览器支持通过CDP协议与Playwright集成，实现自动化操作。

**完整流程**:
```python
from playwright.sync_api import sync_playwright
from bitbrowser_complete_api import BitBrowserCompleteAPI

api = BitBrowserCompleteAPI()

# 1. 打开浏览器
result = api.open_browser(browser_id, queue=True)
ws_endpoint = result['data']['ws']

try:
    # 2. 连接Playwright
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(ws_endpoint)
        context = browser.contexts[0]
        page = context.pages[0]
        
        # 3. 自动化操作
        page.goto("https://www.google.com")
        print(f"标题: {page.title()}")
        
        # 4. 关闭浏览器连接
        browser.close()
        
finally:
    # 5. 关闭窗口
    api.close_browser(browser_id)
```

### 10.6 批量操作

#### 批量创建窗口

```python
accounts = [
    {"email": "user1@gmail.com", "password": "pass1"},
    {"email": "user2@gmail.com", "password": "pass2"},
]

for account in accounts:
    result = api.create_browser(
        name=account['email'],
        browser_fingerprint={
            "coreVersion": "130",
            "ostype": "PC",
            "os": "Win32"
        },
        userName=account['email'],
        password=account['password']
    )
    print(f"✅ 创建成功: {result['data']['id']}")
    time.sleep(1)  # 避免频繁请求
```

#### 批量修改

```python
# 批量修改备注
api.update_browsers_remark(
    browser_ids=["id1", "id2", "id3"],
    remark="新备注"
)

# 批量移动分组
api.update_browsers_group(
    browser_ids=["id1", "id2", "id3"],
    group_id="group_id_xxx"
)

# 批量部分更新
api.update_browser_partial(
    browser_ids=["id1", "id2"],
    update_data={"name": "新名称", "remark": "新备注"}
)
```

#### 批量删除

```python
# 批量删除窗口
api.delete_browsers_batch(["id1", "id2", "id3"])

# 关闭所有窗口
api.close_all_browsers()
```

### 10.7 高级封装：BitBrowserManager

`BitBrowserManager` 类提供了更高级的业务封装。

```python
from bitbrowser_complete_api import BitBrowserManager

manager = BitBrowserManager()

# 1. 获取所有数据
all_browsers = manager.get_all_browsers()
all_groups = manager.get_all_groups()

# 2. 按条件查找
browser = manager.find_browser_by_name("测试窗口")
browsers_in_group = manager.get_browsers_by_group(group_id)

# 3. 按名称获取分组
group = manager.get_group_by_name("测试分组")
```

### 10.8 错误处理

#### 异常类

```python
from bitbrowser_complete_api import BitBrowserAPIError

try:
    result = api.open_browser(browser_id)
    
except BitBrowserAPIError as e:
    if "正在打开中" in str(e) or "关闭中" in str(e):
        # 重置状态
        api.reset_browser_closing_status(browser_id)
        time.sleep(2)
        # 重试
        result = api.open_browser(browser_id)
    else:
        raise
```

#### 安全打开（带重试）

```python
def safe_open_browser(browser_id, max_retries=3):
    """安全打开浏览器，自动处理状态错误"""
    for i in range(max_retries):
        try:
            return api.open_browser(browser_id, queue=True)
        except BitBrowserAPIError as e:
            if "正在打开中" in str(e) or "关闭中" in str(e):
                api.reset_browser_closing_status(browser_id)
                time.sleep(2)
            if i == max_retries - 1:
                raise
    return None
```

### 10.9 配置规范

#### 创建窗口配置

```python
browser_config = {
    "name": "窗口名称",
    "browserFingerPrint": {
        "coreVersion": "130",           # Chrome内核版本
        "ostype": "PC",                 # PC/Android/IOS
        "os": "Win32",                  # Win32/MacIntel/Linux x86_64
        "osVersion": "11,10",           # 系统版本
        
        # 基于IP自动生成（推荐）
        "isIpCreateTimeZone": True,     # 时区
        "isIpCreatePosition": True,     # 地理位置
        "isIpCreateLanguage": True,     # 语言
        
        # 指纹随机
        "canvas": "0",                  # 0=随机, 1=关闭
        "webGL": "0",
        "audioContext": "0"
    },
    
    # 代理配置
    "proxyMethod": 2,                   # 2=自定义
    "proxyType": "socks5",
    "host": "1.2.3.4",
    "port": 1080,
    "proxyUserName": "user",
    "proxyPassword": "pass",
    
    # 账户信息
    "userName": "user@gmail.com",
    "password": "password123",
    "faSecretKey": "JBSWY3DPEHPK3PXP",  # 2FA密钥
}
```

### 10.10 注意事项

| 注意点 | 说明 |
|--------|------|
| **队列打开** | 使用 `queue=True` 防止并发错误 |
| **关闭延迟** | 关闭后等待5秒再进行其他操作 |
| **批量限制** | 批量操作最多100个 |
| **代理检测** | 需要开启全局代理才能检测全局IP |
| **Win7/8** | 不支持Chrome 109及以上内核 |

### 10.11 实用代码片段

#### 2FA验证码生成

```python
import pyotp

# 获取窗口详情
result = api.get_browser_detail(browser_id)
secret = result['data'].get('faSecretKey')

if secret:
    # 生成当前验证码
    code = pyotp.TOTP(secret).now()
    print(f"2FA验证码: {code}")
```

#### Cookie持久化

```python
import json

# 保存Cookie
result = api.get_browser_cookies(browser_id)
cookies = result['data']
with open(f'cookies_{browser_id}.json', 'w') as f:
    json.dump(cookies, f)

# 恢复Cookie
with open(f'cookies_{browser_id}.json', 'r') as f:
    cookies = json.load(f)
    api.set_browser_cookies(browser_id, cookies)
```

#### 资源清理

```python
try:
    # 打开并使用浏览器
    result = api.open_browser(browser_id)
    ws = result['data']['ws']
    
    # 业务逻辑
    # ...
    
finally:
    # 确保关闭
    api.close_browser(browser_id)
    time.sleep(5)  # 等待进程退出
```

### 10.12 相关文档

- [17-比特浏览器API完整开发指南](./17-比特浏览器API完整开发指南.md) - 详细开发文档
- [16-比特浏览器Docker集成](./16-比特浏览器Docker集成.md) - Docker部署指南
- `bitbrowser_complete_api.py` - 完整API封装
- `Auto_All_System/backend/apps/integrations/bitbrowser/api.py` - Django集成

---

## 11. Google 业务插件 API

### 11.1 账号管理 API

#### GET /api/plugins/google/accounts/
获取 Google 账号列表

**权限**: 已认证

**查询参数**:
- `status` - 账号状态筛选 (pending_check/link_ready/verified/subscribed/ineligible)
- `search` - 搜索邮箱
- `page` - 页码
- `page_size` - 每页数量

**响应示例**:
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "email": "user@gmail.com",
      "status": "verified",
      "browser_id": "abc123",
      "verification_link": "https://services.sheerid.com/verify/...",
      "subscription_date": null,
      "created_at": "2026-01-18T10:00:00Z",
      "updated_at": "2026-01-18T11:00:00Z"
    }
  ]
}
```

#### POST /api/plugins/google/accounts/batch_import/
批量导入账号

**权限**: 已认证

**请求体**:
```json
{
  "accounts": [
    {
      "email": "user@gmail.com",
      "password": "password123",
      "recovery_email": "backup@gmail.com",
      "secret_key": "ABCD1234EFGH5678"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "imported": 10,
  "failed": 0,
  "errors": []
}
```

#### GET /api/plugins/google/accounts/statistics/
获取账号统计

**响应示例**:
```json
{
  "total": 100,
  "by_status": {
    "pending_check": 20,
    "link_ready": 30,
    "verified": 25,
    "subscribed": 20,
    "ineligible": 5
  },
  "today_new": 5,
  "today_subscribed": 3
}
```

### 11.2 任务管理 API

#### POST /api/plugins/google/tasks/
创建自动化任务

**权限**: 已认证

**请求体**:
```json
{
  "task_type": "auto_all",
  "account_ids": [1, 2, 3],
  "config": {
    "api_key": "sheerid_api_key",
    "cards_per_account": 1,
    "thread_count": 3,
    "delays": {
      "after_offer": 8,
      "after_add_card": 10,
      "after_save": 18
    }
  }
}
```

**任务类型**:
- `login` - 仅登录
- `extract_link` - 提取 SheerID 链接
- `verify_sheerid` - 验证 SheerID
- `bind_card` - 绑卡订阅
- `auto_all` - 一键全自动

**响应示例**:
```json
{
  "success": true,
  "task_id": "task_123",
  "message": "任务已创建"
}
```

#### GET /api/plugins/google/tasks/{task_id}/
获取任务详情

**响应示例**:
```json
{
  "id": "task_123",
  "task_type": "auto_all",
  "status": "running",
  "progress": 45,
  "processing_count": 3,
  "success_count": 15,
  "failed_count": 2,
  "started_at": "2026-01-18T10:00:00Z",
  "completed_at": null
}
```

#### GET /api/plugins/google/tasks/{task_id}/logs/
获取任务日志

**响应示例**:
```json
{
  "logs": [
    {
      "id": 1,
      "level": "info",
      "message": "开始处理账号 user@gmail.com",
      "created_at": "2026-01-18T10:01:00Z"
    }
  ]
}
```

#### POST /api/plugins/google/tasks/{task_id}/cancel/
取消任务

**响应示例**:
```json
{
  "success": true,
  "message": "任务已取消"
}
```

### 11.3 卡片管理 API

#### GET /api/plugins/google/cards/available/
获取可用卡片列表

**响应示例**:
```json
{
  "results": [
    {
      "id": 1,
      "card_number": "5481087170529907",
      "exp_month": "01",
      "exp_year": "32",
      "usage_count": 0,
      "max_usage": 1,
      "is_active": true
    }
  ]
}
```

#### POST /api/plugins/google/cards/batch_import/
批量导入卡片

**请求体** (multipart/form-data):
- `file` - 卡片文件 (cards.txt)

文件格式（每行一张卡）:
```
5481087170529907 01 32 536
5481087170529908 02 33 537
```

**响应示例**:
```json
{
  "success": true,
  "imported": 10,
  "failed": 0
}
```

### 11.4 工作流使用示例

#### 一键全自动处理

```python
import asyncio
from apps.plugins.google_business.workflows import AutoAllInOneWorkflow
from apps.plugins.google_business.models import GoogleAccount

async def main():
    account = GoogleAccount.objects.get(email='user@gmail.com')
    
    card_info = {
        'number': '5481087170529907',
        'exp_month': '01',
        'exp_year': '32',
        'cvv': '536'
    }
    
    config = {
        'api_key': 'your_sheerid_api_key',
        'delays': {
            'after_offer': 8,
            'after_add_card': 10,
            'after_save': 18
        }
    }
    
    success, message = await AutoAllInOneWorkflow.execute(
        browser_id=account.browser_id,
        account=account,
        card_info=card_info,
        config=config,
        log_callback=lambda msg: print(f"[Log] {msg}")
    )
    
    print(f"Result: {success} - {message}")

asyncio.run(main())
```

### 11.5 相关文档

- [18-Google插件迁移指南](./18-Google插件迁移指南.md) - 完整迁移指南
- `google_business/README.md` - 插件使用文档
- `google_business/workflows/` - 工作流源码

---

## 📚 相关文档

- [00-快速开始](./00-快速开始.md) - 系统安装和启动
- [01-数据库设计文档](./01-数据库设计文档.md) - 数据库结构
- [02-系统架构与配置](./02-系统架构与配置.md) - 架构和配置
- [03-前端页面功能说明](./03-前端页面功能说明.md) - 页面功能
- [07-插件化架构设计](./07-插件化架构设计.md) - 插件系统设计
- [谷歌插件设计说明](./谷歌插件设计说明.md) - Google插件完整说明

---

## 📋 附录A: API配置标准化详细方案

### A.1 架构说明

```
┌─────────────┐
│   前端应用   │
└──────┬──────┘
       │ axios.baseURL = '/api/v1'
       ▼
┌─────────────┐
│    Nginx    │ (反向代理)
│  localhost  │
└──────┬──────┘
       │ proxy_pass http://backend:8000/api/
       ▼
┌─────────────┐
│   Django    │
│   Backend   │
│  端口 8000   │
└─────────────┘
```

### A.2 Django URL配置

**位置**: `backend/config/urls.py`

```python
urlpatterns = [
    # API根路径: /api/
    path('api/', include([
        # 版本化路由: /api/v1/
        path('v1/', include([
            path('auth/', include('apps.accounts.urls')),
            path('users/', include('apps.accounts.urls')),
            path('zones/', include('apps.zones.urls')),
            path('tasks/', include('apps.tasks.urls')),
            path('cards/', include('apps.cards.urls')),
            path('payments/', include('apps.payments.urls')),
            path('admin/', include('apps.admin_panel.urls')),
            path('plugins/', include('apps.plugins.urls')),
        ])),
        
        # 健康检查
        path('health/', health_check_view),
        
        # API文档
        path('docs/', schema_view.with_ui('swagger')),
        path('redoc/', schema_view.with_ui('redoc')),
    ])),
]
```

### A.3 Nginx配置规范

**位置**: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    
    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # WebSocket代理
    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 📋 附录B: 比特浏览器API配置详解

### B.1 配置优先级

```
1. 环境变量 BITBROWSER_API_URL (最高优先级)
2. Django settings 自动判断
3. 代码默认值 (最低优先级)
```

### B.2 Django配置实现

**位置**: `backend/config/settings/base.py`

```python
# 比特浏览器API配置
# 自动根据环境选择正确的地址
_default_bitbrowser_host = (
    'host.docker.internal'  # Docker环境
    if os.getenv('DJANGO_ENVIRONMENT') == 'docker'
    else '127.0.0.1'  # 本地开发
)
BITBROWSER_API_URL = os.getenv(
    'BITBROWSER_API_URL',
    f'http://{_default_bitbrowser_host}:54345'
)
```

### B.3 Docker环境配置

**位置**: `docker-compose.yml`

```yaml
backend:
  environment:
    - DJANGO_ENVIRONMENT=docker  # 必须设置
    - BITBROWSER_API_URL=http://host.docker.internal:54345

celery:
  environment:
    - DJANGO_ENVIRONMENT=docker
    - BITBROWSER_API_URL=http://host.docker.internal:54345

celery-beat:
  environment:
    - DJANGO_ENVIRONMENT=docker
    - BITBROWSER_API_URL=http://host.docker.internal:54345
```

### B.4 环境配置对照表

| 环境类型 | DJANGO_ENVIRONMENT | BITBROWSER_API_URL | 说明 |
|---------|-------------------|-------------------|------|
| **Docker部署** | `docker` | `http://host.docker.internal:54345` | 访问宿主机比特浏览器 |
| **本地开发** | 未设置/`development` | `http://127.0.0.1:54345` | 本机开发环境 |
| **生产环境** | `production` | 自定义URL | 根据实际情况配置 |

### B.5 代码使用示例

```python
# ✅ 方式1: 通过Django settings
from django.conf import settings
from apps.integrations.bitbrowser.api import BitBrowserAPI

api = BitBrowserAPI(api_url=settings.BITBROWSER_API_URL)

# ✅ 方式2: 使用默认配置(自动读取settings)
from apps.integrations.bitbrowser.api import BitBrowserAPI

api = BitBrowserAPI()  # 自动使用 settings.BITBROWSER_API_URL

# ❌ 错误: 硬编码地址
api = BitBrowserAPI(api_url="http://127.0.0.1:54345")  # 不要这样做
```

---

## 📋 附录C: 环境变量配置指南

### C.1 后端环境变量清单

**开发环境** (`backend/.env`):

```bash
# ==================== 基础配置 ====================
DJANGO_ENVIRONMENT=development  # development/docker/production
SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# ==================== HTTP配置 ====================
ENABLE_HTTPS=false  # true启用HTTPS
ALLOWED_HOSTS=localhost,127.0.0.1

# ==================== 数据库配置 ====================
DB_HOST=127.0.0.1  # Docker: db
DB_NAME=auto_all_db
DB_USER=auto_all_user
DB_PASSWORD=your_password_here
DB_PORT=5432

# ==================== Redis配置 ====================
REDIS_URL=redis://127.0.0.1:6379/1  # Docker: redis://redis:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/0

# ==================== 比特浏览器配置 ====================
# 本地开发: http://127.0.0.1:54345
# Docker: http://host.docker.internal:54345
BITBROWSER_API_URL=http://127.0.0.1:54345
```

**Docker环境** (在 `docker-compose.yml` 中配置):

```yaml
environment:
  - DJANGO_ENVIRONMENT=docker
  - DB_HOST=db
  - REDIS_URL=redis://redis:6379/1
  - BITBROWSER_API_URL=http://host.docker.internal:54345
  - ENABLE_HTTPS=false
```

**生产环境** (`backend/.env.production`):

```bash
DJANGO_ENVIRONMENT=production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_HOST=your-db-host
REDIS_URL=redis://your-redis-host:6379/1
BITBROWSER_API_URL=http://your-bitbrowser-host:54345
ENABLE_HTTPS=true
```

### C.2 前端环境变量

**位置**: `frontend/.env`

```bash
# API基础地址
VITE_API_BASE_URL=/api/v1

# WebSocket地址
VITE_WS_BASE_URL=ws://localhost/ws
```

### C.3 环境变量验证

```bash
# 检查Docker环境变量
docker-compose exec backend printenv | grep -E "(DJANGO_ENVIRONMENT|BITBROWSER_API_URL|DB_HOST)"

# 进入Django shell测试
docker-compose exec backend python manage.py shell
>>> from django.conf import settings
>>> print(f"Environment: {settings.DJANGO_ENVIRONMENT}")
>>> print(f"BitBrowser: {settings.BITBROWSER_API_URL}")
```

---

## 📋 附录D: API标准化实施记录

### D.1 问题发现与分析

#### 发现的主要问题

1. **前端API路径不一致**
   - 混合使用相对路径和绝对路径
   - 导致路径重复: `/api/v1/api/v1/...`
   - 引发404错误

2. **比特浏览器API配置分散**
   - 配置在多个文件中重复定义
   - Docker和本地环境配置混乱
   - 缺少统一的管理规范

3. **缺少标准化文档**
   - 没有明确的API开发规范
   - 新开发者容易犯同样的错误

### D.2 修复记录

#### 前端路径修复 (2026-01-19)

**文件**: `frontend/src/api/google_business.ts`

| 函数名 | 修复内容 |
|--------|---------|
| `getGoogleAccount` | 移除路径中的 `/api/v1` 前缀 |
| `updateGoogleAccount` | 移除路径中的 `/api/v1` 前缀 |
| `deleteGoogleAccount` | 移除路径中的 `/api/v1` 前缀 |
| `getTask` | 移除路径中的 `/api/v1` 前缀 |
| `cancelTask` | 移除路径中的 `/api/v1` 前缀 |
| `deleteTask` | 移除路径中的 `/api/v1` 前缀 |
| `getTaskLogs` | 移除路径中的 `/api/v1` 前缀 |
| `retryTaskAccounts` | 移除路径中的 `/api/v1` 前缀 |
| `getTaskAccount` | 移除路径中的 `/api/v1` 前缀 |
| `getCard` | 移除路径中的 `/api/v1` 前缀 |
| `updateCard` | 移除路径中的 `/api/v1` 前缀 |
| `deleteCard` | 移除路径中的 `/api/v1` 前缀 |

**总计**: 修复 **13个函数** 的路径问题

#### 验证结果

```bash
# 检查修复效果
cd frontend/src/api
grep -r "/api/v1/" .

# 结果: 无任何匹配 ✅
```

### D.3 配置标准化成果

#### 比特浏览器API配置

**标准化前**:
- 可能在多处硬编码
- Docker环境配置不清晰
- 缺少环境变量管理

**标准化后**:
- 统一在Django settings管理
- 自动根据环境判断地址
- 支持环境变量覆盖

#### 路径规范化

| 功能 | 前端路径 | 实际完整路径 |
|------|---------|-------------|
| 登录 | `/auth/login/` | `/api/v1/auth/login/` |
| Google账号列表 | `/plugins/google-business/accounts/` | `/api/v1/plugins/google-business/accounts/` |
| Google账号详情 | `/plugins/google-business/accounts/{id}/` | `/api/v1/plugins/google-business/accounts/{id}/` |
| Google任务列表 | `/plugins/google-business/tasks/` | `/api/v1/plugins/google-business/tasks/` |
| Google卡片 | `/plugins/google-business/cards/` | `/api/v1/plugins/google-business/cards/` |

### D.4 新增开发规范

#### 前端API编写规范

```typescript
// ✅ 正确示例
export function getResource(id: number) {
  return request({
    url: `/resources/${id}/`,  // 相对路径，以斜杠结尾
    method: 'get'
  })
}

// ❌ 错误示例
export function getResource(id: number) {
  return request({
    url: `/api/v1/resources/${id}`,  // ❌ 包含baseURL，缺少尾部斜杠
    method: 'get'
  })
}
```

#### 后端API配置规范

```python
# ✅ 正确示例

# URL配置 (urls.py)
urlpatterns = [
    path('resources/', ResourceListView.as_view()),  # 使用尾部斜杠
    path('resources/<int:pk>/', ResourceDetailView.as_view()),
]

# 使用比特浏览器API
from django.conf import settings
from apps.integrations.bitbrowser.api import BitBrowserAPI

api = BitBrowserAPI()  # 自动使用settings配置

# ❌ 错误示例
urlpatterns = [
    path('resources', ResourceListView.as_view()),  # ❌ 缺少尾部斜杠
]

api = BitBrowserAPI(api_url="http://127.0.0.1:54345")  # ❌ 硬编码
```

### D.5 后续维护指南

#### 新增API检查清单

**前端新增API**:
- [ ] 使用相对路径(不包含 `/api/v1`)
- [ ] 路径以斜杠结尾
- [ ] GET请求使用 `params`
- [ ] POST/PUT/PATCH请求使用 `data`
- [ ] 添加JSDoc注释
- [ ] 类型定义完整

**后端新增API**:
- [ ] URL配置使用尾部斜杠
- [ ] 视图继承DRF标准类
- [ ] 权限配置正确
- [ ] 序列化器定义完整
- [ ] 添加API文档注释

#### 定期检查命令

```bash
# 检查前端API路径
cd frontend/src/api
grep -r "/api/v1/" .  # 应该没有输出

# 验证环境变量
docker-compose exec backend printenv | grep -E "(DJANGO_ENVIRONMENT|BITBROWSER_API_URL)"

# 测试比特浏览器连接
docker-compose exec backend python manage.py shell -c "
from apps.integrations.bitbrowser.api import BitBrowserAPI
api = BitBrowserAPI()
print('Health Check:', api.health_check())
"
```

---

## 📋 附录E: 快速参考卡片

### E.1 核心原则

```
✅ 前端使用相对路径 (不包含 /api/v1)
✅ 后端配置统一在 Django settings
✅ 环境变量优先级最高
```

### E.2 常见错误排查

#### 错误1: 路径重复

```
❌ 错误: /api/v1/api/v1/plugins/google-business/accounts/
✅ 正确: /api/v1/plugins/google-business/accounts/

原因: 前端使用了绝对路径
解决: 使用相对路径 /plugins/google-business/accounts/
```

#### 错误2: 404错误

```
❌ 错误: GET /api/v1/resources 返回404
✅ 正确: GET /api/v1/resources/ 返回200

原因: 缺少尾部斜杠
解决: Django默认需要尾部斜杠
```

#### 错误3: 比特浏览器连接失败

```
❌ 错误: Connection refused to 127.0.0.1:54345
✅ 正确: 在Docker中使用 host.docker.internal:54345

原因: Docker容器无法访问127.0.0.1(指向容器自己)
解决: 设置 BITBROWSER_API_URL=http://host.docker.internal:54345
```

### E.3 快速验证命令

```bash
# 验证前端API (实际完整路径)
curl http://localhost/api/v1/auth/login/
curl http://localhost/api/v1/plugins/google-business/accounts/

# 验证比特浏览器API
docker-compose exec backend python -c "
from apps.integrations.bitbrowser.api import BitBrowserAPI
api = BitBrowserAPI()
print('Health:', api.health_check())
"

# 检查环境变量
docker-compose exec backend printenv | grep BITBROWSER
```

---

**文档版本**: 1.2.0  
**最后更新**: 2026-01-19  
**维护者**: Auto All System Team

