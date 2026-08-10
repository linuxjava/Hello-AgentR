## ADDED Requirements

### Requirement: 账号列表筛选与分页

系统 SHALL 提供账号列表页（Pencil `P-03`），列至少包含 ID、用户名（圆形字头像缩写 + 名）、角色（管理员/运营人员）、创建时间、操作；SHALL NOT 展示 Bootstrap 列。系统 SHALL 支持 username 模糊、role 精确（全部/管理员/运营人员）筛选、默认 pageSize=20、创建时间倒序，以及「查询」触发刷新与分页「上一页」「下一页」。分页文案 SHALL 对齐「共 N 条 · 每页 20 条」。

#### Scenario: Admin 或 Staff 加载列表

- **GIVEN** Admin 或 Staff 已登录
- **WHEN** 打开账号管理页
- **THEN** 列表按契约加载且不含密码字段，列结构对齐 Pencil

#### Scenario: 筛选与翻页

- **GIVEN** 已登录且列表有数据
- **WHEN** 输入用户名模糊条件或选择角色后点击「查询」，或切换上一页/下一页
- **THEN** 列表结果与筛选/分页参数一致

#### Scenario: 列表加载失败

- **GIVEN** 已登录
- **WHEN** 列表请求失败（网络或业务错误）
- **THEN** 系统以 Toast 或页内方式展示错误信息，且不展示伪造行数据

### Requirement: 创建账号模态

系统 SHALL 提供「创建账号」入口与 O-01 模态（Pencil）：字段用户名、密码、角色（默认运营人员）；placeholder 对齐「4–32 位字母、数字或下划线」「8–64 位，须含字母与数字」；操作「取消」「创建」。仅 Admin 可成功提交；Staff 见无权限行为（见下）。

#### Scenario: Admin 创建成功

- **GIVEN** Admin 已登录
- **WHEN** 打开创建账号并提交合法数据
- **THEN** Toast 成功、模态关闭、列表可见新账号

#### Scenario: 创建业务失败

- **GIVEN** Admin 已打开创建模态
- **WHEN** 提交重复用户名或非法字段
- **THEN** 模态内展示校验或后端 `message`，列表不出现脏数据

### Requirement: 编辑账号模态

系统 SHALL 将改角色与可选重置他人密码合并为行内「编辑」→ O-02（Pencil）：用户名只读并提示「用户名创建后不可修改」；角色可改；「新密码（可选）」留空不重置，填写则须与「确认新密码」一致；操作「取消」「保存」。

#### Scenario: Admin 仅改角色成功

- **GIVEN** Admin 编辑非保护冲突目标且新密码留空
- **WHEN** 修改角色并保存
- **THEN** 调用角色更新接口成功，Toast 成功，列表刷新

#### Scenario: Admin 可选重置密码

- **GIVEN** Admin 编辑目标并填写合法新密码与确认
- **WHEN** 保存
- **THEN** 系统重置该账号密码（并按需更新角色），Toast 成功

#### Scenario: 保护规则拒绝

- **GIVEN** Admin 提交会被后端保护规则拒绝的变更（如末 Admin）
- **WHEN** 保存
- **THEN** 模态内展示后端文案（如 A001009），数据保持不变或按失败结果刷新

### Requirement: 删除确认与保护目标

系统 SHALL 提供行内「删除」→ O-03：标题「删除账号」，副标题「此操作不可恢复」，正文含目标 username 且说明登录态失效不可恢复；确认按钮「确认删除」。对 Bootstrap 目标、当前登录自己等前端可预知保护对象，删除入口 SHALL 禁用并保留布局占位。

#### Scenario: Admin 删除成功

- **GIVEN** Admin 删除非保护目标并确认
- **WHEN** 确认删除成功
- **THEN** Toast 成功且该行从列表消失

#### Scenario: 保护目标删除入口

- **GIVEN** Admin 查看 Bootstrap 或当前自己的行
- **WHEN** 查看操作列
- **THEN** 删除入口禁用（或等价不可提交），布局占位保留

### Requirement: Staff 写操作无权限反馈

系统 SHALL 使 Staff 的创建/编辑/删除入口呈现灰显但可点击；点击后 SHALL 显示 Toast「无权限执行此操作」，且 SHALL NOT 打开可提交表单或发起写请求。布局占位 SHALL 与 Admin 一致。

#### Scenario: Staff 点击创建或行内写操作

- **GIVEN** Staff 已登录账号列表
- **WHEN** 点击灰显的「创建账号」或「编辑」或「删除」
- **THEN** 出现 Toast「无权限执行此操作」，且不出现可提交模态

### Requirement: 修改自己的密码

系统 SHALL 提供 O-04「修改密码」模态：提示「成功后需重新登录」；字段当前密码、新密码、确认新密码；操作「取消」「确认修改」。成功后 SHALL 清除本地会话并进入登录页。

#### Scenario: 改己密成功

- **GIVEN** 已登录且凭证合法
- **WHEN** 提交修改密码成功
- **THEN** 本地会话清除并进入登录页；旧 token 不可再用于受保护请求

#### Scenario: 改己密失败

- **GIVEN** 已打开修改密码模态
- **WHEN** 当前密码错误或新密码不合规/不一致
- **THEN** 模态内展示错误且会话保持登录
