## Why

Web 管理端尚无独立身份与账号治理 API，无法安全完成首次管理员登录与多人协作下的账号管理。V0.1 需先落地与 EndUser 隔离的 AdminUser 体系，作为后续管理台功能的准入底座（对齐 PRD：`docs/backend/版本迭代/V0.1/prd.md`）。

## What Changes

- 新增管理端专用登录 / 登出 / 当前资料（`me`）/ 修改自己密码 API（Sa-Token 会话）
- 新增 AdminUser 账号治理 API：创建、分页列表、重置他人密码、变更角色、物理删除
- 新增启动时 Bootstrap Admin 初始化（`admin` / `admin@123456`，`bootstrap=true`）
- 固定两角色 Admin / Staff 及能力矩阵鉴权；落地 Bootstrap / 末账号 / 末 Admin / 禁止删自己等保护规则
- 密码变更或删除后作废目标账号全部 token

## Out of Scope（不做）

- 启用 / 停用 AdminUser
- 自定义角色 / 权限码配置
- EndUser 登录与账号 API
- 登录验证码 / 失败次数锁定
- 用户名变更、系统生成临时密码、强制首登改密
- 昵称 / 头像 / 邮箱、操作审计日志 API
- 管理端前端页面与视觉实现
- RAG 业务能力

## Capabilities

### New Capabilities

- `admin-auth`：管理端认证与会话（登录、登出、`me`、改自己密码、token 规则）
- `admin-user-management`：AdminUser 生命周期与角色治理（列表、创建、重置密码、改角色、删除、Bootstrap 初始化与保护规则）

### Modified Capabilities

- （无；`openspec/specs/` 当前无既有能力）

## Impact

- **代码**：`backend/app` 新增 `admin`（或等价）业务模块；复用 `fw-base` 统一响应 / 异常 / MyBatis-Plus / Sa-Token
- **数据**：PostgreSQL 新增 AdminUser 表（及必要索引）；密码单向哈希存储
- **API**：在上下文路径 `/hello-agent` 下新增管理端认证与账号管理端点
- **依赖**：既有 PostgreSQL、Redis、Sa-Token；无新外部厂商依赖
- **客户端**：为后续 `frontend-admin` 对接提供契约；本变更不实现前端
- **决策依据**：ADR-0001（管理端与 EndUser 身份隔离）、`docs/backend/context/admin-identity/CONTEXT.md`

## 回滚方案

- **代码回滚**：还原本变更相关提交；下线新增 Controller / 启动初始化逻辑
- **数据**：保留 AdminUser 表数据不自动删除（避免误伤）；若需彻底回退，由运维按备份脚本手工 drop（高风险，默认不执行）
- **会话**：回滚后旧 token 随 Redis/Sa-Token 配置自然失效或运维清理 Redis 会话键
