## Why

登录页与最小会话（`add-admin-login-page`）已落地，但受保护页仍缺 **Admin Shell** 与 **账号治理闭环**，无法完成「登录 → 首页 → 账号列表 → 创建/编辑/删除 → 改己密/登出」验收。后端 `/admin/users/**` 与改己密 API 已就绪；视觉与交互定稿以 Pencil《登录账号管理》为准，需按稿实现壳层与账号管理，避免按 IXD ASCII 线框自行发明布局。

## What Changes

- 新增 **Admin Shell**：侧栏（首页 / 账号管理）、顶栏身份下拉（修改密码 / 登出）、面包屑；玻璃拟态布局对齐 Pencil `P-02` / `P-03`
- 新增 **首页占位**（`P-02`）：文案与构图按 Pencil，无业务卡片/统计
- 新增 **账号列表**（`P-03`）：分页、username 模糊、role 筛选；列与行操作按 Pencil（头像缩写 + 用户名；操作「编辑」「删除」；**不展示 Bootstrap 列**）
- 新增模态：**创建账号**（O-01）、**编辑账号**（O-02：改角色 + 可选重置密码并二次确认）、**删除确认**（O-03）、**修改密码（己）**（O-04）
- Staff 写操作入口：灰显外观但可点 → Toast「无权限执行此操作」（对齐 Pencil / IXD 已确认差异，不以 PRD tooltip 为准）
- Toast（G-01）：成功写操作、无权限、网络异常
- 登出调用 `POST /admin/auth/logout`（或等价清会话）；改己密成功强制清会话回登录页

## Out of Scope（不做）

- 登录页重做（已由 `add-admin-login-page` 覆盖；仅复用其会话/门禁）
- 启用/停用、自定义角色、验证码、失败锁定
- 昵称/头像上传/邮箱、审计日志页
- 强制首次登录改密
- EndUser / RAG 业务页
- 后端 API 变更（只消费 `docs/backend/api.md`）
- 以 IXD ASCII 线框为准的布局/文案（**视觉 SSOT = Pencil**；IXD 仅作交互行为参考）

## Capabilities

### New Capabilities

- `frontend-admin-shell`：管理壳层布局、侧栏导航、顶栏身份下拉、面包屑、首页占位、登出与改己密入口挂载
- `frontend-admin-account-mgmt`：账号列表筛选分页、创建/编辑/删除模态、Staff 无权限 Toast、保护目标删除禁用、与后端 users API 对接

### Modified Capabilities

- （无；`openspec/specs/` 尚无已归档的前端壳层/账号能力；登录能力不在本变更修改）

## Impact

- **代码**：`frontend-admin` 新增 Shell 布局、Home/Users 页、模态与 Toast；扩展 `auth`/`users` API 客户端；受保护路由挂入 Shell
- **API 消费**：`GET/POST /admin/users`、`PUT /admin/users/{id}/password|role`、`DELETE /admin/users/{id}`、`PUT /admin/auth/password`、`POST /admin/auth/logout`
- **视觉依据**：`docs/frontend-admin/版本迭代/v0.1/ui/登录账号管理.pen`（帧 `P-02`、`P-03`、`O-01`–`O-04`）；行为对齐 `ixd.md` / `prd.md`，文案与结构以 Pencil 节点为准
- **依赖变更**：复用既有会话 store、API client、RHF/zod；可能引入轻量 Toast
- **与既有 OpenSpec**：依赖 `add-admin-login-page` 会话门禁；后端契约来自 `add-admin-user-auth`

## 回滚方案

- **代码回滚**：还原本变更相关提交；受保护路由可退回仅首页占位或仅登录门禁
- **本地数据**：无服务端迁移；用户可清除 localStorage token
- **风险**：回滚后无法在管理端治理账号；不影响后端 Admin API
