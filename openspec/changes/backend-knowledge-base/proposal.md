## Why

管理端已能登录并治理 AdminUser，但没有 KnowledgeBase 容器，后续文档摄入与检索隔离没有稳定锚点。V0.2 先落地空容器 API，避免与解析、切块、向量索引缠在一起无法单独验收（对齐 PRD：`docs/backend/版本迭代/V0.2/prd.md`）。

## What Changes

- 新增 KnowledgeBase 创建 / 分页列表 / 详情 / 修改 Name 与 Description / 物理删除 API
- 新增 Namespace（人填、不可变）与 EmbeddingModel（创建时绑定、不可变）
- 新增 EmbeddingModel 只读模拟目录；创建只接受目录内标识
- 落地 Admin / Staff 能力矩阵与全局可见性；删除仅 Admin，且仅当库下无 Document

## Out of Scope（不做）

- Document 上传、列表、删除
- 解析、切块、向量写入、索引状态
- 按 Namespace 筛选
- 修改 Namespace 或 EmbeddingModel
- 恢复已删除的 KnowledgeBase
- 按创建人或租户隔离可见性
- 管理端知识库页面与视觉实现
- EndUser 检索 / 对话 API

## Capabilities

### New Capabilities

- `knowledge-base`：KnowledgeBase 容器生命周期（创建、列表、详情、改 Name/Description、物理删除、字段约束、可见性与角色鉴权）
- `embedding-model-catalog`：EmbeddingModel 只读模拟目录，以及创建时对目录标识的强制校验

### Modified Capabilities

- （无；`openspec/specs/` 当前无既有能力）

## Impact

- **代码**：`backend/app` 新增 Knowledge 业务模块（建议 `com.xgc.agent.rag.knowledge`）；复用 `fw-base` 统一响应 / 异常 / MyBatis-Plus；鉴权复用 V0.1 `loginType=admin` 与 Admin / Staff
- **数据**：PostgreSQL 新增 KnowledgeBase 表（及 Name / Namespace 唯一约束）；手工 SQL 脚本，与 `t_admin_user.sql` 同一迁移方式
- **API**：在上下文路径 `/hello-agent` 下新增管理端知识库端点（需登录）
- **依赖**：既有 PostgreSQL、Redis、Sa-Token；无真实模型注册中心、无对象存储、无向量库
- **客户端**：为后续 `frontend-admin` 对接提供契约；本变更不实现前端
- **决策依据**：`docs/backend/context/knowledge/CONTEXT.md`、V0.2 PRD

## 回滚方案

- **代码回滚**：还原本变更相关提交；下线新增 Controller / 目录接口
- **数据**：保留 KnowledgeBase 表数据不自动删除；若需彻底回退，由运维按备份脚本手工 drop（高风险，默认不执行）
- **会话**：本变更不引入新会话类型；回滚不影响 AdminUser token
