## 1. API 与类型（复用既有 client / session / Toast）

- [x] 1.1 盘点并复用 `shared/api/client`、`session-store`、`ToastHost`、`Pagination`；确认无需新建第二套 HTTP 栈
- [x] 1.2 新增 `knowledgeApi`：`listEmbeddingModels`、`list`、`create`、`update`、`remove` + TypeScript 类型（对齐 `docs/backend/api.md` §3）
- [x] 1.3 `knowledgeApi` 单元测试（成功路径 + 至少一种业务错误码映射）
- [x] 1.4 **验证**：相关单测通过；`npm test` 绿

## 2. 侧栏顺序（Pencil P-02 / P-04）

- [x] 2.1 修改 `ShellSidebar`：三项为 首页 → **知识库管理** → 账号管理；知识库图标与选中态对齐 Pencil
- [x] 2.2 路由：`RequireAuth` + Shell 下增加 `/knowledge-bases` → 知识库页占位出口；未登录走既有清会话
- [x] 2.3 Shell 导航测试（顺序、高亮、链到知识库路由）
- [x] 2.4 **验证**：对照 Pencil 侧栏顺序；`npm test` + lint

## 3. 知识库列表 Admin + 空态（Pencil P-04 H-01 / H-03）

- [x] 3.1 工具栏：占位「模糊搜索名称」、「查询」、「创建知识库」；**无** Namespace 筛选
- [x] 3.2 表格列严格按 Pencil：名称 / 命名空间 / 向量模型 / 描述 / 创建时间 / 操作；空描述「—」；无文档数/切片/索引/createdBy
- [x] 3.3 分页默认 20，文案含「20 条/页」；创建时间倒序
- [x] 3.4 空态文案对齐 Pencil H-03；创建入口仍可用
- [x] 3.5 列表页测试（筛选参数、空态、列不含假字段）
- [x] 3.6 **验证**：对照 Pencil `P-04/H-01`、`H-03`；`npm test` + lint

## 4. Staff 列表（Pencil P-04 H-02）

- [x] 4.1 Staff：创建/编辑可用；删除灰显可点 → Toast「无权限删除知识库」，不打开删除确认、不发 DELETE
- [x] 4.2 行操作区占位与 Admin 一致
- [x] 4.3 Staff 行为测试
- [x] 4.4 **验证**：对照 Pencil `P-04/H-02`；`npm test` + lint

## 5. 模态 O-05 / O-06 / O-07（严格按 Pencil 文案与字段序）

- [x] 5.1 O-05 创建：字段序 名称 → 命名空间 → 向量模型下拉 → 描述；占位/按钮对齐稿；**不出现**「模拟目录，非生产模型」；打开时拉目录
- [x] 5.2 O-05a：冲突/校验失败弹窗内红条（如「名称已存在」），不关窗、无脏数据
- [x] 5.3 O-05b：目录失败红条「向量模型目录暂不可用，无法提交创建。」，模型「目录不可用」，创建禁用
- [x] 5.4 O-06 编辑：仅名称/描述可改；不展示命名空间、向量模型及不可修改提示；保存成功 Toast + 刷新
- [x] 5.5 O-07：文案「将执行彻底删除，且无法恢复。」；确认删除成功刷新；O-07a 红条「知识库下仍有文档，不能删除」
- [x] 5.6 模态表单与关键路径测试
- [x] 5.7 **验证**：对照 Pencil `O-05`/`O-05a`/`O-05b`/`O-06`/`O-07`/`O-07a`/`G-01`；全量 `npm test` + `npm run lint` + `npm run build`

## 6. 手工闭环验收

- [x] 6.1 Admin：侧栏进知识库 → 创建（选 mock-embedding-v1/v2）→ 列表出现 → 改名称/描述且隔离键不变 → 删除成功 → 同 Namespace 再建
- [x] 6.2 Staff：创建/编辑可用；删除 Toast 无权限
- [x] 6.3 **验证**：对照 design.md Pencil 文案表逐项勾选；无按 IXD 线框自创布局或列
