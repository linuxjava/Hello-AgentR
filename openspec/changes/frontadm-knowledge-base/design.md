## Context

- **现状**：`frontend-admin` 已有 Admin Shell、首页占位、账号列表与 Toast；侧栏仅「首页 / 账号管理」。后端 `/admin/knowledge-bases/**` 与 `GET /admin/embedding-models` 已就绪。
- **依据**：范围与 API 对齐 `docs/frontend-admin/版本迭代/V0.2/prd.md` 与 `docs/backend/api.md` §3。**布局、控件结构、文案以 Pencil《知识库管理》为唯一视觉 SSOT**。`ixd.md` 只提供帧 ID 与相对 PRD 的已确认差异索引；**禁止按 IXD 线框实现**（该 IXD 本身也未含 ASCII 线框）。
- **干系人**：管理端前端；复用壳层 / 会话 / Toast；不改后端。

## Goals / Non-Goals

**Goals:**

- 交付侧栏三项（Pencil 顺序）+ 知识库列表（有数据 / Staff / 空）+ 创建/编辑/删除模态及错误态 + Toast
- 对照 Pencil 帧实现，不发明列、筛选或说明句
- Admin/Staff 删除差可手工验收

**Non-Goals:**

- Document 与摄入 UI；改 Namespace/模型；详情路由；后端变更；按 IXD 线框另造信息架构

## Decisions

### D1：视觉 SSOT = Pencil

- **选择**：实现对照 `知识库管理.pen` 节点文案与结构（下表）。交互（Staff Toast、删除默认句、无「非生产」说明）取自 IXD §9 已确认差异。
- **理由**：用户要求严格按 Pencil，不要按 IXD 线框。
- **备选**：以 IXD/PRD 原文文案为准 → 拒绝（与定稿稿面冲突）。

**Pencil 关键文案（实现必须对齐）**

| 区域 | Pencil 文案 |
| ---- | ----------- |
| 侧栏顺序 | 首页 → 知识库管理 → 账号管理 |
| 面包屑 | 首页 › 知识库管理 |
| 工具栏 | 占位「模糊搜索名称」；「查询」；「创建知识库」 |
| 表头 | 名称 / 命名空间 / 向量模型 / 描述 / 创建时间 / 操作 |
| 空描述 | — |
| 分页 | 「20 条/页」（默认 pageSize=20；上限 100） |
| 空态 | 「暂无知识库」；「还没有任何知识库。可点击右上角「创建知识库」新建空容器。」 |
| O-05 字段序 | 名称 → 命名空间 → 向量模型 → 描述 |
| O-05 占位 | 名称「1–64 字，支持中文与常见标点」；命名空间「2–32 位，仅小写字母与数字」；描述「选填，最长 200 字」；向量模型默认不选，占位「请选择向量模型」 |
| O-05 操作 | 取消 / 创建 |
| O-05 **不出现** | 「模拟目录，非生产模型…」 |
| O-05a | 红条「名称已存在」（同类冲突用后端 `message`） |
| O-05b | 红条「向量模型目录暂不可用，无法提交创建。」；模型值「目录不可用」；「创建」禁用 |
| O-06 | 仅名称/描述可编；不展示命名空间、向量模型及不可修改提示；取消 / 保存 |
| O-07 | 删除知识库；此操作不可恢复；确定删除知识库「{名称}」吗？；将执行彻底删除，且无法恢复。；取消 / 确认删除 |
| O-07a | 另加红条「知识库下仍有文档，不能删除」 |
| G-01 | 创建成功（更新/删除同位置短成功提示） |
| Staff Toast | 无权限删除知识库 |

### D2：路由

- **选择**：`/knowledge-bases` → Shell → KnowledgeBaseList；写操作无独立路由。
- **理由**：PRD 逻辑路由；工程可在 apply 前改 path，默认此值。
- **备选**：详情页 `/knowledge-bases/:id` → 不做。

### D3：Staff 删除 = 灰显可点 + Toast

- **选择**：不使用 `disabled` 阻断点击；样式灰显；点击 Toast「无权限删除知识库」，不打开 O-07，不发 DELETE。
- **理由**：Pencil `P-04/H-02` 与用户相对 PRD tooltip 的确认；对齐 V0.1 账号写操作模式。
- **备选**：disabled + tooltip（PRD 原文）→ 不采用。

### D4：复用会话、Toast、列表模式

- **选择**：扩展既有 `apiClient` / `sessionStore` / `ToastHost` / `Pagination`；新增 `knowledgeApi`（list/create/update/remove + embeddingModels）。列表查询用页内 state。
- **理由**：与 `add-admin-shell-account-mgmt` 一致，避免第二套 HTTP/反馈栈。
- **备选**：新开 data layer → 拒绝。

### D5：打开创建时拉目录

- **选择**：打开 O-05 时请求 `GET /admin/embedding-models`；失败则切到 O-05b 表现（红条 + 禁用创建）。选项只渲染返回标识，禁止自由输入。目录成功后**不预选**第一项，触发器占位「请选择向量模型」。
- **理由**：AC-F115；Pencil O-05b。
- **备选**：提交时再校验 → 用户可填完才失败，体验差。

## 组件层级图

```text
App
└── RequireAuth
      └── AdminShell
            ├── ShellSidebar（首页 / 知识库管理 / 账号管理 — Pencil 顺序）
            ├── ShellTopbar
            ├── Outlet
            │     ├── HomePage
            │     ├── UsersPage
            │     └── KnowledgeBasesPage（P-04）
            │           ├── Filters + 「创建知识库」
            │           ├── Table | EmptyState（H-03）
            │           ├── Pagination
            │           ├── CreateKbModal（O-05 / O-05a / O-05b）
            │           ├── EditKbModal（O-06）
            │           └── DeleteKbModal（O-07 / O-07a）
            └── ToastHost（G-01 + Staff 无权限）
```

## API 端点规范（本变更消费）

| 方法 | 路径 | 鉴权 | 用途 |
| ---- | ---- | ---- | ---- |
| GET | `/admin/embedding-models` | 已登录 | 创建下拉；`data` 为标识数组 |
| GET | `/admin/knowledge-bases` | 已登录 | `page` / `pageSize` / `name`；无 Namespace 筛选 |
| POST | `/admin/knowledge-bases` | Admin/Staff | body：`name` / `description?` / `namespace` / `embeddingModel` |
| PUT | `/admin/knowledge-bases/{id}` | Admin/Staff | body：`name` / `description`（空=清空）；不改 namespace/模型 |
| DELETE | `/admin/knowledge-bases/{id}` | 仅 Admin | 物理删除；有文档 `A002008` |

错误处理：

- `A000001` → 清会话 → `/login`（既有 client）
- 业务码（`A002003` 名称已存在、`A002005` Namespace 已存在、`A002008` 等）→ **弹窗内**展示后端 `message`
- Staff 前端拦截删除 → Toast，不发 DELETE
- 目录失败 → O-05b，不提交 POST
- 网络/未知 → Toast 错误

本阶段不调用 `GET /admin/knowledge-bases/{id}`（无详情路由）。

## Risks / Trade-offs

- **[Risk] Pencil 与 PRD 文案不一致** → Mitigation：提案声明 Pencil 优先；tasks 按帧 checklist。
- **[Risk] 前端拦截被绕过** → Mitigation：删除以后端 Admin 鉴权为准。
- **[Trade-off] 不展示「非生产」说明** → 下拉仍只绑定模拟标识，降低被当成生产模型的风险，但弱于 PRD 原文提示。

## Migration Plan

1. 合入前端；`VITE_API_BASE_URL` 指向已部署 Knowledge API 的后端。
2. Admin：侧栏进知识库 → 创建 → 列表 → 编辑 → 删除 → 同 Namespace 再建。
3. Staff：创建/编辑可用；删除 Toast。
4. 回滚：还原提交；无 DB 迁移。

## Open Questions

- 路由 path 默认 `/knowledge-bases`（PRD 允许工程选定）。
