## ADDED Requirements

### Requirement: EmbeddingModel 只读模拟目录

已登录的 Admin 与 Staff SHALL 可获取 EmbeddingModel 模拟目录。目录 MUST 由服务端提供，MUST 包含至少两个稳定标识，且本阶段 MUST NOT 依赖外部模型注册中心。未登录调用方 MUST NOT 获取目录。

#### Scenario: 已登录获取目录

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求 EmbeddingModel 目录
- **THEN** 返回至少两个稳定标识，且两次请求的标识集合一致

#### Scenario: 未登录获取目录被拒绝

- **GIVEN** 无有效管理端 token
- **WHEN** 请求 EmbeddingModel 目录
- **THEN** 系统拒绝（未登录）

### Requirement: 创建仅接受目录内标识

创建 KnowledgeBase 时，EmbeddingModel MUST 为模拟目录中的某一标识。系统 MUST 拒绝目录外的标识。创建成功后，该 EmbeddingModel MUST 不可更改。

#### Scenario: 目录内标识创建成功

- **GIVEN** 已登录，且所选标识存在于模拟目录
- **WHEN** 创建 KnowledgeBase
- **THEN** 创建成功，详情中的 EmbeddingModel 等于所选标识

#### Scenario: 目录外标识被拒绝

- **GIVEN** 已登录
- **WHEN** 使用不在模拟目录中的 EmbeddingModel 创建
- **THEN** 系统拒绝创建且不产生记录

#### Scenario: 创建后不能更换 EmbeddingModel

- **GIVEN** 已登录且目标 KnowledgeBase 已创建
- **WHEN** 调用修改接口
- **THEN** 响应与持久化中的 EmbeddingModel 仍为创建时的值
