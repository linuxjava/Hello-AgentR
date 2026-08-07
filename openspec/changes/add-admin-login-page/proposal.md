## Why

后端 Admin Identity API（`/admin/auth/**`）已就绪，但 `frontend-admin` 仍为无鉴权占位壳，无法完成管理端登录闭环。需先落地登录页（P-01）及最小会话能力，才能继续壳层与账号治理；依据为前端 PRD / IXD V0.1 与 Pencil《登录账号管理》。

## What Changes

- 新增管理端**登录页**（`/login`）：用户名/密码、记住用户名、提交 loading、页内错误态（对齐 IXD `P-01` / `H-01` / `H-02` 与 Pencil）
- 新增前端会话最小能力：登录调用 `POST /admin/auth/login`；token 写入 **localStorage**（ADR-0002）；启动或进入受保护路由时用 `GET /admin/auth/me` 校验
- 路由门禁：未登录访问受保护路由 → `/login`；已登录访问 `/login` → 首页；登录成功 → 首页占位（现有 `/` 可先承接，完整壳层另案）
- 记住用户名：仅缓存 username，不缓存密码；与 token 生命周期独立
- 视觉：按 Pencil 登录帧落地可替换样式（玻璃拟态方向），不在本变更扩展账号治理 UI

## Out of Scope（不做）

- 管理壳层完整实现（侧栏「首页/账号管理」、顶栏身份下拉、面包屑）——后续变更
- 账号列表、创建/编辑/删除、改自己的密码模态、Staff 灰显写操作
- 登录验证码、失败次数锁定、强制首登改密
- EndUser 登录、RAG 业务页
- 后端 API 变更（只消费既有契约）
- HttpOnly Cookie 会话方案（见 ADR-0002；本变更不改决策）

## Capabilities

### New Capabilities

- `frontend-admin-login`：管理端登录页 UI、记住用户名、登录请求与错误展示、token/me 会话门禁与登录后落地

### Modified Capabilities

- （无；`openspec/specs/` 当前无既有前端登录能力；后端 `admin-auth` 由既有变更覆盖，本变更不修改其后端 requirements）

## Impact

- **代码**：`frontend-admin` 新增登录页、auth/session 模块、路由与 API 客户端；可能调整 `App.tsx` / `HomePage` 为受保护落地
- **API 消费**：`POST /admin/auth/login`、`GET /admin/auth/me`（上下文路径以 `docs/backend/api.md` 为准）
- **存储**：localStorage 存 token；另键存「记住的用户名」
- **依赖**：现有 Vite/React 脚手架；HTTP 客户端按工程惯例引入或复用
- **文档依据**：`docs/frontend-admin/版本迭代/v0.1/prd.md`、`ixd.md`、`ui/登录账号管理.pen`；ADR-0001 / ADR-0002
- **与既有 OpenSpec 变更关系**：后端 `add-admin-user-auth` 提供契约；本变更仅前端登录页，不重复实现后端

## 回滚方案

- **代码回滚**：还原本变更相关提交；移除 `/login` 与会话门禁后，应用恢复为无鉴权占位壳
- **本地数据**：回滚后用户可手动清除 localStorage 中的 token / 记住用户名键；无服务端迁移需回滚
- **风险**：回滚期间管理端再次无法登录；不影响后端 Admin API 本身
