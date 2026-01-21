# 比特浏览器自动化管理工具

一个基于 PyQt6 的桌面应用程序，用于管理比特浏览器和自动化处理 Google One 学生优惠。

---

## 📋 功能概览

### 🎯 核心功能

1. **比特浏览器窗口管理**
   - 批量创建浏览器窗口
   - 查看和管理现有窗口
   - 批量删除窗口
   - 自动配置代理和账号

2. **一键全自动处理**
   - Google 账号自动登录
   - 学生优惠资格检测
   - SheerID 验证提交
   - 自动绑卡订阅
   - 支持并发处理多个账号

3. **SheerID 验证**
   - 批量提交验证请求
   - 自动轮询验证状态
   - 支持自定义线程数

4. **绑卡订阅**
   - 自动填写信用卡信息
   - 完成 Google One 订阅
   - 一卡多绑功能
   - 详细的处理日志

5. **账号管理**
   - 导入/导出账号信息
   - 账号状态跟踪
   - SQLite 数据库存储

---

## 📁 项目结构

```
Auto_All_System_Pyqt/
├── src/                          # 源代码目录
│   ├── auto_all_in_one_gui.py    # 一键全自动处理界面
│   ├── bind_card_gui.py          # 绑卡订阅界面
│   ├── sheerid_gui.py            # SheerID验证界面
│   ├── create_window_gui.py      # 窗口管理主界面
│   ├── account_manager.py        # 账号管理
│   ├── database.py               # 数据库操作
│   ├── bit_api.py                # 比特浏览器API
│   ├── bitbrowser_api.py         # 比特浏览器API封装
│   ├── auto_bind_card.py         # 自动绑卡逻辑
│   ├── sheerid_verifier.py       # SheerID验证逻辑
│   └── run_playwright_google.py  # Playwright自动化脚本
├── data/                         # 数据目录
│   ├── accounts.txt              # 账号文件
│   ├── proxies.txt               # 代理文件
│   ├── cards.txt                 # 卡片文件
│   ├── sheerIDlink.txt           # SheerID链接
│   ├── accounts.db               # SQLite数据库
│   └── 2fa_codes.txt             # 2FA验证码
├── resources/                    # 资源文件
│   ├── app_icon.ico              # 应用图标
│   └── *.png                     # 截图和帮助图片
├── scripts/                      # 脚本目录
│   ├── 启动项目.bat              # 启动脚本
│   ├── BitBrowserAutoManager.spec  # PyInstaller配置
│   └── 比特浏览器窗口管理工具.spec # PyInstaller配置
├── dist/                         # 打包输出目录
└── docs/                         # 文档目录
    ├── README.md                 # 本文档
    ├── 快速开始.md               # 快速入门指南
    ├── 功能说明.md               # 详细功能说明
    └── 常见问题.md               # FAQ
```

---

## ⚙️ 系统要求

### 必需软件

- **Python**: 3.8 或更高版本
- **比特浏览器**: 需要运行比特浏览器并开启 API 接口
- **操作系统**: Windows 10/11（推荐）

### Python 依赖

主要依赖包：
- PyQt6 >= 6.0.0
- playwright >= 1.40.0
- requests >= 2.31.0
- pyotp >= 2.9.0
- aiohttp >= 3.9.0

完整依赖列表见 `data/requirements.txt`

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 进入项目目录
cd Auto_All_System_Pyqt

# 安装 Python 依赖
pip install -r data/requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

### 2. 配置比特浏览器

1. 启动比特浏览器
2. 打开设置，启用 API 接口
3. 默认端口：`http://127.0.0.1:54345`

### 3. 准备数据文件

在 `data/` 目录下准备以下文件：

#### accounts.txt（账号文件）
格式：`email----password----recovery_email----2fa_secret`

```
user1@gmail.com----pass123----backup1@gmail.com----ABCDEFGHIJKLMNOP
user2@gmail.com----pass456----backup2@gmail.com----QRSTUVWXYZABCDEF
```

#### proxies.txt（代理文件）
格式：`proxy_type://username:password@host:port`

```
http://user1:pass1@proxy1.com:8080
socks5://user2:pass2@proxy2.com:1080
```

#### cards.txt（卡片文件）
格式：`card_number|exp_month|exp_year|cvv`

```
4111111111111111|12|2025|123
5555555555554444|06|2026|456
```

### 4. 启动应用

#### 方式 A：使用启动脚本（推荐）
```bash
scripts/启动项目.bat
```

#### 方式 B：直接运行
```bash
cd src
python create_window_gui.py
```

---

## 📖 使用指南

详细的使用说明请参考：
- **[快速开始.md](./快速开始.md)** - 快速入门教程
- **[功能说明.md](./功能说明.md)** - 各功能详细说明
- **[常见问题.md](./常见问题.md)** - 常见问题解答

---

## 🔧 配置说明

### 比特浏览器 API 配置

默认配置：
```python
API_HOST = "http://127.0.0.1:54345"
```

如需修改，请编辑 `src/bit_api.py` 或 `src/bitbrowser_api.py`

### SheerID API 配置

在使用 SheerID 验证功能时，需要提供 API Key。
API 端点：`https://batch.1key.me`

---

## 📦 打包为可执行文件

### 使用 PyInstaller 打包

```bash
# 打包主程序
pyinstaller scripts/比特浏览器窗口管理工具.spec

# 打包完整版（包含所有功能）
pyinstaller scripts/BitBrowserAutoManager.spec

# 生成的可执行文件在 dist/ 目录
```

---

## 🎯 主要功能使用流程

### 一键全自动处理流程

```
1. 导入账号（accounts.txt）
   ↓
2. 导入卡片（cards.txt）
   ↓
3. 配置处理参数
   - SheerID API Key
   - 并发线程数
   - 一卡几绑
   - 延迟设置
   ↓
4. 点击"开始全自动处理"
   ↓
5. 系统自动完成：
   - 登录账号
   - 检测资格
   - SheerID 验证
   - 绑卡订阅
   ↓
6. 查看处理结果
```

---

## 📊 数据管理

### 数据库结构（SQLite）

**accounts 表**
- email: 邮箱
- password: 密码（加密存储）
- recovery_email: 备用邮箱
- secret: 2FA 密钥（加密存储）
- status: 状态（pending/verified/subscribed/failed）
- browser_id: 关联的浏览器窗口ID
- sheerid_link: SheerID 验证链接
- notes: 备注

### 数据导入导出

支持从文本文件导入，也支持导出为文本文件。
数据会自动同步到 SQLite 数据库。

---

## ⚠️ 注意事项

1. **安全性**
   - 账号密码和 2FA 密钥会加密存储
   - 不要将 `accounts.db` 分享给他人
   - 定期备份数据文件

2. **性能建议**
   - 并发线程数建议 3-5 个
   - 过多并发可能导致被检测为异常
   - 设置适当的延迟时间

3. **合法使用**
   - 仅用于管理自己的合法账号
   - 遵守相关服务条款
   - 不用于非法用途

---

## 🐛 故障排除

### 常见问题

1. **无法连接比特浏览器**
   - 确认比特浏览器已启动
   - 检查 API 端口是否正确
   - 确认 API 接口已启用

2. **Playwright 错误**
   - 运行 `playwright install chromium`
   - 检查网络连接
   - 查看详细错误日志

3. **登录失败**
   - 检查账号密码是否正确
   - 验证 2FA 密钥是否有效
   - 查看是否需要人工验证

更多问题请参考 **[常见问题.md](./常见问题.md)**

---

## 📝 开发说明

### 技术栈

- **GUI 框架**: PyQt6
- **浏览器自动化**: Playwright
- **数据库**: SQLite3
- **HTTP 客户端**: requests, aiohttp
- **2FA**: pyotp

### 代码风格

- 使用 Python 3.8+ 特性
- 遵循 PEP 8 编码规范
- 中文注释和文档字符串

---

## 📄 许可证

本项目遵循 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 支持

如有问题或建议，请：
1. 查看文档：[快速开始](./快速开始.md) | [功能说明](./功能说明.md) | [常见问题](./常见问题.md)
2. 查看日志输出
3. 提交 Issue

---

**最后更新**: 2026-01-19  
**版本**: 2.0.0  
**维护者**: Auto All System Team

