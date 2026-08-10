## ADDED Requirements

### Requirement: 管理端登录

系统 SHALL 提供管理端专用登录入口；AdminUser 使用用户名与密码换取 token。登录匹配 MUST 对用户名大小写敏感且精确匹配。失败时 MUST 返回统一文案「用户名或密码错误」，且 MUST NOT 暗示用户名是否存在。同一 AdminUser SHALL 允许并发多端登录，且各端 token 彼此独立。

#### Scenario: 登录成功

- **GIVEN** 存在用户名与密码均正确的 AdminUser
- **WHEN** 调用管理端登录接口提交正确凭证
- **THEN** 系统返回有效 token，且后续请求可在 `Authorization` 头携带该 token 访问受保护接口

#### Scenario: 登录失败统一文案

- **GIVEN** 用户名不存在或密码错误
- **WHEN** 调用管理端登录接口
- **THEN** 系统拒绝登录，且错误提示为「用户名或密码错误」

#### Scenario: 多端并发登录

- **GIVEN** 同一 AdminUser 已在一端持有有效 token
- **WHEN** 另一端再次登录成功
- **THEN** 两端 token 均有效且互不相同

### Requirement: 管理端登出

系统 SHALL 允许已登录 AdminUser 登出，并作废**当前** token。

#### Scenario: 登出后当前 token 失效

- **GIVEN** AdminUser 持有有效 token
- **WHEN** 调用登出接口
- **THEN** 该 token 立即失效，使用该 token 访问受保护接口失败

### Requirement: 当前账号资料

系统 SHALL 允许已登录 AdminUser 查询自身资料。响应 MUST 包含 id、username、role、bootstrap、createdAt（或等价字段），且 MUST NOT 包含密码或密码哈希。未登录访问受保护接口时 MUST 失败。

#### Scenario: 查询 me 成功

- **GIVEN** AdminUser 已登录
- **WHEN** 请求当前账号资料接口
- **THEN** 返回不含密码/哈希的资料字段

#### Scenario: 未登录访问受保护接口

- **GIVEN** 请求未携带有效 token
- **WHEN** 访问 `me` 或其他受保护管理端接口
- **THEN** 系统返回未登录错误

### Requirement: 修改自己的密码

已登录 AdminUser SHALL 可通过「旧密码 + 新密码」修改自己的密码。新密码 MUST 满足密码规则且 MUST NOT 与旧密码相同。成功后系统 MUST 作废该 AdminUser 的全部既有 token。旧密码错误或新密码不合规时 MUST 失败，且 MUST NOT 作废既有 token。

#### Scenario: 改密成功并踢全部会话

- **GIVEN** AdminUser 已登录且旧密码正确
- **WHEN** 提交符合规则且不同于旧密码的新密码
- **THEN** 密码更新成功，且该 AdminUser 全部既有 token 失效

#### Scenario: 改密失败不踢会话

- **GIVEN** AdminUser 已登录
- **WHEN** 旧密码错误，或新密码不合规，或新密码等于旧密码
- **THEN** 变更失败，且既有 token 仍有效
