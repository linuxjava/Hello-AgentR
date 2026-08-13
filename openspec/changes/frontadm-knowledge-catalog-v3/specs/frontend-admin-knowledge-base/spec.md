## MODIFIED Requirements

### Requirement: 创建模态消费配置目录对象

系统在创建知识库时 SHALL 消费 `GET /admin/embedding-models` 的对象目录；下拉选项 value MUST 使用目录项 `id`，且 MUST 默认不预选。系统 SHALL 在提交创建时继续发送 `embeddingModel=id`。

#### Scenario: 目录对象渲染成功

- **GIVEN** Admin 或 Staff 已登录且目录接口返回对象数组
- **WHEN** 打开创建知识库弹窗
- **THEN** 下拉可见目录项，默认显示「请选择向量模型」，且未预选

#### Scenario: 创建提交映射正确

- **GIVEN** 已选择某目录项 `id`
- **WHEN** 提交创建
- **THEN** 请求体中的 `embeddingModel` 等于该 `id`

#### Scenario: 未选模型不可提交

- **GIVEN** 目录加载成功但未选择模型
- **WHEN** 提交创建
- **THEN** 系统提示「请选择向量模型」且不提交成功

### Requirement: 目录失败阻断创建

当目录请求失败时，系统 SHALL 显示目录不可用提示，并 MUST 禁用创建提交动作。

#### Scenario: 目录失败

- **GIVEN** Admin 或 Staff 已登录且目录请求失败
- **WHEN** 打开创建弹窗
- **THEN** 显示目录不可用提示，创建按钮禁用

### Requirement: 列表模型列展示保持一致

知识库列表中的“向量模型”列 SHALL 继续展示记录字段 `embeddingModel`（模型 id），系统 SHALL NOT 因目录新增字段而改为展示其他派生值。

#### Scenario: 创建后列表核对

- **GIVEN** 已用目录项 id 创建成功
- **WHEN** 返回列表查看该记录
- **THEN** “向量模型”列值等于创建时提交的 `embeddingModel` id
