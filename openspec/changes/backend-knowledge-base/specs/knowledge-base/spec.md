## ADDED Requirements

### Requirement: KnowledgeBase 字段约束

Name MUST 在去除首尾空白后长度 1–64，允许中文与常见标点，且 MUST 全局唯一（精确匹配，拉丁字母大小写敏感）。Namespace MUST 由调用方在创建时提供，长度 2–32，仅 `[a-z0-9]`，且 MUST 全局唯一；创建后系统 MUST NOT 允许修改 Namespace。Description MAY 为空，若提供则 MUST 不超过 200 字。

#### Scenario: 非法 Name 或 Namespace 创建失败

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** Name 为空或超 64，或 Namespace 不合 `[a-z0-9]`{2,32}
- **THEN** 系统拒绝创建且不产生记录

#### Scenario: Name 或 Namespace 冲突

- **GIVEN** 已登录，且已存在相同 Name 或相同 Namespace 的 KnowledgeBase
- **WHEN** 再次提交创建
- **THEN** 系统拒绝创建且不覆盖已有记录

### Requirement: 创建 KnowledgeBase

已登录的 Admin 与 Staff SHALL 可创建 KnowledgeBase。创建请求 MUST 包含 Name、Namespace 与目录内 EmbeddingModel；Description MAY 省略。创建成功后，系统 MUST 持久化创建者 AdminUser id，且 MUST 绑定所提交的 Namespace 与 EmbeddingModel。

#### Scenario: 已登录创建成功

- **GIVEN** Admin 或 Staff 已登录，Name 与 Namespace 未被占用，EmbeddingModel 在模拟目录中
- **WHEN** 提交合法创建请求
- **THEN** 创建成功，随后可在列表与详情中看到该库，且 Namespace 与 EmbeddingModel 与提交一致

#### Scenario: 未登录创建被拒绝

- **GIVEN** 无有效管理端 token
- **WHEN** 调用创建接口
- **THEN** 系统拒绝（未登录）

### Requirement: 分页列表 KnowledgeBase

已登录的 Admin 与 Staff SHALL 可分页查询全部 KnowledgeBase（全局可见，不按创建人过滤）。默认 pageSize MUST 为 20，上限 MUST 为 100；超过上限或小于 1 时系统 MUST 拒绝。系统 SHALL 支持按 Name 模糊筛选，MUST NOT 提供 Namespace 筛选。默认 MUST 按创建时间倒序。列表项 MUST 含 Name、Namespace、EmbeddingModel，MUST NOT 含文档数、切片数或索引状态。

#### Scenario: 默认分页列表

- **GIVEN** Admin 或 Staff 已登录，且库中有多条记录
- **WHEN** 请求列表且未指定 pageSize
- **THEN** 返回按创建时间倒序的结果，pageSize 默认为 20，且不含摄入类字段

#### Scenario: Name 模糊筛选

- **GIVEN** 已登录，且存在名称可被关键字匹配的 KnowledgeBase
- **WHEN** 请求列表并携带 Name 模糊条件
- **THEN** 仅返回名称匹配的记录

#### Scenario: pageSize 超上限拒绝

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求列表且 pageSize 大于 100
- **THEN** 系统拒绝该请求

### Requirement: 查询 KnowledgeBase 详情

已登录的 Admin 与 Staff SHALL 可按 id 查询任意 KnowledgeBase 详情。详情 MUST 包含 Name、Description、Namespace、EmbeddingModel 与审计字段。目标不存在时系统 MUST 拒绝。

#### Scenario: 按 id 查询成功

- **GIVEN** 已登录且目标 KnowledgeBase 存在
- **WHEN** 按 id 查询详情
- **THEN** 返回该库字段，且 Namespace 与 EmbeddingModel 与创建时一致

#### Scenario: 目标不存在

- **GIVEN** 已登录
- **WHEN** 查询不存在的 id
- **THEN** 系统拒绝（知识库不存在）

### Requirement: 修改 Name 与 Description

已登录的 Admin 与 Staff SHALL 可修改任意 KnowledgeBase 的 Name 与 Description，包括他人创建的库。新 Name MUST 满足字段约束且全局唯一。系统 MUST NOT 因该请求更改 Namespace 或 EmbeddingModel。Description MAY 更新为空。

#### Scenario: 修改任意库的显示名成功

- **GIVEN** 已登录，目标存在，且新 Name 未被其他库占用
- **WHEN** 提交合法的 Name 与 Description
- **THEN** 更新成功，且 Namespace 与 EmbeddingModel 保持原值

#### Scenario: 新 Name 冲突或不合规

- **GIVEN** 已登录且目标存在
- **WHEN** 将 Name 改为已存在名称或不合规值
- **THEN** 系统拒绝，原记录不变

### Requirement: 删除 KnowledgeBase

角色为 Admin 的调用方 SHALL 可物理删除 KnowledgeBase，当且仅当该库下没有 Document。Staff MUST NOT 删除。删除成功后，原 Namespace MUST 立即可被新库使用。本阶段若尚未有 Document 数据，占用检查 MUST 仍被调用；当检查报告存在 Document 时系统 MUST 拒绝删除。

#### Scenario: Admin 删除空库并释放 Namespace

- **GIVEN** Admin 已登录，目标存在且占用检查报告无 Document
- **WHEN** 物理删除该库
- **THEN** 删除成功，详情不可再查，且原 Namespace 可立即用于创建新库

#### Scenario: Staff 删除被拒绝

- **GIVEN** Staff 已登录且目标存在
- **WHEN** 尝试删除
- **THEN** 系统拒绝（无权限），记录仍在

#### Scenario: 存在 Document 时拒绝删除

- **GIVEN** Admin 已登录，且占用检查报告目标下存在 Document
- **WHEN** 尝试删除
- **THEN** 系统拒绝，记录仍在
