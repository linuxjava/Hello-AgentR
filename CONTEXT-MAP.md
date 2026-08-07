# Context Map

## Contexts

- [Backend / Admin Identity](./docs/backend/CONTEXT.md) — Web 管理端登录与 AdminUser（与终端用户身份隔离）

## Relationships

- **Admin Identity ⊥ End-User Identity（规划中）**：管理端凭证不得用于用户 Web 端或 App 登录；分表、分登录入口。终端用户上下文尚未建模。见 [ADR-0001](./docs/adr/0001-separate-admin-and-enduser-identity.md)。
