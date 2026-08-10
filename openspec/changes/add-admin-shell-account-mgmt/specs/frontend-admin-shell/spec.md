## ADDED Requirements

### Requirement: Admin Shell 布局与导航

系统 SHALL 在已登录受保护路由外包裹 Admin Shell，视觉与文案对齐 Pencil `P-02` / `P-03`：侧栏展示品牌「Hello-AgentR」与副标题「管理控制台」，导航项为「首页」「账号管理」；顶栏展示面包屑与身份区（username + 角色中文标签）；身份区为下拉，含「修改密码」「登出」。

#### Scenario: 侧栏切换页面

- **GIVEN** 用户已登录
- **WHEN** 点击侧栏「账号管理」或「首页」
- **THEN** 分别进入账号列表页或首页占位，且对应导航项呈现选中态（对齐 Pencil）

#### Scenario: 面包屑展示

- **GIVEN** 用户在首页占位
- **WHEN** 查看顶栏面包屑
- **THEN** 显示「首页」
- **WHEN** 进入账号列表
- **THEN** 显示「首页 › 账号管理」（分隔符与层级对齐 Pencil）

### Requirement: 身份下拉改密与登出

系统 SHALL 通过顶栏身份下拉提供「修改密码」与「登出」。登出 SHALL 调用后端登出（若可用）并清除本地会话，进入登录页。

#### Scenario: 登出成功

- **GIVEN** 用户已登录且打开身份下拉
- **WHEN** 点击「登出」
- **THEN** 本地 token 被清除且用户进入登录页

#### Scenario: 打开修改密码

- **GIVEN** 用户已登录
- **WHEN** 点击「修改密码」
- **THEN** 打开 O-04 修改密码模态（对齐 Pencil）

### Requirement: 首页占位

系统 SHALL 提供首页占位内容，标题为「首页占位」，说明为「本阶段无业务内容。后续业务模块将挂载于此。」；SHALL NOT 要求业务卡片或统计。

#### Scenario: 登录后落地首页

- **GIVEN** 用户登录成功
- **WHEN** 进入默认受保护落地页
- **THEN** 看见上述首页占位文案且位于 Admin Shell 内

### Requirement: 未授权访问壳层

系统 SHALL 在无有效会话时拒绝进入壳层页面并导向登录页。

#### Scenario: 无 token 访问首页

- **GIVEN** 本地无有效会话
- **WHEN** 访问 `/` 或账号列表路由
- **THEN** 用户被导向登录页且不渲染可操作壳层内容
