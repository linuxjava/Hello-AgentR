# Context Map

## Contexts

- [Backend / Admin Identity](./docs/backend/context/admin-identity/CONTEXT.md) — Web 管理端登录与 AdminUser（与终端用户身份隔离）；V0.1 引入
- [Backend / Knowledge](./docs/backend/context/knowledge/CONTEXT.md) — 管理端治理的 KnowledgeBase（本阶段仅容器，不含文档/切块/索引）；V0.2 引入
- [Frontend Admin / Console UX](./docs/frontend-admin/CONTEXT.md) — Web 管理端屏态与交互边界（消费 Admin Identity 与 Knowledge）

后端词汇表索引：[`docs/backend/CONTEXT.md`](./docs/backend/CONTEXT.md)

## Relationships

- **Admin Identity ⊥ End-User Identity（规划中）**：管理端凭证不得用于用户 Web 端或 App 登录；分表、分登录入口。终端用户上下文尚未建模。见 [ADR-0001](./docs/adr/0001-separate-admin-and-enduser-identity.md)。
- **Frontend Admin → Admin Identity**：管理端 UI 只对接 `/admin/**` API 与 AdminUser 能力矩阵；不引入 EndUser 概念。会话 token 存 localStorage，见 [ADR-0002](./docs/adr/0002-admin-console-token-in-localstorage.md)。
- **Admin Identity → Knowledge**：已登录 AdminUser 治理 KnowledgeBase；Knowledge 不拥有身份，只引用操作者。
- **Frontend Admin → Knowledge**：管理端「知识库管理」消费 Knowledge API（列表 / 创建 / 改 Name·描述 / 删除 / 模拟目录）；屏态见 Frontend Admin CONTEXT，实体定义仍只在 Backend / Knowledge。
