## 1. API 与共享能力（复用既有 session/client）

- [x] 1.1 盘点并复用 `shared/api/client`、`session-store`、登录门禁；确认无需新建第二套 HTTP 栈
- [x] 1.2 扩展 `authApi`：`logout`、`changePassword`（对齐 `docs/backend/api.md`）
- [x] 1.3 新增 `usersApi`：`list` / `create` / `updatePassword` / `updateRole` / `remove` + 类型与单元测试
- [x] 1.4 新增轻量 Toast（G-01）宿主与 API（成功 / 无权限文案 / 网络错误）
- [x] 1.5 **验证**：相关 API 单测通过；`npm test` 绿

## 2. Admin Shell + 首页占位（Pencil P-02）

- [x] 2.1 实现 `AdminShell`：渐变背景/玻璃侧栏与主区；品牌「Hello-AgentR」+「管理控制台」；Nav「首页」「账号管理」选中态
- [x] 2.2 顶栏：面包屑；身份芯片（头像缩写 + username + 角色）下拉「修改密码」「登出」
- [x] 2.3 路由：`RequireAuth` 下挂 Shell；`/` → HomePlaceholder；`/users` → 账号页占位出口；登出清会话回 `/login`
- [x] 2.4 首页占位文案对齐 Pencil：「首页占位」/「本阶段无业务内容。后续业务模块将挂载于此。」
- [x] 2.5 Shell / Home 组件测试（导航、登出、面包屑）
- [x] 2.6 **验证**：对照 Pencil `P-02` 目视；`npm test` + lint

## 3. 账号列表（Pencil P-03 H-01 / H-02）

- [x] 3.1 列表页工具栏：用户名「模糊搜索用户名」、角色「全部/管理员/运营人员」、「查询」、「创建账号」
- [x] 3.2 表格列：ID / 用户名（字头像）/ 角色 / 创建时间 / 操作（编辑、删除 icon）；无 Bootstrap 列；分页文案「共 N 条 · 每页 20 条」
- [x] 3.3 Admin：创建/编辑/删除可打开对应模态；保护目标删除禁用占位
- [x] 3.4 Staff：写操作灰显可点 → Toast「无权限执行此操作」，不打开可提交表单
- [x] 3.5 列表页测试（筛选参数、Staff Toast、保护删除）
- [x] 3.6 **验证**：对照 Pencil `P-03/H-01`、`H-02`；`npm test` + lint

## 4. 模态 O-01–O-04（严格按 Pencil 文案）

- [x] 4.1 O-01 创建账号：字段/placeholder/按钮「取消」「创建」；成功 Toast + 刷新；失败弹窗内 message
- [x] 4.2 O-02 编辑账号：只读用户名 + 提示；角色；可选新密码+确认；保存串行 role/password API；失败弹窗内 message
- [x] 4.3 O-03 删除确认：文案对齐 Pencil（不可恢复、确认删除）；成功刷新列表
- [x] 4.4 O-04 改己密：提示「成功后需重新登录」；成功清会话 → `/login`；失败弹窗内错误
- [x] 4.5 模态表单校验与关键路径测试
- [x] 4.6 **验证**：对照 Pencil `O-01`–`O-04`；全量 `npm test` + `npm run lint` + `npm run build`

## 5. 手工闭环验收

- [x] 5.1 Bootstrap Admin：登录 → 首页 → 账号列表 → 创建 Staff → 编辑（改角色/可选重置）→ 删除非保护对象 → 改己密强制重登 → 登出
- [x] 5.2 Staff：列表可查；写操作 Toast 无权限；可改己密与登出
- [x] 5.3 **验证**：对照 design.md Pencil 文案表逐项勾选；无按 IXD 线框自创布局
