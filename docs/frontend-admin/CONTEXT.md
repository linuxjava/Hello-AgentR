# Frontend Admin / Console UX

Web 管理端（`frontend-admin`）的屏态与交互边界；身份实体与能力矩阵以后端 [`docs/backend/context/admin-identity/CONTEXT.md`](../backend/context/admin-identity/CONTEXT.md) 为准，KnowledgeBase 实体以后端 [`docs/backend/context/knowledge/CONTEXT.md`](../backend/context/knowledge/CONTEXT.md) 为准，本上下文不重复定义实体。

## Language

**Admin Shell（管理壳层）**：
已登录后的全局框架（导航 + 顶栏身份区 + 内容区）；承载首页、账号管理与知识库管理等受保护页面。
_Avoid_: Layout（泛称时）、Dashboard（勿暗示本阶段有仪表盘业务）

**Login Page（登录页）**：
匿名访问的管理端入口；提交用户名与密码换取会话 token。
_Avoid_: 注册页（本阶段无自助注册）

**Home Placeholder（首页占位）**：
已登录可访问的落地页；本阶段无业务内容，仅占位。
_Avoid_: Overview、工作台（口语可，文档用首页占位）

**AdminUser List（账号列表）**：
分页展示 AdminUser 的管理页；支持用户名模糊与角色精确筛选。
_Avoid_: 用户管理（易与 EndUser 混淆）、Operator 列表

**KnowledgeBase List（知识库列表）**：
分页展示 KnowledgeBase 的管理页；支持 Name 模糊；不按 Namespace 筛选。
_Avoid_: 数据集列表、Collection 列表、知识库实例列表

## Screens

| # | 屏 / 态 | 谁能进 | 引入 |
| --- | --- | --- | --- |
| S1 | 登录页 | 匿名 | V0.1 |
| S2 | 管理壳层 | 已登录 | V0.1 |
| S3 | 首页占位 | 已登录 | V0.1 |
| S4 | 账号列表 | Admin / Staff | V0.1 |
| S5 | 创建账号 | 仅 Admin | V0.1 |
| S6 | 重置他人密码 | 仅 Admin | V0.1 |
| S7 | 变更角色 | 仅 Admin | V0.1 |
| S8 | 删除确认（账号） | 仅 Admin | V0.1 |
| S9 | 修改自己的密码 | Admin / Staff | V0.1 |
| S10 | 知识库列表 | Admin / Staff | V0.2 |
| S11 | 创建 KnowledgeBase | Admin / Staff | V0.2 |
| S12 | 编辑 Name / Description | Admin / Staff | V0.2 |
| S13 | 删除确认（知识库） | 仅 Admin | V0.2 |

## Navigation & Entry

- **侧栏**：首页、账号管理、知识库管理。
- **账号治理写操作**（创建 / 重置密码 / 改角色 / 删除）：挂在账号列表的行内或页头操作上，不单独占侧栏。
- **知识库写操作**（创建 / 改 Name·描述 / 删除）：挂在知识库列表的页头或行内，不单独占侧栏，无独立详情路由。
- **顶栏身份区**：展示 username + 角色；菜单含「修改密码」「登出」。
- **登录成功默认落地**：首页占位。

## Capability UI

- **Staff（账号）**：创建 / 重置密码 / 改角色 / 删除等无权限入口 **可见但禁用（灰显）**，附 tooltip 说明无权限；布局与 Admin 一致。
- **Staff（知识库）**：创建与改 Name / Description **可用**；删除入口 **可见但禁用 + tooltip**；布局与 Admin 一致。
- **Admin**：对明显不可操作目标（账号：Bootstrap Admin、当前登录自己）**禁用并附简短原因**；其余保护规则提交后以后端文案提示。知识库删除若后端返回有文档（`A002008`），在确认框内展示文案。
- 列表 / 筛选 / 改自己密码 / 登出：Admin 与 Staff 均可正常使用。
- 知识库编辑态：**不得**提供改 Namespace 或 EmbeddingModel 的可提交控件。

## Session UX

- Token 存 **localStorage**；应用启动时带 token 调用 `/admin/auth/me` 校验；成功进入壳层，失败清除本地会话并进入登录页。
- 受保护 API 返回未登录（如 `A000001`）→ 清除本地会话 → 跳转登录页。
- 已持有有效会话时访问登录页 → 自动进入首页占位。
- 登录页支持 **记住用户名**（仅缓存 username，不缓存密码）；与 token 持久化独立。

## Interaction Patterns

- **账号**：创建 / 重置他人密码 / 变更角色 / 删除 / 修改自己的密码均为当前页 **模态框**。
- **知识库**：创建 / 编辑 Name·描述 / 删除均为当前页 **模态框**；不设详情页路由。
- **删除（账号与知识库）**：确认弹窗；文案点明物理删除、不可恢复。知识库删除须同时说明：库下仍有 Document 时不能删除。
- **修改自己的密码成功**：清除本地会话 → 提示需重新登录 → 跳转登录页（若已记住用户名则预填）。
- **EmbeddingModel**：创建时从 `GET /admin/embedding-models` 下拉选择；须标明模拟目录、非生产模型。

## Feedback UX

- **字段校验**：表单内联错误；规则对齐后端（账号：用户名 4–32、`[a-zA-Z0-9_]`；密码 8–64、须含字母与数字。知识库：Name 1–64；Namespace `[a-z0-9]`{2,32}；Description 最长 200）。
- **业务失败**：优先展示后端 `message`；登录页用页内错误条，弹窗操作用弹窗内错误。
- **业务成功**（创建 / 更新 / 删除等）：Toast 短提示，关闭弹窗并刷新列表。
- **全局意外**（网络 / 未知 5xx）：Toast 错误。

## Visual

- **本阶段不交付视觉定稿**；视觉后续用 Pencil 设计后再落地。
- 需求澄清与实现可先按功能闭环推进；样式以可替换为前提，不绑定玻璃拟态等试验风。

## Out-of-scope（明确不做）

- 启用 / 停用 UI
- 自定义角色 / 权限码配置 UI
- 登录验证码、失败锁定 UI
- 昵称 / 头像 / 邮箱、操作审计日志页
- 强制首次登录改密流程
- Document 上传 / 列表 / 删除、解析、切块、向量与索引状态 UI
- 按 Namespace 筛选；修改 Namespace 或 EmbeddingModel
- 把模拟 EmbeddingModel 展示为生产模型
- 列表中的文档数 / 切片数 / 索引状态等假字段
- EndUser 相关页面
- **视觉设计定稿 / 设计系统落地**（交 Pencil 后续迭代）
