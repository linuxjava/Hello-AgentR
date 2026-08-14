## MODIFIED Requirements

### Requirement: 分页列表 KnowledgeBase

已登录的 Admin 与 Staff SHALL 可分页查询全部 KnowledgeBase（全局可见，不按创建人过滤）。默认 pageSize MUST 为 20，上限 MUST 为 100；超过上限或小于 1 时系统 MUST 拒绝。系统 SHALL 支持按 Name 模糊筛选，MUST NOT 提供 Namespace 筛选。默认 MUST 按创建时间倒序。列表项 MUST 含 Name、Namespace、EmbeddingModel 与 **documentCount**（该库下 Document 条数，含已禁用），MUST NOT 含切片数或索引状态。

#### Scenario: 默认分页列表

- **GIVEN** Admin 或 Staff 已登录，且库中有多条记录
- **WHEN** 请求列表且未指定 pageSize
- **THEN** 返回按创建时间倒序的结果，pageSize 默认为 20，且每条含 documentCount，不含切片数或索引状态

#### Scenario: Name 模糊筛选

- **GIVEN** 已登录，且存在名称可被关键字匹配的 KnowledgeBase
- **WHEN** 请求列表并携带 Name 模糊条件
- **THEN** 仅返回名称匹配的记录

#### Scenario: pageSize 超上限拒绝

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求列表且 pageSize 大于 100
- **THEN** 系统拒绝该请求

### Requirement: 查询 KnowledgeBase 详情

已登录的 Admin 与 Staff SHALL 可按 id 查询任意 KnowledgeBase 详情。详情 MUST 包含 Name、Description、Namespace、EmbeddingModel、**documentCount** 与审计字段。目标不存在时系统 MUST 拒绝。

#### Scenario: 按 id 查询成功

- **GIVEN** 已登录且目标 KnowledgeBase 存在
- **WHEN** 按 id 查询详情
- **THEN** 返回该库字段，含 documentCount，且 Namespace 与 EmbeddingModel 与创建时一致

#### Scenario: 目标不存在

- **GIVEN** 已登录
- **WHEN** 查询不存在的 id
- **THEN** 系统拒绝（知识库不存在）

### Requirement: 删除 KnowledgeBase

角色为 Admin 的调用方 SHALL 可物理删除 KnowledgeBase，当且仅当该库下 Document 条数为 0。Staff MUST NOT 删除。删除成功后，原 Namespace MUST 立即可被新库使用。占用检查 MUST 使用真实 Document 计数。

#### Scenario: Admin 删除空库并释放 Namespace

- **GIVEN** Admin 已登录，目标存在且 documentCount 为 0
- **WHEN** 物理删除该库
- **THEN** 删除成功，详情不可再查，且原 Namespace 可立即用于创建新库

#### Scenario: Staff 删除被拒绝

- **GIVEN** Staff 已登录且目标存在
- **WHEN** 尝试删除
- **THEN** 系统拒绝（无权限），记录仍在

#### Scenario: 存在 Document 时拒绝删除

- **GIVEN** Admin 已登录，且目标下至少有一条 Document
- **WHEN** 尝试删除
- **THEN** 系统拒绝，知识库与 Document 仍在
