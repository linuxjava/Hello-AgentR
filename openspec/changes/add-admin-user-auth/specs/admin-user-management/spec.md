## ADDED Requirements

### Requirement: Bootstrap Admin 初始化

应用启动时，若库中不存在任何 `bootstrap=true` 的 AdminUser，系统 MUST 插入 Bootstrap Admin：username=`admin`，初始密码=`admin@123456`，role=`ADMIN`，bootstrap=`true`。若已存在 bootstrap AdminUser，系统 MUST NOT 覆盖其密码或重置字段。若仅有普通 AdminUser 而无 bootstrap，系统仍 MUST 尝试补插 Bootstrap Admin。若用户名 `admin` 已被非 bootstrap 账号占用，系统 MUST 使启动失败并记录明确错误，且 MUST NOT 静默改名。

#### Scenario: 首次启动插入 Bootstrap

- **GIVEN** 不存在 bootstrap AdminUser，且用户名 `admin` 未被占用
- **WHEN** 应用启动
- **THEN** 系统插入 Bootstrap Admin（`admin` / `admin@123456` / Admin / bootstrap=true）

#### Scenario: 已存在 bootstrap 则跳过

- **GIVEN** 已存在 bootstrap AdminUser
- **WHEN** 应用再次启动
- **THEN** 系统不覆盖该账号密码与关键字段

#### Scenario: admin 用户名冲突导致启动失败

- **GIVEN** 用户名 `admin` 被非 bootstrap 账号占用，且不存在 bootstrap AdminUser
- **WHEN** 应用启动
- **THEN** 启动失败并记录明确错误

### Requirement: 用户名与密码规则

用户名 MUST 全局唯一，长度 4–32，仅允许 `[a-zA-Z0-9_]`，创建后 MUST NOT 提供变更能力。密码 MUST 长度 8–64 且同时包含字母与数字，并 MUST 单向哈希存储。任何列表或详情响应 MUST NOT 返回密码或哈希。

#### Scenario: 非法用户名或密码创建失败

- **GIVEN** 调用方为 Admin 且已登录
- **WHEN** 创建请求的用户名或密码不符合规则，或用户名已存在
- **THEN** 系统拒绝创建并返回可理解的客户端错误

### Requirement: 分页列表 AdminUser

已登录的 Admin 与 Staff SHALL 可分页查询 AdminUser 列表。默认 pageSize MUST 为 20，pageSize 上限 MUST 为 100；超过上限时系统 MUST 拒绝请求。系统 SHALL 支持 `username` 模糊筛选与 `role` 精确筛选，默认按创建时间倒序。

#### Scenario: 默认分页列表

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求列表且未指定 pageSize
- **THEN** 返回按创建时间倒序的结果，pageSize 默认为 20，且不含密码/哈希

#### Scenario: pageSize 超上限拒绝

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 请求列表且 pageSize 大于 100
- **THEN** 系统拒绝该请求

### Requirement: 创建 AdminUser

角色为 Admin 的调用方 SHALL 可创建 AdminUser，并指定角色为 Admin 或 Staff。角色为 Staff 的调用方 MUST NOT 创建 AdminUser。

#### Scenario: Admin 创建成功

- **GIVEN** Admin 已登录，且用户名唯一、密码合规
- **WHEN** 创建指定角色为 Admin 或 Staff 的账号
- **THEN** 创建成功且随后可在列表中查询到

#### Scenario: Staff 创建被拒绝

- **GIVEN** Staff 已登录
- **WHEN** 尝试创建 AdminUser
- **THEN** 系统拒绝（无权限）

### Requirement: 重置他人密码

角色为 Admin 的调用方 SHALL 可为他人（含 Bootstrap Admin）设置符合规则的新密码；成功后 MUST 作废目标账号全部 token。Staff MUST NOT 重置他人密码。

#### Scenario: Admin 重置成功并踢会话

- **GIVEN** Admin 已登录
- **WHEN** 为其他 AdminUser（可含 Bootstrap）提交合规新密码
- **THEN** 密码更新成功，且目标账号全部 token 失效

#### Scenario: Staff 重置被拒绝

- **GIVEN** Staff 已登录
- **WHEN** 尝试重置他人密码
- **THEN** 系统拒绝（无权限）

### Requirement: 变更他人角色

角色为 Admin 的调用方 SHALL 可将他人角色在 Admin 与 Staff 间变更。当变更会导致角色为 Admin 的 AdminUser 数量降为零时，系统 MUST 拒绝。Staff MUST NOT 变更他人角色。

#### Scenario: Admin 变更角色成功

- **GIVEN** 至少存在两名 Admin，且操作者为 Admin
- **WHEN** 将其中一名非唯一 Admin 改为 Staff
- **THEN** 变更成功

#### Scenario: 末 Admin 保护

- **GIVEN** 仅剩一名角色为 Admin 的 AdminUser
- **WHEN** 尝试将该账号角色改为 Staff
- **THEN** 系统拒绝

#### Scenario: Staff 改角色被拒绝

- **GIVEN** Staff 已登录
- **WHEN** 尝试变更他人角色
- **THEN** 系统拒绝（无权限）

### Requirement: 物理删除 AdminUser

角色为 Admin 的调用方 SHALL 可物理删除其他 AdminUser。系统 MUST 拒绝：删除 Bootstrap Admin、删除当前登录账号、删除后将导致零 AdminUser、删除后将导致零 Admin 角色。删除成功后 MUST 作废目标账号全部 token。Staff MUST NOT 删除 AdminUser。

#### Scenario: Admin 删除成功

- **GIVEN** Admin 已登录，目标非 Bootstrap、非自己，且删除后仍至少保留 1 个 AdminUser 与 1 名 Admin
- **WHEN** 物理删除该目标
- **THEN** 删除成功，且目标全部 token 失效

#### Scenario: 保护规则拒绝删除

- **GIVEN** Admin 已登录
- **WHEN** 删除目标为 Bootstrap，或为自己，或将触发末账号/末 Admin 保护
- **THEN** 系统拒绝删除

#### Scenario: Staff 删除被拒绝

- **GIVEN** Staff 已登录
- **WHEN** 尝试删除 AdminUser
- **THEN** 系统拒绝（无权限）
