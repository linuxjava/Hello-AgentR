## MODIFIED Requirements

### Requirement: 创建仅接受目录内模型 id

创建 KnowledgeBase 时，`embeddingModel` MUST 为当前配置目录中的某个 `id`。系统 MUST 拒绝目录外 id。创建成功后，`embeddingModel` MUST 不可修改。

#### Scenario: 目录内 id 创建成功

- **GIVEN** 已登录，且提交的 `embeddingModel` 存在于当前目录 `id` 集合
- **WHEN** 创建 KnowledgeBase
- **THEN** 创建成功，详情中的 `embeddingModel` 与提交值一致

#### Scenario: 目录外 id 被拒绝

- **GIVEN** 已登录
- **WHEN** 使用不在目录中的 `embeddingModel` 创建
- **THEN** 系统拒绝创建且不产生记录

### Requirement: 目录漂移下的历史库语义

若历史 KnowledgeBase 绑定的 `embeddingModel` id 后续从配置目录中移除，系统 SHALL 允许该历史库继续列表、详情、改 Name/Description 与删除；系统 SHALL 仅在新建时拒绝目录外 id。

#### Scenario: 漂移后历史库仍可维护

- **GIVEN** 某历史 KnowledgeBase 绑定 id 已不在当前目录
- **WHEN** 查询详情、修改 Name/Description、删除
- **THEN** 上述操作仍按既有规则执行（不因目录漂移失败）

#### Scenario: 漂移后新建仍拒绝目录外 id

- **GIVEN** 某 id 已从目录移除
- **WHEN** 使用该 id 新建 KnowledgeBase
- **THEN** 系统拒绝创建
