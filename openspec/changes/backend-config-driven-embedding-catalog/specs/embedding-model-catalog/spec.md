## MODIFIED Requirements

### Requirement: EmbeddingModel 只读目录（配置驱动）

已登录的 Admin 与 Staff SHALL 可获取 EmbeddingModel 目录。目录 MUST 来自部署侧 YAML 配置，MUST NOT 依赖进程内写死模拟标识。目录项 MUST 包含 `id`、`model`、`dimension`、`providerId`、`priority`、`isDefault`，并按 `priority ASC, id ASC` 返回。目录接口 MUST NOT 返回敏感连接信息（如 `apiKey`）。

#### Scenario: 已登录获取配置目录

- **GIVEN** Admin 或 Staff 已登录，且配置中存在多个模型
- **WHEN** 请求 EmbeddingModel 目录
- **THEN** 返回对象列表，字段完整，顺序为 `priority ASC, id ASC`

#### Scenario: 未登录获取目录被拒绝

- **GIVEN** 无有效管理端 token
- **WHEN** 请求 EmbeddingModel 目录
- **THEN** 系统拒绝（未登录）

#### Scenario: 响应不泄露敏感字段

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求 EmbeddingModel 目录
- **THEN** 响应中不包含 `apiKey` 或其他密钥字段

### Requirement: 配置加载与校验

系统启动时 SHALL 加载 `modelProviders` 与 `embeddingModels` 配置，并执行一致性校验。以下情况 MUST 使启动失败：`modelProviders` key 非法、`embeddingModels.id` 冲突、`model` 为空、`dimension` 非法或不一致、`providerId` 悬空、`isDefault=true` 数量不是 1。`apiKey` 为空 MAY 不阻断启动；`embeddingModels` 为空 MAY 启动但创建 SHALL 被拒绝。

#### Scenario: providerId 悬空导致启动失败

- **GIVEN** 某模型的 `providerId` 不在 `modelProviders` key 集合中
- **WHEN** 应用启动并加载配置
- **THEN** 启动失败并报告配置错误

#### Scenario: 维度不一致导致启动失败

- **GIVEN** 目录中存在不同 `dimension` 的模型
- **WHEN** 应用启动并加载配置
- **THEN** 启动失败并报告维度不一致

#### Scenario: 空目录可启动但创建受限

- **GIVEN** `embeddingModels` 为空
- **WHEN** 应用启动并调用创建 KnowledgeBase
- **THEN** 启动成功，创建因模型不合法被拒绝
