## ADDED Requirements

### Requirement: 知识库列表文档数与进入文档列表

系统 SHALL 在知识库列表展示真实 `documentCount`（含已禁用 Document），表头 MUST 对齐 Pencil `P-04/H-01`（含「文档数」列）。系统 SHALL NOT 展示切片数或索引状态列。名称前 MUST 有图标；用户点击名称 SHALL 进入该库文档列表独立路由；系统 SHALL NOT 提供行内「进入」按钮。文档列表页侧栏 MUST 仍高亮「知识库管理」。

#### Scenario: 展示文档数并进入

- **GIVEN** Admin 或 Staff 已登录且某库 `documentCount=3`（含禁用）
- **WHEN** 打开知识库列表并点击该行名称
- **THEN** 「文档数」显示 3，进入文档列表，侧栏仍高亮「知识库管理」，且不是可编辑库文案的详情页

#### Scenario: 无会话访问文档路由

- **GIVEN** 无有效会话
- **WHEN** 访问文档列表路由
- **THEN** 系统清除本地会话并进入登录页

### Requirement: 有文档时删除知识库拦截

当 `documentCount > 0` 时，Admin 的删除控件外观 MUST 与可删行相同（非禁用色）；点击后系统 SHALL 以 Toast 展示「库下仍有文档，不能删除」，SHALL NOT 打开删除确认模态。Staff 删除入口 MUST 灰显可点，Toast MUST 为「无权限删除知识库」，且 MUST NOT 与「仍有文档」文案相同。若删除确认已打开且后端拒绝（如 `A002008`），系统 SHALL 在确认框内展示后端 `message`（Pencil `O-07a`）。

#### Scenario: Admin 有文档点删除

- **GIVEN** Admin 已登录且目标库 `documentCount≥1`
- **WHEN** 点击该行删除
- **THEN** Toast「库下仍有文档，不能删除」，不打开确认框，不发送成功删除

#### Scenario: Staff 点删除

- **GIVEN** Staff 已登录
- **WHEN** 点击灰显删除
- **THEN** Toast「无权限删除知识库」，不打开确认框，不发送 DELETE

### Requirement: 文档列表列与筛选分页

系统 SHALL 提供文档列表（Pencil `P-05/V-01`）：表头 MUST 为文件名、状态、分块数、启用、更新时间、操作。文件名主行 MUST 为 OriginalFilename，副行 MUST 展示可读类型与大小（格式对齐稿面，如 `PDF · 1.2 MB`）。更新时间主行 MUST 为 `updatedAt`，副行 MUST 展示创建者 username（`createdBy` 经账号目录映射；不可用时回退 id）。状态 MUST 为毛玻璃胶囊徽章（底 `$glass-fill` + 描边 `$edge-dim`，与行操作「删除」同形同底；字色按状态区分、无色点）+ 中文文案；`UPLOADED` MUST 展示为「待分块」，`CHUNKING` MUST 展示为「处理中」，`CHUNKED` MUST 展示为「已就绪」，`FAILED` MUST 展示为「异常」。尚未分块时分块数 MUST 为「—」。系统 SHALL 支持文件名模糊、状态精确、是否启用精确、「查询」、默认 pageSize=20、更新时间倒序；SHALL NOT 提供 strategy 筛选，SHALL NOT 设独立媒体类型/大小/策略列。

#### Scenario: 有数据列表

- **GIVEN** 已登录且库内多条 Document
- **WHEN** 打开文档列表且不搜
- **THEN** 按更新时间倒序分页展示约定列，状态为「待分块」，未分块分块数为「—」

#### Scenario: 模糊与翻页

- **GIVEN** 已登录
- **WHEN** 按文件名模糊、状态、是否启用筛选或翻页
- **THEN** 点「查询」后结果与筛选/分页一致；页上有状态与是否启用筛选，无 strategy 筛选

#### Scenario: 列表请求失败

- **GIVEN** 已登录且目标库存在
- **WHEN** 文档列表请求失败
- **THEN** Toast 展示错误且不伪造行

### Requirement: 文档列表空态与筛选空态

库存在但无 Document 时，系统 SHALL 展示 Pencil `P-05/V-02` 空态且「上传文档」可用。筛选无匹配时，系统 SHALL 展示 `P-05/V-03` 并保留当前筛选条件与上传入口。

#### Scenario: 空库可上传

- **GIVEN** 已登录且该库尚无 Document
- **WHEN** 进入文档列表
- **THEN** 展示空态且上传入口可用

#### Scenario: 筛选无匹配

- **GIVEN** 已登录且输入无匹配关键词
- **WHEN** 查询
- **THEN** 展示筛选空态，上传入口仍可用

### Requirement: 知识库不存在错误态

当知识库 id 不存在（如 `A002001`）时，系统 SHALL 展示 Pencil `P-05/V-04`，MUST NOT 将其表现为可上传的空文档列表，MUST 提供返回知识库列表的入口。

#### Scenario: 库不存在

- **GIVEN** 已登录且目标知识库不存在
- **WHEN** 访问该库文档列表路由
- **THEN** 展示「知识库不存在」错误态并可返回知识库列表，且无可用上传闭环

### Requirement: 上传文档模态

系统 SHALL 提供「上传文档」→ O-08（Pencil）：单文件，支持拖拽到投放区或点击选择；策略为结构化字段，默认重叠分块预填 512/64；切到「基于文档结构的分块」时字段与预填 MUST 对齐 O-08a（256/512/1024/32）；SHALL NOT 提供 JSON 文本框；字段旁 SHALL NOT 标注单位；SHALL NOT 常驻同名说明或约 50MB 文案。Admin 与 Staff 均可提交。提交中 MUST 锁定（O-08c），禁止重复提交与换文件。

#### Scenario: 上传成功

- **GIVEN** 已登录、库存在、文件可被后端接受
- **WHEN** 保留默认重叠分块 512/64，选文件并提交成功
- **THEN** Toast 成功，弹窗关闭，列表出现新行，状态「待分块」，分块数「—」

#### Scenario: 切到结构分块

- **GIVEN** 已打开上传弹窗
- **WHEN** 选择「基于文档结构的分块」
- **THEN** 字段变为最小/默认/最大/重叠且预填 256/512/1024/32，无 JSON 文本框

#### Scenario: 同名再传

- **GIVEN** 库中已有同名 OriginalFilename
- **WHEN** 再传相同文件名并成功
- **THEN** 两行同名并存，无二次确认，弹窗无「新增不覆盖」常驻说明

#### Scenario: 参数不合规

- **GIVEN** 已打开上传弹窗
- **WHEN** 将 overlap 填成 ≥ chunkSize 后提交
- **THEN** 弹窗不关闭并展示内联/红条错误（对齐 O-08b），不产生成功上传

#### Scenario: 业务失败

- **GIVEN** 已登录
- **WHEN** 上传因空文件/类型/超限/存储等失败
- **THEN** 弹窗内展示后端 `message`（对齐 O-08d），列表无新行，控件可重试

### Requirement: 改 ChunkStrategy 模态

系统 SHALL 提供行内「改策略」→ O-09：打开时 MUST 回填该 Document 已存种类与参数，SHALL NOT 套用上传预填；改种类 MUST 整份替换为目标种类字段；SHALL NOT 提供 JSON 文本框。文件名 MUST 可改主名，后缀 MUST 只读锁定；提交 MUST 将完整 OriginalFilename 与策略一并 PUT。仅当后端允许时（本阶段 `UPLOADED`）可提交。

#### Scenario: 打开回填

- **GIVEN** 目标 Document 已有策略参数
- **WHEN** 打开改策略
- **THEN** 回填已存种类与数字，不等于上传默认预填（除非已存值恰好相同）；文件名主名可编、后缀只读

#### Scenario: 改种类并保存成功

- **GIVEN** 目标为 `UPLOADED`
- **WHEN** 改为结构分块并提交合法参数
- **THEN** 成功 Toast，弹窗关闭，列表 `updatedAt` 反映更新

#### Scenario: 改文件名主名成功

- **GIVEN** 已打开改策略，文件名为 `handbook.pdf`
- **WHEN** 将主名改为 `手册` 并保存
- **THEN** 请求携带 `originalFilename=手册.pdf`，成功 Toast，列表文件名更新

#### Scenario: 主名为空拒绝

- **GIVEN** 已打开改策略
- **WHEN** 清空主名并保存
- **THEN** 弹窗不关闭并展示「请输入文件名」，不发请求

#### Scenario: 校验失败

- **GIVEN** 已打开改策略
- **WHEN** 提交不合规数字
- **THEN** 弹窗不关闭并展示错误，原策略不变

### Requirement: 行内启用开关

系统 SHALL 提供行内 Enabled 开关：点击 MUST 立即提交，SHALL NOT 打开确认框。禁用后行 MUST 仍在列表，知识库 `documentCount` MUST NOT 因禁用而减少。

#### Scenario: 关闭启用

- **GIVEN** 文档已启用
- **WHEN** 拨动开关为关且成功
- **THEN** 无确认框，该行 `enabled=false` 仍可见，文档数不变

#### Scenario: 开关失败

- **GIVEN** 已登录
- **WHEN** 开关请求失败
- **THEN** Toast 展示后端 `message`，开关表现恢复为请求前状态

### Requirement: 删除文档轻确认

系统 SHALL 提供行内「删除」→ O-10（Pencil）：轻确认文案对齐稿面（「确定删除该文档？」等）；Admin 与 Staff MUST 均可提交；删除入口 SHALL NOT 对 Staff 灰显。成功后 MUST Toast、移除该行，知识库文档数减 1。

#### Scenario: 删除成功

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 确认删除且成功
- **THEN** Toast 成功，该行消失，对应知识库文档数减 1

#### Scenario: 取消删除

- **GIVEN** 已打开删除确认
- **WHEN** 取消
- **THEN** 弹窗关闭，记录仍在

#### Scenario: 删除失败

- **GIVEN** 已打开删除确认
- **WHEN** 后端拒绝删除
- **THEN** 展示后端 `message`，记录仍在
