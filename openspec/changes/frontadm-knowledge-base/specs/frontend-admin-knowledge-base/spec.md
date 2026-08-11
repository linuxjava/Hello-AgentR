## ADDED Requirements

### Requirement: 侧栏知识库入口与顺序

系统 SHALL 在 Admin Shell 侧栏提供三项导航，顺序 MUST 为：首页、知识库管理、账号管理（Pencil `P-02` / `P-04`）。点击「知识库管理」SHALL 进入知识库列表并高亮该项。未登录访问该路由时系统 SHALL 清会话并进入登录页。

#### Scenario: 已登录进入知识库

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 点击侧栏「知识库管理」
- **THEN** 进入知识库列表，该项高亮，侧栏仍含「首页」与「账号管理」且顺序为首页 → 知识库管理 → 账号管理

#### Scenario: 无会话访问知识库路由

- **GIVEN** 无有效会话
- **WHEN** 访问知识库路由
- **THEN** 系统清除本地会话并进入登录页

### Requirement: 知识库列表列与筛选分页

系统 SHALL 提供知识库列表（Pencil `P-04/H-01`）：表头 MUST 为名称、命名空间、向量模型、描述、创建时间、操作；空描述 MUST 显示为「—」；向量模型 MUST 展示目录稳定标识。系统 SHALL NOT 展示文档数、切片数、索引状态、createdBy、Namespace 筛选。系统 SHALL 支持名称模糊（占位「模糊搜索名称」）、「查询」、默认 pageSize=20、创建时间倒序、分页控件文案含「20 条/页」。

#### Scenario: 有数据列表

- **GIVEN** 已登录且库中有多条
- **WHEN** 打开知识库列表且不填筛选
- **THEN** 按创建时间倒序分页展示约定列，且不含文档数/切片数/索引状态

#### Scenario: 名称模糊与翻页

- **GIVEN** 已登录
- **WHEN** 按名称模糊查询或翻页
- **THEN** 结果与筛选/分页一致，页上没有 Namespace 筛选控件

#### Scenario: 列表请求失败

- **GIVEN** 已登录
- **WHEN** 列表请求失败
- **THEN** 系统以 Toast 展示错误且不展示伪造行

### Requirement: 空列表态

系统 SHALL 在没有任何知识库时展示 Pencil `P-04/H-03`：标题「暂无知识库」，说明「还没有任何知识库。可点击右上角「创建知识库」新建空容器。」；「创建知识库」入口 MUST 对 Admin 与 Staff 可用。

#### Scenario: 空库可创建

- **GIVEN** 已登录且一条知识库都没有
- **WHEN** 打开知识库列表
- **THEN** 展示空态文案且「创建知识库」可用

### Requirement: 创建知识库模态

系统 SHALL 提供「创建知识库」→ O-05（Pencil）：字段顺序 MUST 为名称、命名空间、向量模型下拉、描述；占位与按钮「取消」「创建」MUST 对齐 Pencil。向量模型打开时 MUST 不预选任何项，触发器 MUST 显示「请选择向量模型」。向量模型选项 SHALL 仅来自 `GET /admin/embedding-models`，SHALL NOT 允许自填任意值，SHALL NOT 展示「模拟目录，非生产模型」说明句。未选择模型时提交 SHALL 展示「请选择向量模型」且不得建库。Admin 与 Staff 均可提交合法创建。

#### Scenario: 创建成功

- **GIVEN** 已登录且目录接口成功、名称与命名空间未被占用
- **WHEN** 打开创建弹窗，选择目录中的模型并提交合法表单
- **THEN** Toast「创建成功」，弹窗关闭，列表可见新库且命名空间与模型与提交一致

#### Scenario: 未选向量模型

- **GIVEN** 已打开创建弹窗且目录已加载
- **WHEN** 未选择向量模型即提交
- **THEN** 触发器仍显示「请选择向量模型」，展示该提示文案，不创建知识库

#### Scenario: 名称冲突

- **GIVEN** 已登录且目标名称已存在
- **WHEN** 再次提交该名称
- **THEN** 弹窗不关闭，内展示后端文案（如「名称已存在」），原库不被覆盖

#### Scenario: 字段不合规

- **GIVEN** 已打开创建弹窗
- **WHEN** 名称为空或超 64、命名空间含大写或连字符、或描述超 200
- **THEN** 弹窗不关闭，展示内联或弹窗内错误，列表无新行

### Requirement: 创建时目录不可用

当模拟目录请求失败时，系统 SHALL 表现 Pencil `O-05b`：红条「向量模型目录暂不可用，无法提交创建。」，向量模型处显示「目录不可用」，「创建」MUST 禁用，SHALL NOT 成功建库。

#### Scenario: 目录失败不可提交

- **GIVEN** 已登录且模拟目录请求失败
- **WHEN** 打开创建弹窗并试图提交
- **THEN** 创建按钮不可用，提示目录不可用，无新库

### Requirement: 编辑名称与描述

系统 SHALL 提供行内「编辑」→ O-06（Pencil）：仅名称与描述可改；SHALL NOT 展示命名空间、向量模型或其「创建后不可修改」提示；操作「取消」「保存」。Admin 与 Staff 均可保存合法更新。PUT 仍不得提交 namespace / embeddingModel。

#### Scenario: 改文案成功

- **GIVEN** 已登录且目标存在
- **WHEN** 打开编辑，修改名称或清空描述并保存
- **THEN** Toast 成功，列表刷新；列表上的命名空间与向量模型仍为原值

#### Scenario: 编辑名称冲突

- **GIVEN** 已登录
- **WHEN** 将名称改为已存在名称并保存
- **THEN** 弹窗内展示错误，原记录不变

### Requirement: 删除确认与有文档拒绝

系统 SHALL 仅对 Admin 打开 O-07（Pencil）：标题「删除知识库」，副标题「此操作不可恢复」，确认句含目标名称，警告「将执行彻底删除，且无法恢复。」，按钮「取消」「确认删除」。确认成功后 SHALL Toast 并移除该行，原命名空间可再建。若后端返回有文档（`A002008`），系统 SHALL 保持弹窗并展示「知识库下仍有文档，不能删除」，记录仍在。

#### Scenario: Admin 删除成功

- **GIVEN** Admin 已登录且目标无文档
- **WHEN** 打开删除确认并确认成功
- **THEN** Toast 成功，该行消失，可用同一命名空间再创建

#### Scenario: 有文档不能删

- **GIVEN** Admin 已登录且后端返回 A002008
- **WHEN** 确认删除
- **THEN** 弹窗内展示「知识库下仍有文档，不能删除」，记录仍在

### Requirement: Staff 删除无权限反馈

系统 SHALL 让 Staff 看到与 Admin 占位一致的删除入口，样式灰显但仍可点击；点击后 SHALL Toast「无权限删除知识库」，SHALL NOT 打开可提交的删除确认，SHALL NOT 发送删除请求。Staff 的创建与编辑 MUST 仍可用。

#### Scenario: Staff 点击删除

- **GIVEN** Staff 已登录
- **WHEN** 点击行内灰显删除
- **THEN** Toast「无权限删除知识库」，不打开删除确认，列表不变

#### Scenario: Staff 仍可创建与编辑

- **GIVEN** Staff 已登录
- **WHEN** 点击「创建知识库」或行内「编辑」
- **THEN** 打开对应可提交模态
