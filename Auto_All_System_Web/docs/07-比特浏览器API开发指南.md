# 比特浏览器API完整开发指南

> 版本: 2.1  
> 更新日期: 2026-01-18  
> 作者: Auto System Team  
> 更新内容: 新增第10章《从旧代码迁移到新API》

## 📋 目录

- [1. 概述](#1-概述)
- [2. API配置](#2-api配置)
- [3. 快速开始](#3-快速开始)
- [4. 核心接口](#4-核心接口)
- [5. 高级用法](#5-高级用法)
- [6. 最佳实践](#6-最佳实践)
- [7. 常见问题](#7-常见问题)
- [8. Playwright集成](#8-playwright集成)
- [9. 附录](#9-附录)
- [10. 从旧代码迁移到新API](#10-从旧代码迁移到新api)

---

## 1. 概述

### 1.1 关键特性

✅ **统一请求方式**: 所有接口使用 `POST` + `JSON Body` 传参  
✅ **完整接口覆盖**: 分组、窗口、代理、Cookie、指纹、RPA等  
✅ **类型安全**: 完整的类型提示和枚举  
✅ **错误处理**: 统一的异常处理机制  
✅ **高级封装**: 提供业务层便捷方法  

### 1.2 接口分类

| 分类 | 接口数量 | 说明 |
|------|---------|------|
| **健康检查** | 1 | 连接测试 |
| **分组管理** | 5 | CRUD操作 |
| **浏览器窗口** | 15+ | 创建、打开、关闭、查询、批量操作 |
| **代理管理** | 2 | 代理配置、检测 |
| **Cookie管理** | 4 | 设置、获取、清空、格式化 |
| **缓存管理** | 2 | 清理缓存 |
| **指纹管理** | 1 | 随机指纹 |
| **进程管理** | 4 | PID、端口查询 |
| **RPA任务** | 3 | 执行、停止、自动输入 |
| **工具函数** | 3 | 文件读取、显示器查询 |

---

## 2. API配置

### 2.1 基础配置

```python
# 方式1: 使用默认地址（本地开发）
from bitbrowser_complete_api import BitBrowserCompleteAPI

api = BitBrowserCompleteAPI()  # 默认 http://127.0.0.1:54345

# 方式2: 自定义地址
api = BitBrowserCompleteAPI(api_url="http://192.168.1.100:54345", timeout=60)

# 方式3: Docker环境（重要！）
api = BitBrowserCompleteAPI(api_url="http://host.docker.internal:54345")
```

### 2.2 Docker环境集成

#### 问题说明

比特浏览器运行在 Windows 宿主机（127.0.0.1:54345），Docker 容器如何访问？

#### 解决方案

使用 Docker Desktop 提供的特殊域名：`host.docker.internal:54345`

**技术说明**:
- Docker 容器的 `127.0.0.1` 指向容器自己
- `host.docker.internal` 自动解析为宿主机 IP（Docker Desktop 提供）
- 纯 API 调用，无需在容器内安装比特浏览器

#### Django Settings 配置

```python
# backend/config/settings/base.py

# 比特浏览器 API 配置
# Docker 环境下自动使用 host.docker.internal
_default_bitbrowser_host = 'host.docker.internal' if os.getenv('DJANGO_ENVIRONMENT') == 'docker' else '127.0.0.1'
BITBROWSER_API_URL = os.getenv('BITBROWSER_API_URL', f'http://{_default_bitbrowser_host}:54345')
```

#### Docker Compose 配置

```yaml
# docker-compose.yml

backend:
  environment:
    - DJANGO_ENVIRONMENT=docker
    - BITBROWSER_API_URL=http://host.docker.internal:54345

celery:
  environment:
    - DJANGO_ENVIRONMENT=docker
    - BITBROWSER_API_URL=http://host.docker.internal:54345
```

#### 验证配置

```bash
# 1. 检查环境变量
docker exec auto_all_system-backend-1 printenv | grep BITBROWSER
# 输出: BITBROWSER_API_URL=http://host.docker.internal:54345

# 2. 测试连接
docker exec auto_all_system-backend-1 python -c "
from apps.integrations.bitbrowser.api import BitBrowserAPI
api = BitBrowserAPI()
result = api.list_browsers(page=0, page_size=3)
print(f'成功获取 {len(result.get(\"list\", []))} 个浏览器配置')
"
```

#### 故障排除

| 问题 | 检查 | 解决 |
|------|------|------|
| Connection Refused | 比特浏览器未运行 | 启动比特浏览器 |
| Timeout | 防火墙阻止 | 添加防火墙规则 |
| 配置未生效 | 环境变量错误 | 重启容器 |

**防火墙规则（如需要）**:
```powershell
# 管理员 PowerShell
netsh advfirewall firewall add rule name="BitBrowser Docker" dir=in action=allow protocol=TCP localport=54345
```

**确保比特浏览器运行**:
```powershell
netstat -ano | findstr 54345
```

### 2.3 Django集成

```python
# settings/base.py
BITBROWSER_API_URL = "http://127.0.0.1:54345"

# 使用
from django.conf import settings
from bitbrowser_complete_api import BitBrowserCompleteAPI

api = BitBrowserCompleteAPI(api_url=settings.BITBROWSER_API_URL)
```

### 2.3 枚举类型

```python
from bitbrowser_complete_api import ProxyType, ProxyMethod, IPCheckService

# 代理类型
ProxyType.NO_PROXY  # "noproxy"
ProxyType.HTTP      # "http"
ProxyType.HTTPS     # "https"
ProxyType.SOCKS5    # "socks5"
ProxyType.SSH       # "ssh"

# 代理方式
ProxyMethod.CUSTOM      # 2 (自定义)
ProxyMethod.EXTRACT_IP  # 3 (提取IP)

# IP查询服务
IPCheckService.IP123IN    # "ip123in"
IPCheckService.IP_API     # "ip-api"
IPCheckService.LUMINATI   # "luminati"
```

---

## 3. 快速开始

### 3.1 基础操作流程

```python
from bitbrowser_complete_api import BitBrowserCompleteAPI

# 1. 初始化API
api = BitBrowserCompleteAPI()

# 2. 健康检查
if not api.health_check():
    print("❌ 比特浏览器未连接")
    exit(1)

print("✅ 比特浏览器连接成功")

# 3. 创建浏览器窗口
result = api.create_browser(
    name="测试窗口_001",
    browser_fingerprint={
        "coreVersion": "130",
        "ostype": "PC",
        "os": "Win32",
        "osVersion": "11,10"
    }
)

browser_id = result['data']['id']
print(f"✅ 创建成功，窗口ID: {browser_id}")

# 4. 打开浏览器
open_result = api.open_browser(browser_id, queue=True)
ws_endpoint = open_result['data']['ws']
http_endpoint = open_result['data']['http']

print(f"WebSocket: {ws_endpoint}")
print(f"HTTP: {http_endpoint}")

# 5. 等待用户操作...
input("按回车键关闭浏览器...")

# 6. 关闭浏览器
api.close_browser(browser_id)
print("✅ 浏览器已关闭")
```

### 3.2 使用高级管理器

```python
from bitbrowser_complete_api import BitBrowserManager

# 1. 初始化管理器
manager = BitBrowserManager()

# 2. 简化创建
browser_id = manager.create_browser_simple(
    name="简易窗口",
    platform="PC",
    os="Win32",
    core_version="130",
    proxy={
        "type": "socks5",
        "host": "1.2.3.4",
        "port": 1080,
        "username": "user",
        "password": "pass"
    }
)

# 3. 打开并获取WS地址
ws_endpoint = manager.open_and_get_ws(browser_id)

# 4. 使用Playwright连接
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(ws_endpoint)
    page = browser.contexts[0].pages[0]
    
    page.goto("https://www.google.com")
    print(f"标题: {page.title()}")
    
    # 操作完成
    browser.close()

# 5. 安全关闭并删除
manager.safe_close_and_delete(browser_id, wait_seconds=5)
```

---

## 4. 核心接口

### 4.1 分组管理

#### 查询分组列表

```python
# 获取所有分组
result = api.list_groups(page=0, page_size=100, all_groups=True)
groups = result['data']['list']

for group in groups:
    print(f"分组: {group['groupName']} (ID: {group['id']})")
```

#### 添加分组

```python
result = api.add_group(group_name="Google账号组", sort_num=1)
group_id = result['data']['id']
print(f"新分组ID: {group_id}")
```

#### 修改分组

```python
api.edit_group(
    group_id="41notc1202sr8gu5o6emb9ihaqbzbkic",
    group_name="Google账号组（已验证）",
    sort_num=1
)
```

#### 删除分组

```python
api.delete_group(group_id="41notc1202sr8gu5o6emb9ihaqbzbkic")
```

### 4.2 浏览器窗口管理

#### 创建窗口（完整配置）

```python
result = api.create_browser(
    name="Google账号_001",
    group_id="xxx-group-id-xxx",
    
    # 指纹配置
    browser_fingerprint={
        "coreVersion": "130",        # Chrome 130
        "ostype": "PC",              # PC/Android/IOS
        "os": "Win32",               # Win32/MacIntel/Linux x86_64
        "osVersion": "11,10",        # Windows 11或10
        "version": "130",            # 浏览器版本
        "userAgent": "",             # 留空自动生成
        
        # 时区（基于IP自动生成）
        "isIpCreateTimeZone": True,
        
        # 地理位置（基于IP自动生成）
        "isIpCreatePosition": True,
        
        # 语言（基于IP自动生成）
        "isIpCreateLanguage": True,
        
        # 窗口尺寸
        "openWidth": 1280,
        "openHeight": 720,
        
        # 分辨率
        "resolutionType": "0",       # 0跟随电脑, 1自定义
        
        # 指纹随机选项
        "canvas": "0",               # 0随机, 1关闭
        "webGL": "0",                # 0随机, 1关闭
        "audioContext": "0",         # 0随机, 1关闭
    },
    
    # 代理配置
    proxy_config={
        "type": "socks5",
        "host": "1.2.3.4",
        "port": 1080,
        "username": "user",
        "password": "pass",
        "ipCheckService": "ip123in"
    },
    
    # 账户信息
    userName="user@gmail.com",
    password="password123",
    faSecretKey="JBSWY3DPEHPK3PXP",  # 2FA密钥
    
    # 平台信息
    platform="https://www.google.com",
    url="https://mail.google.com,https://drive.google.com",  # 额外URL
    
    # 备注
    remark="测试账号 - 已验证",
    
    # 同步选项
    syncTabs=True,
    syncCookies=True,
    syncBookmarks=False,
    
    # 启动前清理
    clearCacheFilesBeforeLaunch=False,
    clearCookiesBeforeLaunch=False,
)

browser_id = result['data']['id']
```

#### 批量修改窗口字段

```python
# 批量修改名称和备注
api.update_browser_partial(
    browser_ids=["id1", "id2", "id3"],
    update_fields={
        "name": "批量重命名",
        "remark": "批量备注",
        "platform": "https://www.facebook.com"
    }
)
```

#### 打开窗口（高级选项）

```python
result = api.open_browser(
    browser_id="xxx",
    
    # 启动参数
    args=[
        "--incognito",                             # 无痕模式
        "--remote-debugging-address=0.0.0.0",     # 局域网访问
        # "--headless",                            # 无头模式
        # "--load-extension=/path/to/ext1,/path/to/ext2"  # 加载扩展
    ],
    
    queue=True,              # 队列方式打开（防止并发错误）
    ignore_default_urls=False,  # 不忽略已同步URL
)

# 获取连接信息
data = result['data']
ws = data['ws']              # WebSocket地址
http = data['http']          # HTTP地址
driver = data['driver']      # ChromeDriver路径
pid = data['pid']            # 进程PID
```

#### 查询窗口列表（高级过滤）

```python
# 基础查询
result = api.list_browsers(page=0, page_size=50)

# 按分组查询
result = api.list_browsers(group_id="xxx-group-id-xxx")

# 按名称模糊查询
result = api.list_browsers(name="Google")

# 按序号范围查询
result = api.list_browsers(min_seq=1000, max_seq=2000, sort="desc")

# 按备注精确查询
result = api.list_browsers(remark="已验证")

# 提取数据
browsers = result['data']['list']
for browser in browsers:
    print(f"{browser['seq']} | {browser['name']} | {browser['id']}")
```

#### 批量操作

```python
# 批量删除
api.delete_browsers_batch(["id1", "id2", "id3"])

# 批量关闭（按序号）
api.close_browsers_by_seqs([1001, 1002, 1003])

# 关闭所有窗口
api.close_all_browsers()

# 批量修改分组
api.update_browsers_group(
    browser_ids=["id1", "id2"],
    group_id="new-group-id"
)

# 批量修改备注
api.update_browsers_remark(
    browser_ids=["id1", "id2"],
    remark="新备注"
)
```

### 4.3 代理管理

#### 批量修改代理

```python
api.update_browsers_proxy(
    browser_ids=["id1", "id2", "id3"],
    proxy_config={
        "proxyMethod": 2,           # 2=自定义, 3=提取IP
        "proxyType": "socks5",      # http/https/socks5/ssh
        "host": "proxy.example.com",
        "port": 1080,
        "proxyUserName": "user",
        "proxyPassword": "pass",
        "ipCheckService": "ip123in"
    }
)
```

#### 代理检测

```python
result = api.check_proxy(
    host="1.2.3.4",
    port=1080,
    proxy_type="socks5",
    proxy_username="user",
    proxy_password="pass",
    ip_check_service="ip123in",
    check_exists=1  # 检查IP是否已使用
)

# 获取IP信息
data = result['data']['data']
print(f"IP: {data['ip']}")
print(f"国家: {data['countryName']}")
print(f"城市: {data['city']}")
print(f"时区: {data['timeZone']}")
print(f"经纬度: {data['latitude']}, {data['longitude']}")
```

### 4.4 Cookie管理

#### 设置Cookie

```python
cookies = [
    {
        "name": "session_id",
        "value": "abc123xyz",
        "domain": ".google.com",
        "path": "/",
        "expires": 1766633932,
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "user_token",
        "value": "token_value",
        "domain": ".google.com",
        "path": "/"
    }
]

api.set_browser_cookies(browser_id="xxx", cookies=cookies)
```

#### 获取Cookie

```python
result = api.get_browser_cookies(browser_id="xxx")
cookies = result['data']

for cookie in cookies:
    print(f"{cookie['name']} = {cookie['value']}")
```

#### 清空Cookie

```python
# 清空所有Cookie（包括云端）
api.clear_browser_cookies(browser_id="xxx", save_synced=False)

# 只清空本地Cookie（保留云端）
api.clear_browser_cookies(browser_id="xxx", save_synced=True)
```

#### 格式化Cookie

```python
# 格式化字符串Cookie
result = api.format_cookies(
    cookie="session=abc123; user=john",
    hostname=".example.com"
)

formatted_cookies = result['data']
```

### 4.5 窗口排列

#### 宫格排列

```python
api.arrange_windows(
    arrange_type="box",      # 宫格排列
    start_x=0,
    start_y=0,
    width=600,
    height=400,
    col=3,                   # 每行3个
    space_x=10,              # 横向间距10px
    space_y=10,              # 纵向间距10px
    order_by="asc",          # 按序号正序
    seqlist=[1001, 1002, 1003, 1004, 1005, 1006]
)
```

#### 对角线排列

```python
api.arrange_windows(
    arrange_type="diagonal",  # 对角线排列
    start_x=0,
    start_y=0,
    width=800,
    height=600,
    offset_x=50,              # 横向偏移50px
    offset_y=50,              # 纵向偏移50px
    order_by="desc",
    browser_ids=["id1", "id2", "id3"]
)
```

#### 自适应排列

```python
# 排列所有窗口
api.arrange_windows_flexable()

# 排列指定序号窗口
api.arrange_windows_flexable(seqlist=[1001, 1002, 1003])
```

### 4.6 进程管理

```python
# 获取指定窗口的PID
result = api.get_browser_pids(["id1", "id2"])
pids = result['data']  # {"id1": 12345, "id2": 12346}

# 获取所有已打开窗口的PID
result = api.get_all_browser_pids()

# 获取活着的窗口PID（会检查进程）
result = api.get_alive_browser_pids(["id1", "id2"])

# 获取调试端口
result = api.get_browser_ports()
ports = result['data']  # {"id1": "64170", "id2": "64217"}
```

---

## 5. 高级用法

### 5.1 批量创建窗口

```python
from bitbrowser_complete_api import BitBrowserManager

manager = BitBrowserManager()

# 准备账号数据
accounts = [
    {"email": "user1@gmail.com", "password": "pass1", "remark": "测试1"},
    {"email": "user2@gmail.com", "password": "pass2", "remark": "测试2"},
    {"email": "user3@gmail.com", "password": "pass3", "remark": "测试3"},
]

# 准备代理数据（可选）
proxies = [
    {"type": "socks5", "host": "1.2.3.4", "port": 1080, "username": "u1", "password": "p1"},
    {"type": "socks5", "host": "1.2.3.5", "port": 1080, "username": "u2", "password": "p2"},
    {"type": "socks5", "host": "1.2.3.6", "port": 1080, "username": "u3", "password": "p3"},
]

# 模板配置
template = {
    "browserFingerPrint": {
        "coreVersion": "130",
        "ostype": "PC",
        "os": "Win32",
        "osVersion": "11,10"
    }
}

# 批量创建
browser_ids = manager.batch_create_browsers(
    accounts=accounts,
    template_config=template,
    proxies=proxies
)

print(f"✅ 成功创建 {len(browser_ids)} 个窗口")
```

### 5.2 结合Playwright自动化

```python
import asyncio
from playwright.async_api import async_playwright
from bitbrowser_complete_api import BitBrowserCompleteAPI

async def automate_task(browser_id: str):
    """使用Playwright自动化任务"""
    api = BitBrowserCompleteAPI()
    
    # 1. 打开浏览器
    result = api.open_browser(browser_id, queue=True)
    ws_endpoint = result['data']['ws']
    
    try:
        # 2. 连接Playwright
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(ws_endpoint)
            context = browser.contexts[0]
            page = context.pages[0] if context.pages else await context.new_page()
            
            # 3. 执行自动化任务
            await page.goto("https://www.google.com")
            await page.fill('input[name="q"]', "Python Playwright")
            await page.press('input[name="q"]', "Enter")
            await page.wait_for_load_state("networkidle")
            
            print(f"标题: {await page.title()}")
            
            # 4. 等待
            await asyncio.sleep(2)
            
    finally:
        # 5. 关闭浏览器
        api.close_browser(browser_id)

# 运行
asyncio.run(automate_task("your-browser-id"))
```

### 5.3 多线程批量操作

```python
import concurrent.futures
from bitbrowser_complete_api import BitBrowserCompleteAPI

def process_browser(browser_id: str):
    """处理单个浏览器"""
    api = BitBrowserCompleteAPI()
    
    try:
        # 打开
        result = api.open_browser(browser_id, queue=True)
        ws = result['data']['ws']
        
        # 你的自动化逻辑...
        print(f"✅ 处理完成: {browser_id}")
        
        # 关闭
        api.close_browser(browser_id)
        return True
        
    except Exception as e:
        print(f"❌ 处理失败: {browser_id} - {e}")
        return False

# 批量处理
browser_ids = ["id1", "id2", "id3", "id4", "id5"]

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(process_browser, browser_ids))

success_count = sum(results)
print(f"成功: {success_count}/{len(browser_ids)}")
```

### 5.4 异常恢复机制

```python
from bitbrowser_complete_api import BitBrowserCompleteAPI, BitBrowserAPIError
import time

api = BitBrowserCompleteAPI()

def safe_open_browser(browser_id: str, max_retries: int = 3):
    """安全打开浏览器（含重试）"""
    for attempt in range(max_retries):
        try:
            result = api.open_browser(browser_id, queue=True)
            return result['data']['ws']
            
        except BitBrowserAPIError as e:
            if "正在打开中" in str(e) or "关闭中" in str(e):
                # 重置状态
                print(f"⚠️ 状态异常，重置中...")
                api.reset_browser_closing_status(browser_id)
                time.sleep(2)
                
            if attempt < max_retries - 1:
                print(f"🔄 重试 {attempt + 1}/{max_retries}")
                time.sleep(3)
            else:
                raise
    
    return None
```

---

## 6. 最佳实践

### 6.1 创建窗口

✅ **推荐做法**:
- 使用 `queue=True` 防止并发错误
- 指纹配置留空让系统自动生成（更自然）
- 使用 `isIpCreateTimeZone`、`isIpCreateLanguage` 等自动根据IP生成
- Windows系统使用 `coreVersion="130"` 或更高版本

❌ **避免做法**:
- 不要在短时间内创建大量窗口（建议间隔1秒）
- 不要使用已过时的内核版本（109以下）
- Win7/Win8不要使用109及以上内核

### 6.2 打开窗口

✅ **推荐做法**:
```python
# 队列方式打开
result = api.open_browser(browser_id, queue=True)

# 无头模式需要清空URL
result = api.open_browser(
    browser_id,
    args=["--headless"],
    ignore_default_urls=True
)
```

❌ **避免做法**:
- 不要同时打开大量窗口（容易OOM）
- 关闭窗口后不要立即删除或重新打开（等待5秒）

### 6.3 代理配置

✅ **推荐做法**:
```python
# 测试代理可用性
result = api.check_proxy(
    host="proxy.com",
    port=1080,
    proxy_type="socks5",
    proxy_username="user",
    proxy_password="pass"
)

if result['data']['status'] == 1:
    # 代理可用，配置到窗口
    api.update_browsers_proxy([browser_id], {...})
```

### 6.4 Cookie管理

✅ **推荐做法**:
```python
# 获取标准格式Cookie
result = api.get_browser_cookies(browser_id)
cookies = result['data']

# 保存到文件
import json
with open('cookies.json', 'w') as f:
    json.dump(cookies, f)

# 下次使用时恢复
with open('cookies.json', 'r') as f:
    cookies = json.load(f)
    api.set_browser_cookies(browser_id, cookies)
```

### 6.5 资源清理

✅ **推荐做法**:
```python
try:
    # 打开并使用浏览器
    result = api.open_browser(browser_id)
    # ... 你的逻辑 ...
    
finally:
    # 确保关闭
    api.close_browser(browser_id)
    
    # 等待进程退出
    import time
    time.sleep(5)
    
    # 可选: 清理缓存
    api.clear_browser_cache([browser_id])
```

---

## 7. 常见问题

### Q1: 如何在Docker中使用？

```python
# Docker环境使用 host.docker.internal
api = BitBrowserCompleteAPI(api_url="http://host.docker.internal:54345")

# 健康检查
if api.health_check():
    print("✅ Docker环境连接成功")
```

### Q2: 如何处理"窗口正在打开中"错误？

```python
try:
    api.open_browser(browser_id)
except BitBrowserAPIError as e:
    if "正在打开中" in str(e):
        # 重置状态
        api.reset_browser_closing_status(browser_id)
        time.sleep(2)
        # 重试
        api.open_browser(browser_id)
```

### Q3: 如何获取窗口的2FA验证码？

```python
import pyotp

# 获取窗口详情
result = api.get_browser_detail(browser_id)
secret_key = result['data'].get('faSecretKey')

if secret_key:
    totp = pyotp.TOTP(secret_key)
    code = totp.now()
    print(f"2FA验证码: {code}")
```

### Q4: 如何批量查询窗口是否打开？

```python
# 方式1: 查询PID
result = api.get_alive_browser_pids(["id1", "id2", "id3"])
pids = result['data']

for browser_id, pid in pids.items():
    if pid:
        print(f"{browser_id} 已打开 (PID: {pid})")
    else:
        print(f"{browser_id} 未打开")

# 方式2: 查询所有已打开窗口
result = api.get_all_browser_pids()
opened_ids = result['data'].keys()
```

### Q5: 如何配置动态IP？

```python
api.update_browsers_proxy(
    browser_ids=[browser_id],
    proxy_config={
        "proxyMethod": 3,  # 提取IP
        "proxyType": "http",
        "dynamicIpUrl": "http://api.example.com/get_ip",
        "dynamicIpChannel": "common",
        "isDynamicIpChangeIp": True,  # 每次打开都提取新IP
        "duplicateCheck": 1  # 检测重复
    }
)
```

### Q6: 如何实现多显示器排列？

```python
# 1. 获取所有显示器
result = api.get_all_displays()
displays = result['data']

for display in displays:
    print(f"显示器{display['id']}: {display['label']}")
    print(f"  分辨率: {display['size']['width']}x{display['size']['height']}")

# 2. 排列到指定显示器
api.arrange_windows(
    arrange_type="box",
    start_x=0,
    start_y=0,
    width=600,
    height=400,
    col=3,
    screen_id=2  # 排列到第2个显示器
)
```

---

## 8. 完整示例

### 8.1 Google账号批量登录

```python
import asyncio
from playwright.async_api import async_playwright
from bitbrowser_complete_api import BitBrowserCompleteAPI

class GoogleAccountManager:
    def __init__(self):
        self.api = BitBrowserCompleteAPI()
    
    async def login_google(self, browser_id: str, email: str, password: str):
        """Google账号登录"""
        # 打开浏览器
        result = self.api.open_browser(browser_id, queue=True)
        ws = result['data']['ws']
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(ws)
                page = browser.contexts[0].pages[0]
                
                # 访问Google登录页
                await page.goto("https://accounts.google.com")
                
                # 输入邮箱
                await page.fill('input[type="email"]', email)
                await page.click('#identifierNext')
                await page.wait_for_timeout(2000)
                
                # 输入密码
                await page.fill('input[type="password"]', password)
                await page.click('#passwordNext')
                await page.wait_for_timeout(3000)
                
                # 检查是否登录成功
                if "myaccount.google.com" in page.url:
                    print(f"✅ {email} 登录成功")
                    return True
                else:
                    print(f"❌ {email} 登录失败")
                    return False
                    
        finally:
            self.api.close_browser(browser_id)
    
    async def batch_login(self, accounts: list):
        """批量登录"""
        for account in accounts:
            try:
                success = await self.login_google(
                    browser_id=account['browser_id'],
                    email=account['email'],
                    password=account['password']
                )
                
                if success:
                    # 更新备注
                    self.api.update_browsers_remark(
                        [account['browser_id']],
                        "已登录"
                    )
                    
                await asyncio.sleep(5)  # 间隔5秒
                
            except Exception as e:
                print(f"❌ {account['email']} 异常: {e}")

# 使用
manager = GoogleAccountManager()
accounts = [
    {"browser_id": "id1", "email": "user1@gmail.com", "password": "pass1"},
    {"browser_id": "id2", "email": "user2@gmail.com", "password": "pass2"},
]

asyncio.run(manager.batch_login(accounts))
```

---

## 9. 附录

### 9.1 常用指纹配置模板

#### Windows PC

```python
{
    "coreVersion": "130",
    "ostype": "PC",
    "os": "Win32",
    "osVersion": "11,10",
    "isIpCreateTimeZone": True,
    "isIpCreatePosition": True,
    "isIpCreateLanguage": True,
    "openWidth": 1280,
    "openHeight": 720,
    "resolutionType": "0",
    "canvas": "0",
    "webGL": "0",
    "audioContext": "0"
}
```

#### Mac PC

```python
{
    "coreVersion": "130",
    "ostype": "PC",
    "os": "MacIntel",
    "isIpCreateTimeZone": True,
    "isIpCreatePosition": True,
    "isIpCreateLanguage": True
}
```

#### Android

```python
{
    "coreVersion": "130",
    "ostype": "Android",
    "os": "Linux armv81",
    "osVersion": "14,13,12",
    "isIpCreateTimeZone": True,
    "isIpCreatePosition": True,
    "isIpCreateLanguage": True
}
```

### 9.2 API响应格式

```json
{
    "success": true,
    "data": {
        "id": "browser-id",
        ...
    }
}
```

失败响应:
```json
{
    "success": false,
    "msg": "错误信息"
}
```

---

## 10. 从旧代码迁移到新API

### 10.1 为什么要迁移？

**旧代码问题**:
- ❌ 直接使用 `requests.post()` 分散在各处
- ❌ 错误处理不统一
- ❌ 没有类型提示
- ❌ 代码重复，维护困难
- ❌ 缺少便捷的业务方法

**新API优势**:
- ✅ 统一的API封装 (`BitBrowserCompleteAPI`)
- ✅ 完整的类型提示和文档
- ✅ 统一的错误处理
- ✅ 高级业务封装 (`BitBrowserManager`)
- ✅ 更好的可维护性

### 10.2 迁移步骤

#### 步骤1: 导入新API

**旧代码**:
```python
import requests

url = "http://127.0.0.1:54345"
headers = {'Content-Type': 'application/json'}
```

**新代码**:
```python
from bitbrowser_complete_api import BitBrowserCompleteAPI, BitBrowserManager

# 创建API实例
api = BitBrowserCompleteAPI()
```

#### 步骤2: 替换基本操作

##### 查询浏览器列表

**旧代码**:
```python
response = requests.post(
    f"{url}/browser/list",
    json={'page': 0, 'pageSize': 10},
    headers=headers
)
data = response.json()
browsers = data.get('data', {}).get('list', [])
```

**新代码**:
```python
result = api.list_browsers(page=0, page_size=10)
browsers = result['data']['list']
```

##### 打开浏览器

**旧代码**:
```python
response = requests.post(
    f"{url}/browser/open",
    json={'id': browser_id},
    headers=headers
)
res = response.json()
```

**新代码**:
```python
result = api.open_browser(browser_id, queue=True)
ws = result['data']['ws']
```

##### 创建浏览器

**旧代码**:
```python
json_data = {
    'name': '测试',
    'browserFingerPrint': {
        'coreVersion': '130',
        'ostype': 'PC',
        'os': 'Win32'
    }
}
response = requests.post(
    f"{url}/browser/update",
    json=json_data,
    headers=headers
)
res = response.json()
browser_id = res['data']['id']
```

**新代码**:
```python
result = api.create_browser(
    name='测试',
    browser_fingerprint={
        'coreVersion': '130',
        'ostype': 'PC',
        'os': 'Win32'
    }
)
browser_id = result['data']['id']
```

##### 批量操作

**旧代码**:
```python
# 批量修改备注
json_data = {
    'ids': ['id1', 'id2'],
    'remark': '新备注'
}
response = requests.post(
    f"{url}/browser/update/partial",
    json=json_data,
    headers=headers
)
```

**新代码**:
```python
# 方法1: 使用专用方法
api.update_browsers_remark(['id1', 'id2'], '新备注')

# 方法2: 使用通用方法
api.update_browser_partial(['id1', 'id2'], {'remark': '新备注'})
```

### 10.3 实际项目迁移示例

#### 示例1: create_window.py 迁移

**旧代码** (部分):
```python
def get_browser_list(page=0, pageSize=50):
    response = requests.post(
        f"{url}/browser/list",
        json={'page': page, 'pageSize': pageSize},
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 200:
        res = response.json()
        if res.get('code') == 0:
            return res.get('data', {}).get('list', [])
    return []
```

**新代码**:
```python
from bitbrowser_complete_api import BitBrowserCompleteAPI

_api_instance = None

def get_api():
    """获取API实例（单例模式）"""
    global _api_instance
    if _api_instance is None:
        _api_instance = BitBrowserCompleteAPI()
    return _api_instance

def get_browser_list(page=0, pageSize=50):
    """获取所有窗口列表（使用新API）"""
    try:
        api = get_api()
        result = api.list_browsers(page=page, page_size=pageSize)
        
        if result['success']:
            data = result['data']
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return data.get('list', [])
        return []
    except Exception:
        return []
```

#### 示例2: bit_api.py 迁移

**旧代码**:
```python
def openBrowser(id):
    json_data = {"id": f'{id}'}
    res = requests.post(
        f"{url}/browser/open",
        json=json_data,
        headers=headers,
        timeout=30
    ).json()
    return res

def closeBrowser(id):
    json_data = {'id': f'{id}'}
    res = requests.post(
        f"{url}/browser/close",
        json=json_data,
        headers=headers,
        timeout=10
    ).json()
```

**新代码**:
```python
from bitbrowser_complete_api import BitBrowserCompleteAPI

api = BitBrowserCompleteAPI()

def openBrowser(id):
    """打开浏览器（使用新API）"""
    result = api.open_browser(id, queue=True)
    return result

def closeBrowser(id):
    """关闭浏览器（使用新API）"""
    result = api.close_browser(id)
    return result
```

### 10.4 错误处理迁移

**旧代码**:
```python
try:
    response = requests.post(url, json=data, headers=headers)
    res = response.json()
    if res.get('code') == 0 or res.get('success'):
        # 成功处理
        pass
    else:
        # 错误处理
        print(f"错误: {res.get('msg')}")
except requests.exceptions.Timeout:
    print("请求超时")
except Exception as e:
    print(f"异常: {e}")
```

**新代码**:
```python
from bitbrowser_complete_api import BitBrowserCompleteAPI, BitBrowserAPIError

api = BitBrowserCompleteAPI()

try:
    result = api.open_browser(browser_id)
    
    if result['success']:
        # 成功处理
        pass
    else:
        # 错误处理
        print(f"错误: {result.get('msg')}")
        
except BitBrowserAPIError as e:
    # 特定的API错误
    print(f"API错误: {e}")
    
    # 特殊处理某些错误
    if "正在打开中" in str(e) or "关闭中" in str(e):
        api.reset_browser_closing_status(browser_id)
        time.sleep(2)
        # 重试
        
except Exception as e:
    print(f"其他异常: {e}")
```

### 10.5 使用高级封装

**旧代码** (需要多次API调用):
```python
# 1. 查询所有浏览器
response = requests.post(f"{url}/browser/list", json={'page': 0, 'pageSize': 100})
browsers = response.json()['data']['list']

# 2. 按名称查找
target = None
for browser in browsers:
    if browser['name'] == '测试窗口':
        target = browser
        break

# 3. 按分组筛选
group_browsers = []
for browser in browsers:
    if browser.get('groupId') == group_id:
        group_browsers.append(browser)
```

**新代码** (使用 BitBrowserManager):
```python
from bitbrowser_complete_api import BitBrowserManager

manager = BitBrowserManager()

# 查询所有浏览器
browsers = manager.get_all_browsers()

# 按名称查找
target = manager.find_browser_by_name('测试窗口')

# 按分组查询
group_browsers = manager.get_browsers_by_group(group_id)
```

### 10.6 完整迁移对照表

| 功能 | 旧代码 | 新API方法 |
|------|--------|-----------|
| **查询列表** | `POST /browser/list` | `api.list_browsers()` |
| **打开窗口** | `POST /browser/open` | `api.open_browser()` |
| **关闭窗口** | `POST /browser/close` | `api.close_browser()` |
| **创建窗口** | `POST /browser/update` | `api.create_browser()` |
| **删除窗口** | `POST /browser/delete` | `api.delete_browser()` |
| **批量删除** | `POST /browser/delete/ids` | `api.delete_browsers_batch()` |
| **批量修改** | `POST /browser/update/partial` | `api.update_browser_partial()` |
| **修改备注** | `POST /browser/update/partial` | `api.update_browsers_remark()` |
| **修改分组** | `POST /browser/group/update` | `api.update_browsers_group()` |
| **修改代理** | `POST /browser/proxy/update` | `api.update_browsers_proxy()` |
| **查询分组** | `POST /group/list` | `api.list_groups()` |
| **添加分组** | `POST /group/add` | `api.add_group()` |
| **设置Cookie** | `POST /browser/cookies/set` | `api.set_browser_cookies()` |
| **获取Cookie** | `POST /browser/cookies/get` | `api.get_browser_cookies()` |
| **代理检测** | `POST /checkagent` | `api.check_proxy()` |
| **健康检查** | - | `api.health_check()` |

### 10.7 迁移检查清单

完成迁移后，请检查以下项目：

- [ ] 所有 `requests.post()` 调用已替换为新API方法
- [ ] 错误处理已更新为统一格式
- [ ] 导入了必要的模块 (`BitBrowserCompleteAPI`, `BitBrowserManager`)
- [ ] 测试所有关键功能是否正常工作
- [ ] 更新了代码注释和文档
- [ ] 检查是否可以使用 `BitBrowserManager` 简化代码
- [ ] 确认超时和重试逻辑仍然有效

### 10.8 常见迁移问题

#### 问题1: 响应格式不同

**旧代码** 期望 `code` 字段:
```python
if res.get('code') == 0:
    # 成功
```

**新API** 使用 `success` 字段:
```python
if result['success']:
    # 成功
```

#### 问题2: 批量操作参数

**旧代码**:
```python
json_data = {'ids': ['id1', 'id2'], 'remark': '备注'}
```

**新API** 自动处理:
```python
api.update_browsers_remark(['id1', 'id2'], '备注')
```

#### 问题3: 代理配置

**旧代码** 需要完整的JSON:
```python
json_data = {
    'proxyType': 'socks5',
    'host': '1.2.3.4',
    'port': 1080,
    'proxyUserName': 'user',
    'proxyPassword': 'pass'
}
```

**新API** 使用结构化参数:
```python
proxy_config = {
    'proxyType': 'socks5',
    'host': '1.2.3.4',
    'port': 1080,
    'proxyUserName': 'user',
    'proxyPassword': 'pass'
}
api.update_browsers_proxy(['id1'], proxy_config)
```

### 10.9 迁移测试

创建测试脚本验证迁移:

```python
"""测试迁移后的API功能"""
from bitbrowser_complete_api import BitBrowserCompleteAPI

def test_migration():
    api = BitBrowserCompleteAPI()
    
    # 1. 健康检查
    assert api.health_check(), "API连接失败"
    print("✅ 健康检查通过")
    
    # 2. 查询列表
    result = api.list_browsers(page=0, page_size=5)
    assert result['success'], "查询列表失败"
    print(f"✅ 查询到 {len(result['data']['list'])} 个窗口")
    
    # 3. 其他功能测试...
    print("✅ 所有测试通过")

if __name__ == "__main__":
    test_migration()
```

运行测试:
```bash
python test_migration.py
```

---

## 📞 支持

- 📧 Email: support@example.com
- 📖 文档: [完整文档地址]
- 🐛 问题反馈: [GitHub Issues]

---

**最后更新**: 2026-01-18  
**版本**: 2.1  
**维护者**: Auto System Team

