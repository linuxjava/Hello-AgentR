# Context Map

## Contexts

- [Backend / Admin Identity](./docs/backend/CONTEXT.md) — Web 管理端登录与 AdminUser（与终端用户身份隔离）
- [Frontend Admin / Console UX](./docs/frontend-admin/CONTEXT.md) — Web 管理端屏态与交互边界（消费 Admin Identity）

## Relationships

- **Admin Identity ⊥ End-User Identity（规划中）**：管理端凭证不得用于用户 Web 端或 App 登录；分表、分登录入口。终端用户上下文尚未建模。见 [ADR-0001](./docs/adr/0001-separate-admin-and-enduser-identity.md)。
- **Frontend Admin → Admin Identity**：管理端 UI 只对接 `/admin/**` API 与 AdminUser 能力矩阵；不引入 EndUser 概念。会话 token 存 localStorage，见 [ADR-0002](./docs/adr/0002-admin-console-token-in-localstorage.md)。
