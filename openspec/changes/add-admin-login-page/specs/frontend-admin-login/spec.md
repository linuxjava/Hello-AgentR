## ADDED Requirements

### Requirement: 管理端登录页展示与提交

系统 SHALL 在路由 `/login` 提供管理端登录页，包含用户名、密码、「记住用户名」与提交控件，交互对齐 IXD `P-01` / `H-01`。

#### Scenario: 匿名访问登录页

- **GIVEN** 本地无有效管理端会话
- **WHEN** 用户打开 `/login`
- **THEN** 系统展示登录表单，且不进入受保护首页内容

#### Scenario: 登录成功进入首页

- **GIVEN** 后端存在正确凭证的 AdminUser
- **WHEN** 用户提交正确的用户名与密码
- **THEN** 系统将返回的 token 写入 localStorage，并导航至首页占位路由

#### Scenario: 登录失败页内错误

- **GIVEN** 用户提交错误凭证
- **WHEN** 后端返回业务错误（如 `A001001`）
- **THEN** 系统在登录页内展示后端 `message`（或同等文案），SHALL NOT 写入 token，且 SHALL NOT 进入壳层/首页受保护内容

#### Scenario: 提交中防重复

- **GIVEN** 登录请求进行中
- **WHEN** 用户再次点击提交
- **THEN** 系统 SHALL 忽略重复提交或保持按钮不可用直至请求结束

### Requirement: 记住用户名

系统 SHALL 支持可选「记住用户名」：仅持久化 username，SHALL NOT 持久化密码。

#### Scenario: 勾选后再次打开登录页

- **GIVEN** 用户勾选记住用户名并登录成功
- **WHEN** 用户随后打开登录页（含登出后再打开）
- **THEN** 用户名已预填且密码输入为空

#### Scenario: 未勾选不预填

- **GIVEN** 用户未勾选记住用户名并登录成功
- **WHEN** 用户登出或清除会话后再次打开登录页
- **THEN** 用户名输入不被预填为上次账号

### Requirement: 会话门禁与恢复

系统 SHALL 将管理端 token 存于 localStorage，并在进入受保护路由前校验会话；已登录用户访问登录页时 SHALL 重定向至首页。

#### Scenario: 有效 token 刷新后保持

- **GIVEN** localStorage 中存在有效 token
- **WHEN** 用户刷新浏览器并访问受保护路由
- **THEN** 系统调用 `GET /admin/auth/me` 成功后继续展示受保护内容

#### Scenario: 无效或过期 token

- **GIVEN** localStorage 中存在无效或过期 token
- **WHEN** 用户打开受保护路由或 `me` 校验失败
- **THEN** 系统清除本地会话并进入 `/login`

#### Scenario: 已登录访问登录页

- **GIVEN** 用户持有有效会话
- **WHEN** 用户访问 `/login`
- **THEN** 系统重定向至首页，不停留在登录表单

#### Scenario: 业务未登录码清会话

- **GIVEN** 用户已持有本地 token
- **WHEN** 任一受保护请求返回未登录宏观码 `A000001`
- **THEN** 系统清除本地会话并导航至 `/login`

### Requirement: 登录 API 客户端行为

系统 SHALL 通过既有后端契约完成登录与资料校验，SHALL NOT 发明与词汇表冲突的身份实体。

#### Scenario: 调用登录接口

- **GIVEN** 用户提交的用户名与密码通过前端非空（及约定）校验
- **WHEN** 系统发起登录
- **THEN** 系统向 `POST /admin/auth/login` 发送 JSON `{ username, password }`，并在成功时保存 `data.token` 与资料信息

#### Scenario: 调用 me 接口

- **GIVEN** 本地存在 token
- **WHEN** 系统执行会话校验
- **THEN** 系统调用 `GET /admin/auth/me` 并在请求头携带该 token
