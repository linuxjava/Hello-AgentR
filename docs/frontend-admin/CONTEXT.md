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
分页展示 KnowledgeBase 的管理页；支持 Name 模糊；不按 Namespace 筛选。V0.4 起展示真实 **documentCount**（含已禁用 Document）。库级写操作仍在本页模态；进入某库的 Document 治理走独立的 Document List，不是知识库详情页。列表「更新时间」列与文档列表同构：主行 `updatedAt`，副行创建者（`createdBy`→username）。
_Avoid_: 数据集列表、Collection 列表、知识库实例列表、把知识库列表当成文档页、用切片数/索引状态冒充文档数

**Document List（文档列表）**：
某一 KnowledgeBase 下的 Document 管理页；从知识库列表**点击名称**打开。面包屑展示当前库 Name 作为上下文；不在本页改库的 Name / 描述 / 删除库。支持文件名（OriginalFilename）模糊搜索、**状态**精确筛选、**是否启用**精确筛选与分页（默认 20、上限 100）；点「查询」才生效；缺省不过滤状态与启用，因此禁用文档仍出现在默认列表。默认按更新时间倒序。不做 strategy 筛选。列表列：文件名、状态、分块数、Enabled 开关、更新时间、行操作（改策略 / 删除）。界面标签「文件名」对应 OriginalFilename；**文件名下方副行**展示文档类型与大小（由后端 `documentFormat` 映射为可读标签 + `byteSize` 人类可读，格式如 `PDF · 1.2 MB`；**不要**自行解析 `mediaType`），不另开独立列。**更新时间下方副行**展示创建者 username（契约 `createdBy` 为 AdminUser id，经账号目录映射）；映射不可用时回退显示 id。状态列对 `UPLOADED` 展示为「待分块」；尚未开始分块时分块数展示为「—」（不用 0）。不展示策略摘要、objectKey。
_Avoid_: 知识库详情页、附件列表、文件管理（泛称）、Dataset 内容页、把策略 JSON 当成列表列、按启用状态隐藏行

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
| S14 | 文档列表 | Admin / Staff | V0.4 |
| S15 | 上传 Document | Admin / Staff | V0.4 |
| S16 | 改 ChunkStrategy | Admin / Staff | V0.4 |
| S17 | 删除确认（文档） | Admin / Staff | V0.4 |
| S18 | 知识库不存在（文档路由） | Admin / Staff | V0.4 |

## Navigation & Entry

- **侧栏**：首页、账号管理、知识库管理。
- **账号治理写操作**（创建 / 重置密码 / 改角色 / 删除）：挂在账号列表的行内或页头操作上，不单独占侧栏。
- **知识库写操作**（创建 / 改 Name·描述 / 删除）：挂在知识库列表的页头或行内，不单独占侧栏，**无知识库详情路由**。
- **进入知识库**：点击知识库列表中的 **Name**（名称前有图标）打开 Document List（独立路由）；侧栏仍高亮「知识库管理」。不设行内「进入」按钮。文档列表页头提供返回知识库列表。Document 的上传 / 改策略 / 删除挂在文档列表的页头或行内模态；启用 / 禁用为行内开关，不另占侧栏。
- **顶栏身份区**：展示 username + 角色；菜单含「修改密码」「登出」。
- **登录成功默认落地**：首页占位。

## Capability UI

- **Staff（账号）**：创建 / 重置密码 / 改角色 / 删除等无权限入口 **可见但禁用（灰显）**，附 tooltip 说明无权限；布局与 Admin 一致。
- **Staff（知识库）**：创建与改 Name / Description **可用**；删除入口灰显可点，Toast「无权限删除知识库」，不打开确认。Staff 与 Admin 均可点名称进入文档列表。
- **Admin**：对明显不可操作目标（账号：Bootstrap Admin、当前登录自己）**禁用并附简短原因**。知识库 `documentCount > 0` 时删除**外观与可删行相同**；点击后 **Toast**「库下仍有文档，不能删除」，**不打开**确认框。该 Toast 文案**不得**与 Staff「无权限」写成同一句。若仍收到 `A002008`（例如列表未刷新），在确认框内展示后端 `message`。
- 列表 / 筛选 / 改自己密码 / 登出：Admin 与 Staff 均可正常使用。
- **Staff（文档）**：上传 / 改策略 / 启用禁用 / 删除 **全部可用**（与 Admin 相同）。删除 Document **不要**套用删知识库的灰显。
- **AdminUser 账号**：启用 / 停用 UI 仍不做（与 V0.1 相同）。

## Session UX

- Token 存 **localStorage**；应用启动时带 token 调用 `/admin/auth/me` 校验；成功进入壳层，失败清除本地会话并进入登录页。
- 受保护 API 返回未登录（如 `A000001`）→ 清除本地会话 → 跳转登录页。
- 已持有有效会话时访问登录页 → 自动进入首页占位。
- 登录页支持 **记住用户名**（仅缓存 username，不缓存密码）；与 token 持久化独立。

## Interaction Patterns

- **账号**：创建 / 重置他人密码 / 变更角色 / 删除 / 修改自己的密码均为当前页 **模态框**。
- **知识库**：创建 / 编辑 Name·描述 / 删除均为知识库列表页 **模态框**；不设知识库详情页。
- **文档**：上传 / 改策略 / 删除均为文档列表页 **模态框**；**启用 / 禁用**为行内开关（点即提交，不走确认框）。不设 Document 详情路由（列表列覆盖核对需求）。
- **ChunkStrategy 表单**：上传与改策略均用按种类切换的结构化数字字段，前端组装 JSON；**不得**提供 JSON 文本框。字段旁**不**标注单位。改种类时清空并换成目标种类的字段（整份参数替换）。
- **策略种类文案**：`OVERLAPPING` 展示「重叠分块」；`STRUCTURE_AWARE` 展示「文档结构分块(建议MD文档使用)」（括号内为界面提示，不改变枚举值）。上传与改策略下拉共用该文案。
- **字段装饰**：分块策略、分块大小（含最小 / 默认 / 最大）、重叠长度的**输入盒内侧左侧**有装饰图标（与 Pencil `Select/Field`、`Input/Field` 一致：`layers` / `hash` / `git-compare`），不在标签旁另放问号。
- **数字输入**：直接键入时不得出现前导 `0`（清空后保持空，不得立刻变成 `0`）；不使用原生 number 步进器。
- **下拉点击**：打开触发器与点选选项时**无**按钮水波纹、**无** Ant Design 波浪。
- **输入焦点**：玻璃输入盒（含策略数字、文件名、搜索框、其它管理端同类字段）聚焦后高亮，对齐 Ant Design outlined Input：主色描边 `#1677ff` + `0 0 0 2px rgba(5, 145, 255, 0.1)`；悬停描边 `#4096ff`。下拉在展开期间保持焦点高亮。
- **上传预填（仅 UI，非领域常量）**：打开上传时默认 `OVERLAPPING`，`chunkSize=512`、`overlap=64`；切到 `STRUCTURE_AWARE` 时改为 `minChunkSize=256`、`defaultChunkSize=512`、`maxChunkSize=1024`、`overlap=32`。改策略弹窗打开时带回该 Document 的已存种类与参数，不套用上传预填。文件名主名可改，后缀只读锁定；与策略一次提交。
- **选文件**：单文件；支持**拖拽到投放区**或点击选择；`accept` 提示白名单常见扩展名（txt/md/pdf/doc/docx/ppt/pptx/xls/xlsx/png/jpg/jpeg/svg）。投放区只提示常见类型，**不**写约 50MB / 服务端为准类文案。扩展名不是权威，0 字节 / MIME / 超限一律以后端 `message` 为准。已选文件后仍可拖拽替换或点击重新选择。
- **Document 状态展示**：后端 `DocumentStatus` 在列表与筛选用中文标签，**不**直接展示枚举名。展示为**毛玻璃胶囊徽章**（底 `$glass-fill` `#FFFFFF59` + 描边 `$edge-dim` `#FFFFFF66`，与行操作「删除」同形同底；字色按状态区分、无色点）。文案：`UPLOADED` →「待分块」、`CHUNKING` →「处理中」、`CHUNKED` →「已就绪」、`FAILED` →「异常」。字色：待分块橙 `#DE9139`、处理中蓝 `#4379ED`、已就绪青绿 `#33A985`、异常红 `#E04D4D`。枚举值不变；不把「待分块」改成「排队中」。
- **分块数**：列表展示该 Document 已产生的 Chunk 条数；尚未开始分块（如「待分块」）时展示「—」，不展示 0。
- **同名文件**：同库允许相同 OriginalFilename，每次上传都是新 Document；**不**因同名二次确认或拒绝；弹窗**不**常驻「新增不覆盖」说明。
- **上传提交中**：按钮 loading，禁止再次提交或更换文件；不要求百分比进度条。失败则解锁，弹窗内展示后端 `message`。
- **切块 / 预览说明**：不在列表或上传、改策略弹窗写「不会立即切块」「不提供预览/下载」类提示。
- **删除（账号与知识库）**：确认弹窗；文案点明物理删除、不可恢复。知识库在 `documentCount > 0` 时点击删除 **Toast** 拦截，不打开确认框；删除按钮不用禁用色。
- **删除 Document**：轻确认（如「确定删除该文档？」）；不在文案中展开对象存储、不可下载等实现细节。Admin 与 Staff 均可打开并提交。
- **修改自己的密码成功**：清除本地会话 → 提示需重新登录 → 跳转登录页（若已记住用户名则预填）。
- **EmbeddingModel**：创建时从 `GET /admin/embedding-models` 下拉选择；须标明模拟目录、非生产模型。

## Feedback UX

- **字段校验**：表单内联错误；规则对齐后端（账号：用户名 4–32、`[a-zA-Z0-9_]`；密码 8–64、须含字母与数字。知识库：Name 1–64；Namespace `[a-z0-9]`{2,32}；Description 最长 200。ChunkStrategyParams：`OVERLAPPING` 时 `chunkSize > 0` 且 `0 ≤ overlap < chunkSize`；`STRUCTURE_AWARE` 时 `minChunkSize ≤ defaultChunkSize ≤ maxChunkSize` 且 `0 ≤ overlap < minChunkSize`）。
- **业务失败**：优先展示后端 `message`；登录页用页内错误条，弹窗操作用弹窗内错误。
- **业务成功**（创建 / 更新 / 删除等）：Toast 短提示，关闭弹窗并刷新列表。
- **全局意外**（网络 / 未知 5xx）：Toast 错误。

## Visual

- V0.4 Document 列表与上传 / 改策略等帧的**视觉真源**为 [`版本迭代/V0.4/ui/ui.pen`](版本迭代/V0.4/ui/ui.pen)（实现应对帧，不自行发明列或入口）。
- 玻璃输入盒的焦点 / 悬停高亮对齐 Ant Design outlined Input（见 Interaction Patterns），不在每帧重复色值。

## Out-of-scope（明确不做）

- **账号启用 / 停用 UI**（不是 Document 的 Enabled 开关）
- 自定义角色 / 权限码配置 UI
- 登录验证码、失败锁定 UI
- 昵称 / 头像 / 邮箱、操作审计日志页
- 强制首次登录改密流程
- 解析、切块执行、向量与索引状态 UI
- Document 源文件预览 / 下载（后端本阶段无对应 API）
- 按 Namespace 筛选；修改 Namespace 或 EmbeddingModel
- 把模拟 EmbeddingModel 展示为生产模型
- 列表中的切片数 / 索引状态等假字段（文档数为真实 `documentCount`，V0.4 起在知识库列表展示）
- EndUser 相关页面
- **全站独立设计系统落地**（V0.4 Document 视觉以该版 Pencil 为准，不在本上下文另开设计系统）
