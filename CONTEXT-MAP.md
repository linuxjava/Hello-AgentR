# Context Map

## Contexts

- [Backend / Admin Identity](./docs/backend/context/admin-identity/CONTEXT.md) — Web 管理端登录与 AdminUser（与终端用户身份隔离）；V0.1 引入
- [Backend / Knowledge](./docs/backend/context/knowledge/CONTEXT.md) — 管理端治理的 KnowledgeBase 与其下 Document（V0.4 起摄入上传，不含切块执行）；YAML 配置的 ModelProvider / EmbeddingModel 只读目录。源文件经 fw-base ObjectStorage 存取。
- [Frontend Admin / Console UX](./docs/frontend-admin/CONTEXT.md) — Web 管理端屏态与交互边界（消费 Admin Identity 与 Knowledge）

后端词汇表索引：[`docs/backend/CONTEXT.md`](./docs/backend/CONTEXT.md)

## Relationships

- **Admin Identity ⊥ End-User Identity（规划中）**：管理端凭证不得用于用户 Web 端或 App 登录；分表、分登录入口。终端用户上下文尚未建模。见 [ADR-0001](./docs/adr/0001-separate-admin-and-enduser-identity.md)。
- **Frontend Admin → Admin Identity**：管理端 UI 只对接 `/admin/**` API 与 AdminUser 能力矩阵；不引入 EndUser 概念。会话 token 存 localStorage，见 [ADR-0002](./docs/adr/0002-admin-console-token-in-localstorage.md)。
- **Admin Identity → Knowledge**：已登录 AdminUser 治理 KnowledgeBase 与 Document；Knowledge 不拥有身份，只引用操作者。
- **Knowledge → ObjectStorage**：Document 源文件经 `fw-base` 的可插拔 ObjectStorage 存取；部署级单一活跃后端（首版 s3）。Knowledge 只约定 objectKey，不拥有存储适配器。见 [ADR-0003](./docs/adr/0003-pluggable-object-storage.md)。
- **Frontend Admin → Knowledge**：管理端「知识库管理」消费 Knowledge API。V0.4 后端新增 Document 上传/列表/改策略/删除，但**管理端 Document UI 不在本阶段验收**；实体定义仍只在 Backend / Knowledge。

