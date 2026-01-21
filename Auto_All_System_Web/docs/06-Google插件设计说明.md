# Google Business 插件设计说明

> **版本**: v1.0  
> **更新日期**: 2026-01-19  
> **状态**: 已完成并运行中

---

## 📋 目录

1. [功能概述](#功能概述)
2. [系统架构](#系统架构)
3. [核心功能](#核心功能)
4. [技术实现](#技术实现)
5. [使用指南](#使用指南)
6. [API接口](#api接口)
7. [故障排查](#故障排查)

---

## 功能概述

Google Business 插件是 Auto All System 的核心业务插件，实现了 Google 学生优惠订阅的完整自动化流程。

### 核心业务流程

```
导入账号 → Google登录 → 获取SheerID链接 → SheerID验证 → 绑卡订阅 → 完成
```

### 主要功能

#### 🔐 账号管理
- Google 账号导入（批量/单个）
- 账号状态追踪（pending_check, link_ready, verified, subscribed, ineligible）
- 账号信息加密存储（密码、2FA密钥）
- 账号统计分析

#### 🤖 自动化工作流
- **Google 登录**: 支持2FA验证、辅助邮箱验证
- **SheerID 链接提取**: 多语言支持（13种语言）、智能状态检测
- **SheerID 验证**: 批量验证（最多5个/批）、API Key管理
- **自动绑卡**: 一卡多绑、延迟控制、并发控制
- **一键全自动**: 完整流程自动执行

#### 💳 卡信息管理
- 虚拟卡信息管理
- 卡号加密存储
- 一卡多绑配置
- 可用卡片查询

#### 📊 任务管理
- 任务创建和配置
- 任务执行和监控
- 任务暂停/恢复/取消
- 实时进度追踪
- 任务日志记录

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端层 (Vue3)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │工作台    │  │账号管理  │  │SheerID   │  │自动绑卡  ││
│  │Dashboard │  │Accounts  │  │Manage    │  │BindCard  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    API层 (Django REST)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │账号API   │  │任务API   │  │卡片API   │  │配置API   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    服务层 (Services)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │登录服务  │  │链接服务  │  │验证服务  │  │绑卡服务  ││
│  │Login     │  │Link      │  │Verify    │  │BindCard  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         浏览器资源池 (Browser Pool)               │   │
│  │  - 并发控制（最大5个实例）                        │   │
│  │  - 实例管理（创建/分配/回收）                     │   │
│  │  - 超时清理（60分钟）                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  异步任务层 (Celery)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │登录任务  │  │获取链接  │  │验证任务  │  │绑卡任务  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              集成层 (BitBrowser + Playwright)            │
│  ┌────────────────────┐  ┌────────────────────┐         │
│  │  BitBrowser API    │  │  Playwright        │         │
│  │  - 浏览器管理      │  │  - 页面自动化      │         │
│  │  - 配置文件管理    │  │  - 元素操作        │         │
│  └────────────────────┘  └────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 数据模型

#### GoogleAccount（Google账号）
```python
- email: 邮箱地址
- password: 密码（加密）
- recovery_email: 辅助邮箱
- secret_key: 2FA密钥（加密）
- browser_id: 比特浏览器ID
- status: 状态（pending_check/link_ready/verified/subscribed/ineligible）
- sheerid_link: SheerID验证链接
- last_check_time: 最后检查时间
```

#### GoogleTask（任务）
```python
- task_type: 任务类型（login/extract_link/verify/bind_card/auto_all）
- status: 状态（pending/running/paused/completed/failed/cancelled）
- config: 任务配置（JSON）
- total_count: 总账号数
- success_count: 成功数
- failed_count: 失败数
- progress: 进度百分比
- created_at: 创建时间
- started_at: 开始时间
- completed_at: 完成时间
```

#### GoogleCardInfo（卡信息）
```python
- card_number: 卡号（加密）
- exp_month: 过期月份
- exp_year: 过期年份
- cvv: CVV（加密）
- usage_count: 使用次数
- max_usage: 最大使用次数
- is_active: 是否可用
```

---

## 核心功能

### 1. Google 登录服务

**功能**: 自动登录 Google 账号，支持 2FA 验证和辅助邮箱验证。

**核心逻辑**:
```python
class GoogleLoginService:
    async def login(self, browser_id: str, account: GoogleAccount):
        # 1. 打开浏览器
        page = await self.open_browser(browser_id)
        
        # 2. 导航到登录页
        await page.goto('https://accounts.google.com')
        
        # 3. 输入邮箱
        await page.fill('input[type="email"]', account.email)
        await page.click('#identifierNext')
        
        # 4. 输入密码
        await page.fill('input[type="password"]', account.password)
        await page.click('#passwordNext')
        
        # 5. 处理2FA（如果需要）
        if account.secret_key:
            totp = pyotp.TOTP(account.secret_key)
            code = totp.now()
            await page.fill('input[name="totpPin"]', code)
            await page.click('#totpNext')
        
        # 6. 验证登录成功
        await page.wait_for_url('https://myaccount.google.com/')
        
        return True, "登录成功"
```

**支持特性**:
- ✅ 标准登录流程
- ✅ TOTP 2FA验证
- ✅ 辅助邮箱验证
- ✅ 多语言支持
- ✅ 登录状态检测
- ✅ 代理预热机制

### 2. SheerID 链接提取服务

**功能**: 检测账号资格状态并提取 SheerID 验证链接。

**状态检测**:
```python
class SheerIDLinkService:
    async def extract_link(self, browser_id: str, account: GoogleAccount):
        page = await self.open_browser(browser_id)
        
        # 访问 Gemini 订阅页面
        await page.goto('https://gemini.google.com/advanced')
        
        # 检测状态
        status = await self.detect_status(page)
        
        # 状态类型：
        # - subscribed: 已订阅/已绑卡
        # - verified: 已验证未绑卡
        # - link_ready: 有资格，待验证
        # - ineligible: 无资格
        # - timeout: 超时
        
        if status == 'link_ready':
            # 提取验证链接
            link = await self.get_verification_link(page)
            return True, link
        
        return False, f"状态: {status}"
```

**多语言支持**:
- 英语、中文、日语、韩语、德语、法语、西班牙语等13种语言
- CSS类名精确检测
- 翻译引擎fallback机制

### 3. SheerID 验证服务

**功能**: 批量验证 SheerID，绕过 hCaptcha。

**核心逻辑**:
```python
class SheerIDVerifyService:
    async def verify_batch(self, links: List[str], api_key: str):
        # 批量验证（最多5个/批）
        batch_size = min(len(links), 5)
        
        # 1. 获取CSRF Token
        csrf_token = await self.get_csrf_token()
        
        # 2. 提交验证请求
        response = await self.submit_verification(
            links=links[:batch_size],
            api_key=api_key,
            csrf_token=csrf_token
        )
        
        # 3. 轮询验证结果（最多60次，120秒）
        for i in range(60):
            results = await self.check_results(response['task_id'])
            if results['status'] == 'completed':
                return results['verified_links']
            await asyncio.sleep(2)
        
        return []
```

**特性**:
- ✅ 批量验证（5个/批）
- ✅ API Key管理
- ✅ CSRF Token自动刷新
- ✅ SSE流式响应处理
- ✅ 智能重试机制

### 4. 自动绑卡服务

**功能**: 自动填写卡信息并完成订阅。

**核心逻辑**:
```python
class BindCardService:
    async def bind_card(self, browser_id: str, card_info: dict):
        page = await self.open_browser(browser_id)
        
        # 1. 访问订阅页面
        await page.goto('https://gemini.google.com/advanced')
        
        # 2. 点击 Offer 按钮
        await page.click('button:has-text("Get Gemini Advanced")')
        await asyncio.sleep(config.get('delay_after_offer', 3))
        
        # 3. 点击 Add Card 按钮
        await page.click('button:has-text("Add card")')
        await asyncio.sleep(config.get('delay_after_add_card', 2))
        
        # 4. 填写卡信息
        await page.fill('input[name="cardNumber"]', card_info['number'])
        await page.fill('input[name="expMonth"]', card_info['exp_month'])
        await page.fill('input[name="expYear"]', card_info['exp_year'])
        await page.fill('input[name="cvv"]', card_info['cvv'])
        
        # 5. 提交
        await page.click('button:has-text("Save")')
        await asyncio.sleep(config.get('delay_after_save', 5))
        
        # 6. 验证成功
        success = await self.verify_subscription(page)
        
        return success, "绑卡成功" if success else "绑卡失败"
```

**配置参数**:
- `delay_after_offer`: Offer后延迟（默认3秒）
- `delay_after_add_card`: AddCard后延迟（默认2秒）
- `delay_after_save`: Save后延迟（默认5秒）
- `max_concurrent`: 最大并发数（1-20）
- `cards_per_account`: 每个账号绑卡数（1-10）

### 5. 浏览器资源池

**功能**: 管理浏览器实例，控制并发，防止资源耗尽。

**并发控制**:
```python
class BrowserPool:
    def __init__(self, max_concurrent: int = 5):
        self.max_concurrent = max_concurrent
        self.instances = {}  # {browser_id: BrowserInstance}
        self.lock = asyncio.Lock()
    
    async def acquire(self, browser_id: str, ws_endpoint: str, task_id: str):
        async with self.lock:
            # 检查并发数
            busy_count = sum(1 for inst in self.instances.values() if inst.is_busy)
            if busy_count >= self.max_concurrent:
                raise ResourceBusyError(f"已达到最大并发数: {self.max_concurrent}")
            
            # 获取或创建实例
            if browser_id not in self.instances:
                instance = await self.create_instance(browser_id, ws_endpoint)
                self.instances[browser_id] = instance
            
            instance = self.instances[browser_id]
            instance.mark_busy(task_id)
            
            return instance
    
    async def release(self, browser_id: str):
        async with self.lock:
            if browser_id in self.instances:
                self.instances[browser_id].mark_idle()
```

**特性**:
- ✅ 全局最大并发控制（默认5个）
- ✅ 实例复用（避免重复创建）
- ✅ 自动超时清理（60分钟）
- ✅ 线程安全（asyncio.Lock）
- ✅ 资源监控（总数/忙碌/空闲）

---

## 技术实现

### 技术栈

**后端**:
- Django 4.2 - Web框架
- Django REST Framework - API框架
- Celery - 异步任务队列
- Redis - 缓存和消息队列
- Playwright - 浏览器自动化
- PostgreSQL - 数据库

**前端**:
- Vue 3 - 前端框架
- Element Plus - UI组件库
- TypeScript - 类型安全
- Axios - HTTP客户端
- Pinia - 状态管理

**集成**:
- BitBrowser - 浏览器指纹管理
- pyotp - TOTP 2FA验证
- deep-translator - 多语言翻译

### 目录结构

```
backend/plugins/google_business/
├── __init__.py
├── plugin.py                 # 插件入口
├── models.py                 # 数据模型
├── views_new.py              # API视图
├── urls.py                   # URL路由
├── serializers.py            # 序列化器
├── tasks.py                  # Celery任务
├── utils.py                  # 工具函数
├── services/                 # 服务层
│   ├── __init__.py
│   ├── browser_pool.py       # 浏览器资源池
│   ├── login_service.py      # 登录服务
│   ├── link_service.py       # 链接提取服务
│   ├── verify_service.py     # 验证服务
│   └── bind_card_service.py  # 绑卡服务
└── migrations/               # 数据库迁移
```

```
frontend/src/views/google/
├── GoogleDashboard.vue       # 工作台
├── AccountManage.vue         # 账号管理
├── SheerIDManage.vue         # SheerID管理
├── AutoBindCard.vue          # 自动绑卡
└── AutoAllInOne.vue          # 一键全自动
```

### 数据加密

敏感数据使用 AES-256 加密存储：

```python
from cryptography.fernet import Fernet

class EncryptionUtils:
    @staticmethod
    def encrypt(data: str) -> str:
        key = settings.SECRET_KEY[:32].encode()
        f = Fernet(base64.urlsafe_b64encode(key))
        return f.encrypt(data.encode()).decode()
    
    @staticmethod
    def decrypt(encrypted_data: str) -> str:
        key = settings.SECRET_KEY[:32].encode()
        f = Fernet(base64.urlsafe_b64encode(key))
        return f.decrypt(encrypted_data.encode()).decode()
```

**加密字段**:
- 账号密码
- 2FA密钥
- 卡号
- CVV

---

## 使用指南

### 快速开始

#### 1. 导入账号

**格式**: `email----password----recovery_email----secret_key`

**示例**:
```
user1@gmail.com----pass123----backup1@gmail.com----ABCD1234EFGH5678
user2@gmail.com----pass456----backup2@gmail.com----IJKL5678MNOP9012
```

**Web界面**:
1. 访问 `/google/accounts`
2. 点击"批量导入"
3. 粘贴账号数据
4. 点击"导入"

**API调用**:
```bash
curl -X POST http://localhost:8000/api/v1/plugins/google-business/accounts/batch_import/ \
  -H "Content-Type: application/json" \
  -d '{
    "accounts": [
      {
        "email": "user1@gmail.com",
        "password": "pass123",
        "recovery_email": "backup1@gmail.com",
        "secret_key": "ABCD1234EFGH5678"
      }
    ]
  }'
```

#### 2. 执行任务

**一键全自动**:
1. 访问 `/google/auto-all`
2. 选择要处理的账号
3. 配置任务参数：
   - 并发数（1-5）
   - 每账号绑卡数（1-10）
   - 延迟参数
4. 点击"开始全自动处理"

**分步执行**:
- **登录**: `/google/accounts` → 选择账号 → "批量登录"
- **获取链接**: 选择已登录账号 → "获取SheerID链接"
- **验证**: `/google/sheerid` → 选择待验证账号 → "批量验证"
- **绑卡**: `/google/bind-card` → 选择已验证账号 → "自动绑卡"

#### 3. 监控任务

**实时进度**:
- 工作台显示任务进度条
- WebSocket实时推送日志
- 任务列表显示详细状态

**任务操作**:
- **暂停**: 暂停正在执行的任务
- **恢复**: 恢复已暂停的任务
- **取消**: 取消任务执行
- **重试**: 重试失败的账号

### 配置说明

**插件配置** (`/api/v1/plugins/google-business/config/`):

```json
{
  "max_concurrent_browsers": 5,
  "browser_timeout_minutes": 60,
  "default_delays": {
    "after_offer": 3,
    "after_add_card": 2,
    "after_save": 5
  },
  "retry_config": {
    "max_retries": 3,
    "retry_delay": 5
  },
  "sheerid_config": {
    "api_key": "your-api-key",
    "batch_size": 5,
    "poll_interval": 2,
    "max_polls": 60
  }
}
```

---

## API接口

### 账号管理

#### 获取账号列表
```
GET /api/v1/plugins/google-business/accounts/
```

**查询参数**:
- `status`: 状态筛选
- `search`: 搜索关键词
- `page`: 页码
- `page_size`: 每页数量

**响应**:
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "email": "user@gmail.com",
      "status": "link_ready",
      "browser_id": "123456",
      "sheerid_link": "https://...",
      "last_check_time": "2026-01-19T10:00:00Z"
    }
  ]
}
```

#### 批量导入账号
```
POST /api/v1/plugins/google-business/accounts/batch_import/
```

**请求体**:
```json
{
  "accounts": [
    {
      "email": "user@gmail.com",
      "password": "pass123",
      "recovery_email": "backup@gmail.com",
      "secret_key": "ABCD1234"
    }
  ]
}
```

#### 更新账号状态
```
PATCH /api/v1/plugins/google-business/accounts/{id}/
```

**请求体**:
```json
{
  "status": "verified",
  "sheerid_link": "https://..."
}
```

### 任务管理

#### 创建任务
```
POST /api/v1/plugins/google-business/tasks/
```

**请求体**:
```json
{
  "task_type": "auto_all",
  "account_ids": [1, 2, 3],
  "config": {
    "thread_count": 3,
    "cards_per_account": 1,
    "delays": {
      "after_offer": 3,
      "after_add_card": 2,
      "after_save": 5
    }
  }
}
```

#### 获取任务详情
```
GET /api/v1/plugins/google-business/tasks/{id}/
```

**响应**:
```json
{
  "id": 1,
  "task_type": "auto_all",
  "status": "running",
  "progress": 45.5,
  "total_count": 10,
  "success_count": 4,
  "failed_count": 1,
  "created_at": "2026-01-19T10:00:00Z",
  "started_at": "2026-01-19T10:01:00Z"
}
```

#### 执行任务
```
POST /api/v1/plugins/google-business/tasks/{id}/execute/
```

#### 暂停任务
```
POST /api/v1/plugins/google-business/tasks/{id}/pause/
```

#### 恢复任务
```
POST /api/v1/plugins/google-business/tasks/{id}/resume/
```

#### 取消任务
```
POST /api/v1/plugins/google-business/tasks/{id}/cancel/
```

### 卡信息管理

#### 获取卡列表
```
GET /api/v1/plugins/google-business/cards/
```

#### 添加卡信息
```
POST /api/v1/plugins/google-business/cards/
```

**请求体**:
```json
{
  "card_number": "5481087170529907",
  "exp_month": "01",
  "exp_year": "32",
  "cvv": "536",
  "max_usage": 10
}
```

#### 获取可用卡片
```
GET /api/v1/plugins/google-business/cards/available/
```

### 统计数据

#### 获取统计信息
```
GET /api/v1/plugins/google-business/statistics/
```

**响应**:
```json
{
  "total_accounts": 100,
  "status_distribution": {
    "pending_check": 20,
    "link_ready": 30,
    "verified": 25,
    "subscribed": 20,
    "ineligible": 5
  },
  "today_tasks": 5,
  "success_rate": 85.5
}
```

---

## 故障排查

### 常见问题

#### 1. 浏览器连接失败

**错误信息**:
```
Error: Target page, context or browser has been closed
```

**解决方案**:
1. 检查比特浏览器是否运行
2. 确认浏览器ID正确
3. 检查WebSocket端点是否可用
4. 增加等待时间

#### 2. 并发数限制

**错误信息**:
```
ResourceBusyError: 已达到最大并发数: 5
```

**解决方案**:
1. 等待其他任务完成
2. 调整 `max_concurrent_browsers` 配置
3. 分批执行任务

#### 3. 登录失败

**可能原因**:
- 密码错误
- 2FA密钥错误
- 账号被锁定
- 网络问题

**解决方案**:
1. 验证账号密码
2. 检查2FA密钥格式
3. 使用代理IP
4. 增加重试次数

#### 4. SheerID验证失败

**可能原因**:
- API Key无效
- 账号不符合资格
- 网络超时

**解决方案**:
1. 检查API Key配置
2. 确认账号资格
3. 增加超时时间
4. 使用重试机制

#### 5. 绑卡失败

**可能原因**:
- 卡信息错误
- 卡已达到使用上限
- 页面元素变化

**解决方案**:
1. 验证卡信息
2. 检查卡使用次数
3. 更新页面选择器
4. 增加延迟时间

### 日志查看

**Docker环境**:
```bash
# 查看后端日志
docker-compose logs -f backend

# 查看Celery日志
docker-compose logs -f celery

# 查看特定任务日志
docker-compose exec backend python manage.py shell
>>> from plugins.google_business.models import GoogleTask
>>> task = GoogleTask.objects.get(id=1)
>>> print(task.logs)
```

**Web界面**:
1. 访问 `/google/dashboard`
2. 查看"活动时间线"
3. 点击任务查看详细日志

### 性能优化

#### 1. 调整并发数
```python
# 配置文件
GOOGLE_BUSINESS_CONFIG = {
    'max_concurrent_browsers': 5,  # 根据服务器性能调整
}
```

#### 2. 优化延迟参数
```python
# 减少不必要的等待时间
config = {
    'delays': {
        'after_offer': 2,      # 从3秒减少到2秒
        'after_add_card': 1,   # 从2秒减少到1秒
        'after_save': 3,       # 从5秒减少到3秒
    }
}
```

#### 3. 使用批量操作
```python
# 批量导入账号
accounts = [...]  # 100个账号
batch_import(accounts)  # 一次性导入

# 批量验证SheerID
links = [...]  # 最多5个链接
verify_batch(links)  # 批量验证
```

---

## 附录

### 状态说明

#### 账号状态
- `pending_check`: 待检查 - 新导入的账号
- `link_ready`: 链接就绪 - 有资格，待验证
- `verified`: 已验证 - SheerID验证完成
- `subscribed`: 已订阅 - 绑卡成功
- `ineligible`: 无资格 - 不符合学生优惠条件

#### 任务状态
- `pending`: 待执行 - 任务已创建
- `running`: 执行中 - 任务正在运行
- `paused`: 已暂停 - 任务被暂停
- `completed`: 已完成 - 任务成功完成
- `failed`: 已失败 - 任务执行失败
- `cancelled`: 已取消 - 任务被取消

### 任务类型
- `login`: 登录任务
- `extract_link`: 获取链接任务
- `verify`: SheerID验证任务
- `bind_card`: 绑卡任务
- `auto_all`: 一键全自动任务

---

**文档维护**: Auto All System Team  
**最后更新**: 2026-01-19  
**版本**: v1.0

