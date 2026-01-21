# 比特浏览器 API 集成

## 📋 概述

本模块提供完整的比特浏览器（BitBrowser）Local API 封装，是系统中所有浏览器自动化操作的基础。

## 📁 文件结构

```
bitbrowser/
├── __init__.py         # 导出主要类
├── api.py             # 完整 API 封装
├── models.py          # 数据模型
├── admin.py           # Admin 配置
└── migrations/        # 数据库迁移
```

## 🚀 快速使用

### Django 环境

```python
from apps.integrations.bitbrowser import BitBrowserAPI, BitBrowserManager

# 使用 API 客户端
api = BitBrowserAPI()

# 健康检查
if api.health_check():
    print("✅ 连接成功")

# 获取浏览器列表
browsers = api.list_browsers(page=0, page_size=10)

# 打开浏览器
result = api.open_browser(browser_id, queue=True)
ws_endpoint = result['data']['ws']
```

### 外部脚本

项目根目录提供了兼容层 `bitbrowser_api.py`，外部脚本可直接导入：

```python
from bitbrowser_api import BitBrowserAPI, BitBrowserManager

api = BitBrowserAPI()
```

## 📚 主要功能

### BitBrowserAPI

完整封装比特浏览器所有 API 接口：

- **分组管理**: `list_groups()`, `add_group()`, `update_group()`, `delete_group()`
- **浏览器管理**: `create_browser()`, `open_browser()`, `close_browser()`, `delete_browser()`
- **代理管理**: `update_browsers_proxy()`, `check_proxy()`
- **Cookie管理**: `get_browser_cookies()`, `set_browser_cookies()`, `clear_browser_cookies()`
- **进程管理**: `get_browser_pids()`, `get_all_browser_pids()`
- **批量操作**: `delete_browsers_batch()`, `close_all_browsers()`

### BitBrowserManager

提供更高级的业务封装：

- `create_profile_simple()` - 简化创建浏览器
- `open_and_get_ws()` - 打开并获取 WebSocket 地址
- `batch_create_browsers()` - 批量创建浏览器
- `get_all_browsers()` - 获取所有浏览器（自动翻页）
- `find_browser_by_name()` - 按名称查找浏览器

## ⚠️ 重要规范

### 统一请求方式

比特浏览器 API 的所有接口统一使用：

- ✅ **请求方式**: `POST`
- ✅ **传参方式**: `JSON Body`
- ❌ **不支持**: URL 参数、FormData

```python
# ✅ 正确
api._request('browser/list', {'page': 0, 'pageSize': 10})

# ❌ 错误
requests.get("http://127.0.0.1:54345/browser/list?page=0")
```

### 响应格式

```json
{
    "success": true,
    "data": { /* 返回数据 */ },
    "msg": "错误信息"  // 仅失败时返回
}
```

## 🔗 相关文档

- [04-API接口文档.md - 第10章](../../../文档/04-API接口文档.md#10-比特浏览器api集成) - API 使用指南
- [17-比特浏览器API完整开发指南.md](../../../文档/17-比特浏览器API完整开发指南.md) - 详细开发文档
- [16-比特浏览器Docker集成.md](../../../文档/16-比特浏览器Docker集成.md) - Docker 部署指南

## 🛠️ 配置

### Django Settings

```python
# settings/base.py
BITBROWSER_API_URL = "http://127.0.0.1:54345"

# Docker 环境
BITBROWSER_API_URL = "http://host.docker.internal:54345"
```

### 环境变量

```bash
# .env
BITBROWSER_API_URL=http://127.0.0.1:54345
```

## 📝 使用示例

### 创建并打开浏览器

```python
from apps.integrations.bitbrowser import BitBrowserManager

manager = BitBrowserManager()

# 创建浏览器
browser_id = manager.create_profile_simple(
    name="测试账号",
    platform="PC",
    os="Win32",
    core_version="130",
    proxy={
        'type': 'socks5',
        'host': '1.2.3.4',
        'port': 1080,
        'username': 'user',
        'password': 'pass'
    }
)

# 打开并获取连接地址
ws_endpoint = manager.open_and_get_ws(browser_id)
print(f"WebSocket: {ws_endpoint}")

# 使用 Playwright 连接
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(ws_endpoint)
    page = browser.contexts[0].pages[0]
    page.goto("https://www.google.com")
    browser.close()

# 清理
manager.cleanup(browser_id, delete_profile=True)
```

## 🔍 错误处理

```python
from apps.integrations.bitbrowser import BitBrowserAPIError

try:
    result = api.open_browser(browser_id)
except BitBrowserAPIError as e:
    if "正在打开中" in str(e):
        # 重置状态
        api.reset_browser_closing_status(browser_id)
        time.sleep(2)
        # 重试
        result = api.open_browser(browser_id)
    else:
        raise
```

## 🐳 Docker 部署

本模块支持 Docker 部署，详见主项目的 `docker-compose.yml`。

关键配置：

```yaml
environment:
  - BITBROWSER_API_URL=http://host.docker.internal:54345
```

---

**维护者**: Auto All System Team  
**更新日期**: 2026-01-18

