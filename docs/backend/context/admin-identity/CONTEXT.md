# Backend / Admin Identity

Web 管理端运营身份：登录、账号生命周期与初始化管理员。与终端用户身份完全隔离。  
本词汇表由 V0.1 引入，跨版本持续生效；不随版本目录归档。

## Language

**AdminUser（管理端账号）**：
可登录 Web 管理端的后台身份主体；与终端用户不是同一类实体，分表、分登录入口。每个 AdminUser 拥有一个角色。
_Avoid_: Operator、User、Account、后台用户、管理员账号（泛指时；勿与角色 Admin 混淆）

**EndUser（终端用户）**：
使用用户 Web 端或 App 的身份主体；本阶段不实现其登录与账号 API。
_Avoid_: User（单独使用时）、客户、C 端用户（口语可，文档用 EndUser）

**Bootstrap Admin**：
带 `bootstrap=true` 标记的初始 AdminUser；首次就绪时用户名为 `admin`、初始密码为 `admin@123456`。凭证不得用于 EndUser 客户端。该标记不可去除；该账号不得被删除。角色固定为 Admin。
_Avoid_: 用用户名 `admin` 作为唯一判定、超级管理员（口语）、把 Bootstrap 当成角色名

**Role · Admin（管理员）**：
两种固定角色之一；可做账号治理（创建 / 删除 / 重置他人密码 / 指定角色）。可存在多名带该角色的 AdminUser。
_Avoid_: 超管、root、Bootstrap、AdminUser（AdminUser 是账号实体，Admin 是角色）

**Role · Staff（运营人员）**：
两种固定角色之一；可登录、列表查询、改自己的密码；不可创建 / 删除 AdminUser，不可重置他人密码，不可指定或变更角色。
_Avoid_: Operator、普通用户、AdminUser（实体名）

**Last AdminUser Guard（末账号保护）**：
当库中仅剩一个 AdminUser 时，不允许删除该账号。当仅剩一名角色为 Admin 的 AdminUser 时，不允许将其角色降为 Staff 或删除该账号（避免管理锁死）。
_Avoid_: 最后一个管理员（口语）、Last Operator Guard

## Capability Matrix（本阶段）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 登录管理端 | 能 | 能 |
| 创建 AdminUser（指定 Admin 或 Staff） | 能 | 不能 |
| 列表 / 分页查询 AdminUser | 能 | 能 |
| 重置他人密码 | 能 | 不能 |
| 重置 Bootstrap Admin 密码 | 能 | 不能 |
| 删除他人（非 Bootstrap、且不触发末账号/末 Admin 保护） | 能 | 不能 |
| 删除 Bootstrap Admin | 不能 | 不能 |
| 修改自己的密码 | 能 | 能 |
| 变更他人角色 | 能（不得使 Admin 人数降为零） | 不能 |

## API Use Cases（本阶段）

| # | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 登录 | 匿名 |
| 2 | 登出 | 已登录 |
| 3 | 当前 AdminUser 资料（`me`） | 已登录 |
| 4 | 修改自己的密码 | 已登录 |
| 5 | 分页列表 AdminUser | Admin / Staff |
| 6 | 创建 AdminUser | Admin |
| 7 | 重置他人密码 | Admin |
| 8 | 变更他人角色 | Admin |
| 9 | 删除 AdminUser | Admin |
| — | Bootstrap 初始化 | 启动时，非 HTTP |

## In-scope（本阶段账号管理）

- 登录 / 登出（管理端专用入口）
- 创建 AdminUser（用户名 + 初始密码 + 角色）
- 列表 / 分页查询
- 重置他人密码（含 Bootstrap；仅 Admin）
- 物理删除 AdminUser（受 Bootstrap / 末账号 / 末 Admin 保护）
- 修改自己的密码
- 变更他人角色（仅 Admin；受末 Admin 保护）
- 固定两角色：Admin、Staff（无自定义角色 CRUD）
- 初始化 Bootstrap Admin（`admin` / `admin@123456`，`bootstrap=true`）

## Bootstrap 初始化

- 应用启动时：若不存在任何 `bootstrap=true` 的 AdminUser，则插入 Bootstrap Admin（用户名 `admin`、初始密码 `admin@123456`、角色 Admin）。
- 若已存在 bootstrap AdminUser：不覆盖密码、不重置字段。
- 若仅有普通 AdminUser、无 bootstrap：仍补插 Bootstrap Admin。
- 启动过程永不改密；后续仅「重置他人密码 / 改自己密码」。
- 若用户名 `admin` 已被非 bootstrap 账号占用：启动失败并记录明确错误，不静默改名。

## Login & Session（管理端）

- 登录：用户名 + 密码 → 签发 token（`Authorization` 头）；管理端专用入口，与 EndUser 分离。
- 登出：作废当前 token。
- 多端：同一 AdminUser 允许并发在线，每端独立 token（对齐现有 Sa-Token 配置）。
- 密码变更（改己 / 重置他人）成功后：作废该 AdminUser 全部既有 token。
- 登录失败：统一「用户名或密码错误」，不区分用户名是否存在；本阶段无验证码、无失败锁定。
- 除登录外，AdminUser 管理 API 均需有效 token，并按能力矩阵鉴权。

## Username & Password

- 用户名：创建后不可改；全局唯一；长度 4–32；仅 `[a-zA-Z0-9_]`；登录精确匹配（大小写敏感）。
- 密码：长度 8–64；须同时含字母与数字；单向哈希存储。
- 重置他人密码：Admin 提交符合规则的新密码（本阶段不做系统随机临时密码）。
- 改自己密码：旧密码 + 新密码；新密码不得与旧密码相同。
- 列表/详情：永不返回密码或哈希；可含 id、username、role、bootstrap、createdAt 等。

## Delete & List

- 物理删除成功后：立即作废该 AdminUser 全部 token。
- 禁止删除当前登录账号；须由另一名 Admin 删除（仍受 Bootstrap / 末账号 / 末 Admin 保护）。
- 列表：分页（默认 pageSize=20，上限 100）；`username` 模糊、`role` 精确筛选；默认按创建时间倒序。
- 本阶段无昵称、头像、邮箱、操作审计日志 API。

## Out-of-scope（本阶段明确不做）

- 启用 / 停用 AdminUser（原「不可停用」规则一并延后）
- 自定义角色 / 权限码配置
- EndUser 登录与账号 API
- 登录验证码 / 失败次数锁定
- 用户名变更、系统生成临时密码流程
- 昵称 / 头像 / 邮箱、操作审计日志 API
