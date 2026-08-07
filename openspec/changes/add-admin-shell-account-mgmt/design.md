## Context

- **现状**：`frontend-admin` 已具备登录页、token/`me` 会话门禁与受保护首页占位；尚无侧栏/顶栏壳层、账号列表与治理模态。
- **依据**：行为对齐 `docs/frontend-admin/版本迭代/v0.1/prd.md`、`ixd.md`；**布局、组件结构、文案、视觉 token 以 Pencil《登录账号管理》为唯一视觉 SSOT**（帧 `P-02`、`P-03/H-01`、`P-03/H-02`、`O-01`–`O-04`）。IXD ASCII 线框**不得**作为实现布局依据。
- **后端**：消费既有 `/admin/auth/**`、`/admin/users/**`（见 `docs/backend/api.md`）；不改契约。
- **干系人**：管理端前端实现；复用 `add-admin-login-page` 会话模块。

## Goals / Non-Goals

**Goals:**

- 交付可验收的 Admin Shell + 首页占位 + 账号列表 + 创建/编辑/删除/改己密模态 + Toast
- UI 像素级意图对齐 Pencil（玻璃壳、侧栏品牌「管理控制台」、身份下拉、列表列与操作、模态字段文案）
- Staff/Admin 能力表现与保护规则可手工验收

**Non-Goals:**

- 重做登录页；启用/停用；后端变更；按 IXD 线框另造信息架构

## Decisions

### D1：视觉 SSOT = Pencil，IXD 仅约束交互

- **选择**：实现时对照 Pencil 节点文案与结构（见下表）；交互规则（Staff Toast、编辑合并、删除二次确认）取自 IXD §5–§6。
- **理由**：用户明确要求禁止按 IXD 线框实现。
- **备选**：以 IXD ASCII 为准 → 拒绝。

**Pencil 关键文案（实现必须对齐）**

| 区域 | Pencil 文案 |
| ---- | ----------- |
| 侧栏副标题 | 管理控制台 |
| 导航 | 首页 / 账号管理 |
| 首页占位 | 标题「首页占位」；说明「本阶段无业务内容。后续业务模块将挂载于此。」 |
| 面包屑 | 首页；账号页为「首页 › 账号管理」 |
| 身份下拉 | 修改密码 / 登出 |
| 列表列 | ID / 用户名（头像缩写+名）/ 角色 / 创建时间 / 操作；**无 Bootstrap 列** |
| 角色展示 | 管理员 / 运营人员 |
| 工具栏 | 用户名占位「模糊搜索用户名」；角色「全部」；「查询」；「创建账号」 |
| 分页 | 「共 N 条 · 每页 20 条」；上一页 / 下一页 |
| O-01 | 创建账号；用户名/密码 placeholder 对齐后端规则文案；角色默认运营人员；取消 / 创建 |
| O-02 | 编辑账号；用户名只读 +「用户名创建后不可修改」；新密码（可选）「留空则不修改密码」；确认新密码；取消 / 保存 |
| O-03 | 删除账号；此操作不可恢复；确认句含 username；确认删除 |
| O-04 | 修改密码；成功后需重新登录；当前/新/确认新密码；取消 / 确认修改 |
| Staff Toast | 无权限执行此操作 |

### D2：路由挂载在 RequireAuth + Shell 布局

- **选择**：
  - `/` → Shell → HomePlaceholder
  - `/users`（或 `/admin-users`，实现择一并在 tasks 固定）→ Shell → AccountList
  - 写操作无独立路由，均为 Overlay
- **理由**：对齐 IXD 信息架构与 Pencil 壳内页。
- **备选**：账号列表独立全屏无壳 → 与稿不符。

### D3：编辑账号 = 一次 UI，两次可选 API

- **选择**：O-02 单模态；保存时若角色变化调用 `PUT .../role`；若填写新密码则校验确认后调用 `PUT .../password`；两者都变可串行调用，任一失败弹窗内展示 `message`。
- **理由**：Pencil/IXD 合并入口；后端仍为分离端点。
- **备选**：前端伪造合并 API → 拒绝（不改后端）。

### D4：Staff 写操作灰显可点 + Toast

- **选择**：不使用 `disabled` 阻断点击；样式灰显；点击拦截并 Toast「无权限执行此操作」，不打开可提交表单。
- **理由**：Pencil `P-03/H-02` 与 IXD 相对 PRD 的已确认差异。
- **备选**：disabled + tooltip（PRD 原文）→ 本变更不采用。

### D5：组件与状态组织

- **选择**：`AdminShell`（侧栏+顶栏+Outlet）；页面级容器拉数；模态本地 state 或轻量 store；Toast 全局；列表查询参数受控于 URL search 或页内 state（实现择一，优先页内 state 以控范围）。
- **理由**：清晰分层；便于按 Pencil 帧对照。
- **备选**：单页巨型组件 → 难测。

### D6：复用登录会话与 API client

- **选择**：扩展既有 `apiClient` / `sessionStore`；新增 `usersApi`、`authApi.logout`、`authApi.changePassword`。
- **理由**：避免第二套鉴权。

## 组件层级图

```text
App
└── Router
    ├── /login → LoginPage（既有，本变更不改视觉）
    └── RequireAuth
          └── AdminShell
                ├── Sidebar（Brand「Hello-Agent」+「管理控制台」；Nav 首页/账号管理）
                ├── Topbar（Breadcrumb；IdentityDropdown → 修改密码 / 登出）
                ├── Outlet
                │     ├── HomePlaceholder（P-02）
                │     └── AccountListPage（P-03）
                │           ├── Filters + CreateButton
                │           ├── UsersTable（编辑/删除）
                │           ├── Pagination
                │           ├── CreateAccountModal（O-01）
                │           ├── EditAccountModal（O-02）
                │           └── DeleteConfirmModal（O-03）
                ├── ChangePasswordModal（O-04，挂 Shell）
                └── ToastHost（G-01）
```

## API 端点规范（本变更消费）

| 方法 | 路径 | 鉴权 | 用途 |
| ---- | ---- | ---- | ---- |
| GET | `/admin/auth/me` | 已登录 | 壳层身份展示（既有） |
| POST | `/admin/auth/logout` | 已登录 | 登出；清本地会话 |
| PUT | `/admin/auth/password` | 已登录 | 改己密；成功后清会话 → `/login` |
| GET | `/admin/users` | Admin/Staff | 列表；`page`/`pageSize`/`username`/`role` |
| POST | `/admin/users` | Admin | 创建 |
| PUT | `/admin/users/{id}/password` | Admin | 重置他人密码（编辑可选） |
| PUT | `/admin/users/{id}/role` | Admin | 变更角色（编辑） |
| DELETE | `/admin/users/{id}` | Admin | 删除 |

错误处理：

- `A000001` → 清会话 → `/login`（既有 client）
- `A001002` 等业务错误 → 弹窗内或页内展示后端 `message`
- Staff 前端拦截写操作 → Toast，不发起写请求
- 网络/未知 → Toast 错误

## Risks / Trade-offs

- **[Risk] Pencil 与 PRD/CONTEXT 文案不一致** → Mitigation：提案已声明 Pencil 优先；实现 checklist 对照帧文案。
- **[Risk] 编辑双 API 部分成功** → Mitigation：先角色后密码或相反需在 UI 明确；失败保留弹窗与已变更提示 Toast；优先角色再密码，密码失败时提示角色可能已更新并刷新列表。
- **[Risk] 前端灰显被绕过** → Mitigation：后端仍鉴权；前端仅 UX。
- **[Trade-off] 列表不展示 bootstrap 列** → 保护逻辑仍用 `profile`/`bootstrap` 字段禁用删除入口。

## Migration Plan

1. 合入前端变更；配置 `VITE_API_BASE_URL` 指向后端。
2. 用 Bootstrap Admin 走闭环验收；再用 Staff 验灰显 Toast。
3. 回滚：还原提交即可；无 DB 迁移。

## Open Questions

- 账号列表路由最终 path：建议 `/users`（与 IXD 逻辑名一致）；若产品偏好 `/admin-users` 可在 apply 前确认——**默认 `/users`**。
