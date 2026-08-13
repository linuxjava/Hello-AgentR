## Why

后端 V0.3 已将 `GET /admin/embedding-models` 从 `string[]` 升级为对象目录（`id/model/dimension/providerId/priority/isDefault`）。若管理端仍按 V0.2 字符串契约消费，会导致创建弹窗模型下拉不可用或提交参数映射错误，阻断知识库创建闭环。

## What Changes

- 前端模型目录消费契约升级为对象列表
- 创建弹窗模型下拉改为消费目录项 `id`（value）并保持默认不预选
- 创建请求继续提交 `embeddingModel=id`
- 目录失败态维持“目录不可用 + 创建禁用”
- 列表“向量模型”列继续展示知识库记录 `embeddingModel`（id）
- Staff 删除限制、编辑限制等行为保持 V0.2 一致

## Out of Scope（不做）

- 后端 API 变更
- Chat/LLM 相关 UI
- Provider 管理页或模型管理页
- 账号治理流程重构
- 视觉系统重做

## Capabilities

### Modified Capabilities

- `frontend-admin-knowledge-base`：模型目录契约从字符串列表切换为对象列表，并更新创建模态映射逻辑

## Impact

- **代码**：`frontend-admin` 知识库页面、`knowledgeApi` 类型、创建模态状态机
- **接口**：消费后端 V0.3 新目录结构
- **测试**：新增/更新目录映射、失败态、创建请求体断言
- **文档**：新增 `docs/frontend-admin/版本迭代/V0.3/prd.md` 与 `ixd.md`

## 回滚方案

- **代码回滚**：回退本变更提交，恢复 V0.2 目录消费逻辑
- **兼容性说明**：回滚后仅可对接旧目录契约（`string[]`）；若后端保持 V0.3，则前端功能会失配
