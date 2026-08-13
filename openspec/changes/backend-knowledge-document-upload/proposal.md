## Why

V0.2/V0.3 已能治理 KnowledgeBase 容器与向量模型目录，但库内没有 Document，无法入库源文件，「无文档才能删库」也无法被真实数据触发。需要先把上传与元数据（含分块策略）做成可验收的后端 API，且与「开始分块」解耦，避免摄入管线一次做完无法单独上线。

## What Changes

- 新增 KnowledgeBase 下 **Document** 生命周期：单文件本地上传、分页列表、详情、改 ChunkStrategy、启用/禁用、删除
- 上传时 MUST 选定 `OVERLAPPING` 或 `STRUCTURE_AWARE` 及对应 JSON 参数；状态固定 `UPLOADED`（本变更不执行切块）
- 源文件写入部署级 **ObjectStorage**（首版 `s3`，适配器可扩展 `oss`）；objectKey 系统生成且含 Namespace，API 不返回
- **BREAKING**（相对 V0.2 列表契约）：KnowledgeBase 列表/详情增加 `documentCount`；库下有 Document 时删除知识库拒绝（`A002008` 可被真实数据触发）
- Tika 探测 MIME 白名单；0 字节拒绝；文件大小上限由部署配置声明
- `DocumentPresence` 从恒未占用改为按库统计真实 Document 条数

## Out of Scope（不做）

- 开始分块、解析、Chunk 实体、向量写入、索引状态
- URL 地址上传（仅预留 `sourceType=URL`）
- 预签名直传/下载；Document 源文件下载或预览
- 以 OSS 作为本变更活跃存储后端
- 修改与 OriginalFilename 分离的显示名/备注
- Web 管理端「进入知识库」与 Document UI
- EndUser 检索/对话摄入入口
- 通过 API 增删改 ObjectStorage / ModelProvider / EmbeddingModel

## Capabilities

### New Capabilities

- `knowledge-document`：Document 上传（本地文件 + 策略）、列表、详情、改策略、启用/禁用、删除；Tika MIME；与 ObjectStorage 的写入/同步删除语义

### Modified Capabilities

- `knowledge-base`：列表/详情 MUST 返回 `documentCount`；删除占用检查改为真实 Document 计数（有文档则 `A002008`）

## Impact

- **代码**：`backend/app` `features/knowledge` 新增 Document 持久化、Controller/Service、Tika 探测；`fw-base` 提供 ObjectStorage 端口与 S3 实现；替换 `EmptyDocumentPresence`
- **API**：新增 `/admin/knowledge-bases/{id}/documents/**`；KnowledgeBaseView 增加 `documentCount`
- **配置**：新增 ObjectStorage YAML（密钥环境变量占位）；servlet multipart 大小上限
- **依赖**：Apache Tika（含容器探测）、S3 兼容客户端
- **数据**：新增文档表（物理删除）；objectKey 含 Namespace
- **测试**：上传成功/失败、策略校验、同步删除、有文档拒删库、启动期存储结构校验
- **兼容性**：管理端若已对接知识库列表，需容忍新增 `documentCount` 字段；本变更不交付前端页面

## 回滚方案

- **代码回滚**：回退本变更提交；恢复 `EmptyDocumentPresence`；KnowledgeBase 列表不再依赖 `documentCount`
- **数据**：文档表与桶内对象默认保留；回滚后删库占用检查将再次恒为未占用（有对象残留风险，需运维清理桶与表）
- **配置回滚**：移除 ObjectStorage 配置段与 Tika 依赖
- **风险说明**：回滚不会自动删除已上传对象；有文档的库在回滚后可能被误删（占用检查失效）
