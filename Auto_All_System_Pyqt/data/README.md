# Data 目录说明

本目录包含应用程序运行所需的数据文件和配置文件。

---

## 📁 文件说明

### 输入文件（需要手动准备）

#### accounts.txt
**用途**: 存储 Google 账号信息

**格式**: `email----password----recovery_email----2fa_secret`

**示例**:
```
user1@gmail.com----MyPassword123----backup1@gmail.com----JBSWY3DPEHPK3PXP
user2@gmail.com----MyPassword456----backup2@gmail.com----HXDMVJECJJWSRB3H
```

**说明**:
- 用 `----` 分隔四个字段
- 每行一个账号
- 2FA 密钥是 16 位字符的 TOTP secret

---

#### proxies.txt
**用途**: 存储代理服务器信息

**格式**: `proxy_type://username:password@host:port`

**示例**:
```
http://user1:pass1@proxy1.example.com:8080
socks5://user2:pass2@proxy2.example.com:1080
http://proxy3.example.com:8080
```

**支持的代理类型**:
- http
- https
- socks5

---

#### cards.txt
**用途**: 存储信用卡信息（用于绑卡订阅）

**格式**: `card_number|exp_month|exp_year|cvv`

**示例**:
```
4111111111111111|12|2025|123
5555555555554444|06|2026|456
3782822463100005|03|2027|789
```

**说明**:
- 用 `|` 分隔四个字段
- 卡号不要有空格
- 月份用两位数（01-12）
- 年份用四位数（2025）

---

#### sheerIDlink.txt
**用途**: 存储 SheerID 验证链接

**格式**: `email----verification_url`

**示例**:
```
user1@gmail.com----https://services.sheerid.com/verify/xxx
user2@gmail.com----https://services.sheerid.com/verify/yyy
```

**说明**:
- 此文件通常由程序自动生成
- 也可以手动准备用于批量验证

---

#### 2fa_codes.txt
**用途**: 存储临时 2FA 验证码（可选）

**格式**: `email----totp_code`

**示例**:
```
user1@gmail.com----123456
user2@gmail.com----789012
```

**说明**:
- 临时存储，通常不需要手动创建
- 程序会自动生成 TOTP 验证码

---

### 输出文件（程序自动生成）

#### 已绑卡号.txt
**说明**: 成功完成绑卡订阅的账号列表

**格式**: 与 `accounts.txt` 相同

---

#### 已验证未绑卡.txt
**说明**: 已通过 SheerID 验证但尚未绑卡的账号列表

**格式**: 与 `accounts.txt` 相同

---

#### 无资格号.txt
**说明**: 不符合 Google One 学生优惠资格的账号列表

**格式**: 与 `accounts.txt` 相同

---

#### 有资格待验证号.txt
**说明**: 有资格但尚未提交 SheerID 验证的账号列表

**格式**: 与 `accounts.txt` 相同

---

#### 超时或其他错误.txt
**说明**: 处理过程中失败的账号列表

**格式**: 与 `accounts.txt` 相同

**常见失败原因**:
- 网络超时
- 登录失败
- 页面加载错误
- 验证被拒绝

---

#### sheerID_verified_success.txt
**说明**: SheerID 验证成功的账号列表

**格式**: `email----verification_id`

---

#### sheerID_verified_failed.txt
**说明**: SheerID 验证失败的账号列表

**格式**: `email----error_message`

---

### 数据库文件

#### accounts.db
**说明**: SQLite 数据库，存储所有账号信息和状态

**表结构**:
```sql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    recovery_email TEXT,
    secret TEXT,
    browser_id TEXT,
    status TEXT DEFAULT 'pending',
    sheerid_link TEXT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**状态说明**:
- `pending` - 待处理
- `processing` - 处理中
- `verified` - 已验证
- `subscribed` - 已订阅
- `failed` - 失败
- `no_eligibility` - 无资格

---

### 配置文件

#### temp_config.json
**说明**: 临时配置文件，存储程序运行时的配置

**示例**:
```json
{
    "api_key": "your_api_key",
    "thread_count": 3,
    "cards_per_account": 3,
    "delays": {
        "after_login": 5,
        "after_get_link": 3,
        "after_verify": 5,
        "after_bind": 10
    }
}
```

---

#### requirements.txt
**说明**: Python 依赖包列表

**安装方法**:
```bash
pip install -r requirements.txt
```

---

#### accounts_example.txt
**说明**: 账号文件的示例模板

**用途**: 
- 参考格式
- 快速创建新的账号文件

---

## 📋 文件使用流程

### 准备阶段
1. 复制 `accounts_example.txt` 为 `accounts.txt`
2. 填写真实的账号信息
3. 准备 `proxies.txt`（可选但推荐）
4. 准备 `cards.txt`（如需绑卡）

### 运行阶段
1. 程序读取 `accounts.txt`、`proxies.txt`、`cards.txt`
2. 处理过程中更新 `accounts.db`
3. 生成 `sheerIDlink.txt`

### 完成阶段
1. 账号按处理结果分类保存到不同文件
2. `已绑卡号.txt` - 成功
3. `已验证未绑卡.txt` - 部分成功
4. `无资格号.txt`、`超时或其他错误.txt` - 失败

---

## ⚠️ 注意事项

### 安全性
- ✅ 密码和 2FA 密钥会在数据库中加密存储
- ✅ 不要将包含真实数据的文件提交到代码仓库
- ✅ 定期备份 `accounts.db` 和文本文件
- ⚠️ 不要分享 `accounts.txt` 和 `cards.txt`

### 文件编码
- **必须使用 UTF-8 编码**
- 推荐使用 VS Code、Notepad++ 等编辑器
- 避免使用 Windows 记事本（可能保存为 ANSI）

### 文件格式
- 确保使用正确的分隔符（`----` 或 `|`）
- 不要有多余的空格或空行
- 每行末尾不要有空格

### 备份建议
```bash
# 每天备份重要数据
copy accounts.db backup\accounts_20260119.db
copy accounts.txt backup\accounts_20260119.txt
copy cards.txt backup\cards_20260119.txt
```

---

## 🔧 常见问题

### Q: 如何批量导入账号？
**A**: 
1. 按格式准备 `accounts.txt`
2. 启动程序，数据会自动导入到数据库
3. 或运行 `python src/migrate_txt_to_db.py`

### Q: 如何导出账号？
**A**:
- 使用 SQLite 工具导出数据库
- 或使用程序的"导出"功能

### Q: 文件损坏怎么办？
**A**:
1. 从备份恢复
2. 如果数据库损坏，可以从文本文件重新导入

### Q: 可以修改文件名吗？
**A**:
- 输入文件名不要修改（程序硬编码了这些文件名）
- 输出文件名可以修改，但建议保持原样便于查找

---

## 📊 文件优先级

### 必需文件（没有会报错）
- `accounts.txt` - 账号信息

### 推荐文件（提升成功率）
- `proxies.txt` - 代理信息
- `cards.txt` - 卡片信息（如需绑卡）

### 可选文件（自动生成）
- 所有输出文件
- `sheerIDlink.txt`
- `temp_config.json`

---

## 🆘 获取帮助

详细使用说明请参考：
- [快速开始文档](../docs/快速开始.md)
- [功能说明文档](../docs/功能说明.md)
- [常见问题文档](../docs/常见问题.md)

---

**最后更新**: 2026-01-19  
**维护者**: Auto All System Team

