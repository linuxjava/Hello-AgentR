## Context

- **现状**：`frontend-admin` 仅有占位 `HomePage` 与通配路由，无登录页、无 token、无门禁；后端 `/admin/auth/login` 与 `/admin/auth/me` 已可用。
- **约束**：Token 存 localStorage（ADR-0002）；身份与 EndUser 隔离（ADR-0001）；行为对齐 `docs/frontend-admin/版本迭代/v0.1/prd.md`、`ixd.md`（P-01）与 Pencil 登录帧。
- **干系人**：前端管理端实现；依赖后端 V0.1 Admin Auth，不改后端。

## Goals / Non-Goals

**Goals:**

- 交付可验收的登录页（默认态 / 错误态）与记住用户名
- 建立最小会话：登录写 token、`me` 校验、路由门禁、登录成功落地首页
- UI 结构对齐 Pencil（品牌卡、字段、主按钮、页内错误条），样式可换皮

**Non-Goals:**

- 完整 Admin Shell、账号治理、改己密模态
- Cookie 会话、验证码、锁定策略
- 后端契约变更

## Decisions

### D1：会话状态放在客户端 store + localStorage

- **选择**：Zustand（或等价）持有 `token` / `profile`；token 持久化到 localStorage；应用启动或进入受保护路由时调用 `me`。
- **理由**：工程已依赖 zustand；与 ADR-0002 一致；后续壳层可复用同一 session。
- **备选**：仅 Context + 每次读 storage → 跨页同步与测试成本更高。

### D2：HTTP 客户端统一注入 Authorization

- **选择**：单一 API client（fetch 封装即可）；请求头带 token；响应宏观码 `A000001` 时清会话并跳转 `/login`。
- **理由**：为后续壳层/账号 API 复用；登录页本身也依赖统一错误解析。
- **备选**：登录页单独 fetch → 后续重复造轮子。

### D3：表单用 react-hook-form + zod

- **选择**：字段校验与提交态由 RHF + zod；业务错误（如 `A001001`）映射到页内错误条（IXD H-02）。
- **理由**：依赖已在 `package.json`；与后续创建/编辑表单一致。
- **备选**：受控组件手写校验 → 重复劳动。

### D4：路由结构

- **选择**：
  - `/login` → `LoginPage`（匿名；已登录则重定向 `/`）
  - `/` → 现有 `HomePage`（受保护；未登录重定向 `/login`）
  - 通配：未匹配走受保护或统一 404 策略，本变更至少保证 `*` 不绕过门禁
- **理由**：最小改动承接「登录成功 → 首页占位」；完整壳层路由另案。

### D5：记住用户名独立存储键

- **选择**：例如 `admin.rememberedUsername`；仅在勾选且登录成功时写入；未勾选则清除该键。
- **理由**：与 token 解耦；登出后仍可预填（PRD AC-F003/AC-F004）。

## 组件层级图

```text
App
└── RouterProvider
    ├── /login → LoginPage
    │     ├── Brand / Card（对齐 Pencil）
    │     ├── LoginForm（RHF：username, password, remember）
    │     ├── ErrorBanner（业务失败，H-02）
    │     └── SubmitButton（loading）
    └── /（及受保护子树）→ RequireAuth
          └── HomePage（本变更仅作落地占位，不实现完整壳）
```

**会话模块（非路由）**

```text
sessionStore (zustand)
authApi.login / authApi.me
storage: token key + remembered username key
apiClient (Authorization + A000001 处理)
```

## API 端点规范（本变更消费）

| 方法 | 路径 | 鉴权 | 用途 |
| ---- | ---- | ---- | ---- |
| POST | `/admin/auth/login` | 匿名 | 换取 `token` + `profile` |
| GET | `/admin/auth/me` | `Authorization: <token>` | 启动/门禁校验当前账号 |

**登录成功 `data`（契约摘要）**

- `token: string`
- `profile: { id, username, role, bootstrap, createdAt }`

**登录失败**：`A001001`「用户名或密码错误」→ 页内错误条，不写 token。

**me 失败 / 未登录码 `A000001`**：清本地会话 → `/login`。

> 完整字段与示例见 `docs/backend/api.md` §1.1 / §1.3；上下文路径以运行环境配置为准（文档示例含 `/hello-agent`）。

## Risks / Trade-offs

| 风险 | 缓解 |
| ---- | ---- |
| XSS 可窃取 localStorage token | 依赖卫生；后续 CSP；改密踢全端（后端已支持）；本变更不引入 Cookie |
| 首页仍无壳层，登录后体验不完整 | 明确本变更仅落地页占位；壳层另开 change |
| `me` 与登录竞态 | 门禁等待 session hydrate 完成后再渲染受保护内容 |
| 前后端路径前缀不一致 | 通过 env（如 `VITE_API_BASE_URL`）配置，不在代码写死主机 |

## Migration Plan

1. 合并前端变更；配置 API base URL 指向可用后端
2. 使用 Bootstrap `admin` / `admin@123456` 手工验收登录闭环
3. **回滚**：还原提交并清除本地 token 键即可；无 DB 迁移

## Open Questions

- [ ] 首页在壳层变更前是否展示临时「已登录」提示（非 PRD 要求；实现可选）
- [ ] 密码输入框是否提供显示/隐藏切换（IXD 未强制；MAY）
