## Why

后端 KnowledgeBase API 与模拟目录已就绪，管理端仍只有登录与账号治理，运营无法在控制台建库、改文案、删空库。V0.2 需按 Pencil《知识库管理》交付列表与模态闭环，避免按 IXD 线框或臆造 Dataset / 文档数等假字段与词汇表漂移。

## What Changes

- 侧栏扩为三项，**顺序以 Pencil 为准**：首页 → **知识库管理** → 账号管理（高亮与图标对齐稿面）
- 新增 **知识库列表**（P-04）：Name 模糊、分页默认 20；表头中文「名称 / 命名空间 / 向量模型 / 描述 / 创建时间 / 操作」；空描述为 `—`；**无** Namespace 筛选、文档数、切片数、索引状态、createdBy
- 新增模态（无独立详情路由）：
  - **O-05 创建**：字段顺序 名称 → 命名空间 → 向量模型下拉 → 描述；不展示「模拟目录，非生产模型」句
  - **O-05a / O-05b**：弹窗内红条（如「名称已存在」）；目录失败时「创建」禁用
  - **O-06 编辑**：仅名称/描述可改；不展示命名空间与向量模型
  - **O-07 / O-07a**：删除确认文案按稿；有文档拒绝时红条「知识库下仍有文档，不能删除」
- Staff：创建/编辑可用；删除灰显可点 → Toast「无权限删除知识库」，不打开 O-07
- Toast（G-01）：成功「创建成功」（更新/删除同位置短成功提示）；网络错误沿用既有 Toast

## Out of Scope（不做）

- Document 上传 / 列表 / 删除、解析、切块、向量与索引状态 UI
- 按 Namespace 筛选；修改 Namespace 或 EmbeddingModel
- 恢复已删除知识库；独立详情路由
- 列表假字段（文档数 / 切片数 / 索引状态）；createdBy 列
- 把模拟标识包装成生产模型名；页内「非生产」说明句（Pencil 已去掉）
- 账号治理行为变更（V0.1）；登录页重做
- 后端 API 变更（只消费 `docs/backend/api.md` §3）
- **以 IXD ASCII 线框为准的布局/文案**（视觉 SSOT = Pencil；IXD 仅作帧 ID 与交互行为索引，本稿 IXD 本身无线框）

## Capabilities

### New Capabilities

- `frontend-admin-knowledge-base`：知识库列表（含空态、Admin/Staff）、创建/编辑/删除模态与错误态、侧栏第三项及顺序、与 Knowledge / 模拟目录 API 对接

### Modified Capabilities

- （无；`openspec/specs/` 尚无已归档的壳层/知识库能力。侧栏增量在本变更实现中修改 `ShellSidebar`，不另开 delta spec。）

## Impact

- **代码**：`frontend-admin` 新增知识库页与模态；扩展 `ShellSidebar` 导航顺序；新增 `knowledgeApi` / 类型；复用 Toast、Pagination、会话门禁
- **API 消费**：`GET /admin/embedding-models`；`GET/POST /admin/knowledge-bases`；`PUT/DELETE /admin/knowledge-bases/{id}`（详情 GET 本阶段可不单独占路由）
- **视觉依据**：`docs/frontend-admin/版本迭代/V0.2/ui/知识库管理.pen`（帧 P-02 侧栏、P-04 H-01/H-02/H-03、O-05/O-05a/O-05b、O-06、O-07/O-07a、G-01）
- **行为依据**：`prd.md` 范围与 API 边界；`ixd.md` 帧 ID / 已确认相对 PRD 差异；**冲突时以 Pencil 文案与结构为准**
- **依赖**：`add-admin-shell-account-mgmt` 壳层与 Toast；后端 `backend-knowledge-base`
- **变更标识**：OpenSpec 目录名为 `frontadm-knowledge-base`（CLI 要求全小写）；归属 Web 管理端，对应约定前缀 `frontAdm-`

## 回滚方案

- **代码回滚**：还原本变更提交；侧栏退回「首页 / 账号管理」；删除 `/knowledge-bases` 路由
- **本地数据**：无迁移；会话仍为 V0.1 localStorage token
- **风险**：回滚后无法在管理端治理知识库容器；不影响后端 Knowledge API 与账号治理
