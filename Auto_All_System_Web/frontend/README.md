# Auto All System - Frontend

这是 Auto All System 的前端项目，使用 Vue 3 + TypeScript + Vite + Element Plus 构建。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由
- **Pinia** - Vue 3 状态管理
- **Element Plus** - Vue 3 UI 组件库
- **Axios** - HTTP 客户端
- **Sass** - CSS 预处理器

## 项目结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── layouts/        # 布局组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── index.html          # HTML 模板
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README.md           # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 环境变量

创建 `.env.local` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 主要功能模块

### 1. 用户认证
- 登录/注册
- Token 管理
- 权限控制

### 2. 专区管理
- 专区列表
- 专区详情
- 专区配置

### 3. 任务中心
- 任务列表
- 创建任务
- 任务详情
- 任务日志

### 4. 虚拟卡管理
- 我的虚拟卡
- 公共卡池
- 添加/删除虚拟卡

### 5. 余额管理
- 账户余额
- 充值功能
- 交易记录

### 6. 个人中心
- 基本信息
- 修改密码
- API 密钥管理

## API 接口

所有 API 请求通过 `src/api/` 目录下的模块进行：

- `auth.ts` - 认证相关
- `zones.ts` - 专区管理
- `tasks.ts` - 任务管理
- `cards.ts` - 虚拟卡管理
- `balance.ts` - 余额管理

## 状态管理

使用 Pinia 进行状态管理：

- `user.ts` - 用户状态

## 路由配置

路由配置在 `src/router/index.ts`，包括：

- 公开路由（登录、注册）
- 需要认证的路由（主要功能）
- 路由守卫（认证检查）

## 样式规范

- 使用 SCSS 编写样式
- 使用 scoped 作用域
- 遵循 BEM 命名规范

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 TypeScript 进行类型检查
- 组件使用 `<script setup>` 语法

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 注意事项

1. 确保后端 API 服务已启动
2. 配置正确的 API 地址
3. 开发时注意跨域问题
4. 生产环境需要配置 Nginx 反向代理

## 相关文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

