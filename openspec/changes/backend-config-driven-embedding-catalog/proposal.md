## Why

V0.2 的 EmbeddingModel 目录为进程内模拟字符串列表，无法按环境配置真实可用模型，也无法表达默认模型、排序优先级、上游模型名与 provider 归属。需要升级为 YAML 配置驱动，保证创建 KnowledgeBase 时只可绑定已配置模型，并在启动阶段对配置一致性 fail-fast。

## What Changes

- 将 EmbeddingModel 目录来源从硬编码改为 YAML 配置（`modelProviders` + `embeddingModels`）
- `modelProviders` 使用 map（key 即 providerId），首版仅允许 `alibailian`、`siliconflow`
- `embeddingModels` 使用对象列表：`id`、`model`、`dimension`、`providerId`、`priority`、`isDefault`
- `GET /admin/embedding-models` 从字符串数组改为对象列表，排序规则为 `priority ASC, id ASC`
- 启动校验新增：provider 引用完整性、模型 id 全局唯一、dimension 全局一致、默认模型唯一
- 创建 KnowledgeBase 仍只接收 `embeddingModel=id`，并仅允许目录内 id
- 目录漂移采用宽松策略：历史库可读/改名描述/删除，仅阻断新建非法 id

## Out of Scope（不做）

- Web 管理端页面与交互改造
- Chat/LLM 的 Provider 与模型配置
- Provider/Model 的 CRUD 管理 API
- 上游连通性探测与真实 Embedding 调用
- 修改 KnowledgeBase 的 Namespace 或 EmbeddingModel

## Capabilities

### Modified Capabilities

- `embedding-model-catalog`：从模拟字符串目录升级为配置驱动对象目录，并补充启动校验与排序/默认规则
- `knowledge-base`：创建模型校验来源切换为配置目录；明确目录漂移语义（仅影响新建）

## Impact

- **代码**：`backend/app` 的 EmbeddingModelCatalog 实现、配置绑定类、创建校验逻辑、目录 Controller 返回 DTO
- **API**：`GET /admin/embedding-models` 响应结构从 `string[]` 升级为对象列表（破坏性变更）
- **配置**：新增/调整应用 YAML 结构与环境变量占位（`apiKey`）
- **测试**：新增启动期配置校验用例、目录排序用例、默认模型唯一与维度一致性用例
- **兼容性**：前端消费方需后续对齐新目录结构（本变更不交付前端）

## 回滚方案

- **代码回滚**：回退本变更提交，恢复 V0.2 `StaticEmbeddingModelCatalog` 模拟目录实现
- **配置回滚**：恢复旧配置或移除新 `model-catalog` 配置段
- **风险说明**：回滚后目录丢失 provider/model 细粒度信息（默认模型、priority、model），但不影响已存在 KnowledgeBase 的基础 CRUD
