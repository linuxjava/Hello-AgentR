## Context

- **现状**：`frontend-admin` 已有知识库列表（创建/编辑/删库）、Shell、Toast、`knowledgeApi`。后端 Document API（上传/列表/改策略/启用/删除）与 `documentCount` 已就绪。
- **依据**：范围与验收对齐 `docs/frontend-admin/版本迭代/V0.4/prd.md`。**布局、控件、文案以 `docs/frontend-admin/版本迭代/V0.4/ui.pen` 为唯一视觉 SSOT**。`ixd.md` 只提供帧 ID、手势与 AC 追溯；**禁止按 IXD「线框图」实现**（该 IXD 本身无 ASCII 线框；与 Pencil 冲突时以 Pencil 为准）。
- **干系人**：管理端前端；复用壳层 / 会话 / Toast / 既有 knowledge API 客户端；不改后端。

## Goals / Non-Goals

**Goals:**

- 交付知识库列表增量（文档数、点名称进入、有文档删库 Toast）+ 文档列表（V-01～V-04）+ 上传/改策略/删文档模态 + 行内启用 + 文档列表 Toast
- 实现逐帧对照 `ui.pen`，不发明列、筛选或说明句
- Admin/Staff 文档能力与删库差可手工验收

**Non-Goals:**

- 分块执行 / 预览下载 / URL 多文件；知识库详情页；按状态筛选；后端变更；按 IXD 线框另造信息架构

## Decisions

### D1：视觉 SSOT = Pencil（`ui.pen`）

- **选择**：实现对照 Pencil 顶层帧的结构与可见文案。交互规则（Toast 拦截删库、拖拽上传、无同名说明等）取自 PRD/IXD 已确认条款。
- **理由**：用户明确要求严格按 Pencil，不要按 IXD 线框。
- **备选**：以 IXD 叙述或 PRD 草稿文案覆盖稿面 → 拒绝。

**Pencil 关键帧（实现必须对齐）**

| 帧 | 用途 |
| -- | ---- |
| `P-04 / H-01` / `H-02` | 列表含文档数；点名称进文档；Admin 有文档删库 Toast；Staff 无权限 Toast |
| `P-04 / H-03` / `H-04` | 空 / 筛选空（表头已含文档数） |
| `O-07a` | 删库确认兜底业务红条（有文档） |
| `P-05 / V-01`～`V-03` | 文档列表有数据 / 空 / 筛选空 |
| `P-05 / V-04` | 知识库不存在（错误态，非空列表） |
| `O-08`～`O-08d` | 上传默认 / 结构分块 / 校验错 / 提交中 / 业务失败 |
| `O-09` | 改策略（回填） |
| `O-10` | 删文档轻确认 |
| `G-01a` | 文档列表成功 Toast |

### D2：路由

- **选择**：文档列表 `/knowledge-bases/:kbId/documents`（需登录）；上传/改策略/删文档无独立路由；侧栏在文档页仍高亮「知识库管理」。
- **理由**：PRD §6.3；与「非详情页」一致。
- **备选**：嵌在知识库详情 → 不做。

### D3：有文档删库 = Toast，不打开确认

- **选择**：`documentCount > 0` 时 Admin 删除外观常色可点 → Toast「库下仍有文档，不能删除」，不打开 O-07。Staff 仍灰显 +「无权限删除知识库」。
- **理由**：Pencil H-01 + PRD 修订。
- **备选**：禁用色 + tooltip（旧 grilling）→ 不采用。

### D4：复用 knowledge API 客户端

- **选择**：扩展既有 `shared/api/knowledge.ts`（documents CRUD + enabled + chunk-strategy）；列表页用页内 state；复用 ToastHost / Pagination / 模态 chrome。
- **理由**：避免第二套 HTTP 栈。
- **备选**：新建 documentsApi 模块 → 可选，但优先同文件分区导出。

### D5：策略表单前端组装 JSON

- **选择**：UI 结构化字段；提交时组装 `chunkStrategy` + `chunkStrategyParams` 字符串；无 JSON 文本框；上传预填与改策略回填规则对齐 PRD。
- **理由**：后端契约 + CONTEXT。
- **备选**：整段 JSON 编辑 → 禁止。

### D6：启用开关即时提交

- **选择**：行内开关点即 `PUT .../enabled`；无确认框；失败 Toast `message` 并回滚开关表现。
- **理由**：PRD REQ-F407。
- **备选**：确认弹窗 → 不做。

## 组件层级图

```text
App
└── RequireAuth
      └── AdminShell
            ├── ShellSidebar（文档页仍高亮「知识库管理」）
            ├── ShellTopbar
            ├── Outlet
            │     ├── KnowledgeBasesPage（P-04 + 文档数 / 点名称 / 删库 Toast）
            │     │     └── DeleteKbModal（空库确认；O-07a 兜底）
            │     └── DocumentsPage（P-05）
            │           ├── Toolbar（搜索 / 上传）
            │           ├── Table | Empty（V-01/V-02/V-03）| KbMissing（V-04）
            │           ├── Pagination
            │           ├── UploadDocumentModal（O-08*）
            │           ├── ChangeStrategyModal（O-09）
            │           └── DeleteDocumentModal（O-10）
            └── ToastHost（库级 Toast + G-01a）
```

## API 端点规范（本变更消费）

| 方法 | 路径 | 鉴权 | 用途 |
| ---- | ---- | ---- | ---- |
| GET | `/admin/knowledge-bases` | 已登录 | 列表含 `documentCount` |
| DELETE | `/admin/knowledge-bases/{id}` | Admin | 仅空库；有文档前端 Toast 拦截，兜底展示 `A002008` |
| GET | `/admin/knowledge-bases/{kbId}/documents` | 已登录 | `page` / `pageSize` / `originalFilename`；更新时间倒序 |
| POST | `/admin/knowledge-bases/{kbId}/documents` | 已登录 | `multipart`：file + chunkStrategy + chunkStrategyParams |
| PUT | `/admin/knowledge-bases/{kbId}/documents/{docId}/chunk-strategy` | 已登录 | 改策略整份替换 |
| PUT | `/admin/knowledge-bases/{kbId}/documents/{docId}/enabled` | 已登录 | 启用/禁用 |
| DELETE | `/admin/knowledge-bases/{kbId}/documents/{docId}` | 已登录 | 删文档（同步删对象，失败则整笔失败） |

权威字段与错误码见 `docs/backend/api.md` §3.7–3.12；前端 SHALL 展示后端 `message`，不发明业务文案覆盖码表（UI 预置 Toast/确认句除外）。

## Risks / Trade-offs

- [Risk] Pencil 与 PRD 文案细微差 → Mitigation：冲突以 Pencil 可见文案为准，行为以 PRD AC 为准并记入 IXD。
- [Risk] 大文件上传无进度条 → Mitigation：仅 loading 锁定（O-08c）；不验收百分比。
- [Risk] 列表未刷新仍点删库打开确认 → Mitigation：保留 O-07a 红条兜底。
- [Trade-off] 文档列表不拆 Staff 帧 → Staff 文档权限与 Admin 相同，测同一页即可。

## Migration Plan

1. 合并前端变更；无 DB 迁移。
2. 依赖后端 Document API 已部署。
3. 回滚：还原提交并移除文档路由（见 proposal）。

## Open Questions

- （无阻塞）文档列表成功 Toast 各动作文案除「上传成功」外是否统一「操作成功」→ apply 时对照 Pencil G-01a，缺省用短成功句。
