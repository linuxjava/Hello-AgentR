## 1. API 与类型（复用既有 knowledge client / Toast）

- [x] 1.1 盘点并复用 `shared/api/knowledge.ts`、`client`、`session-store`、`ToastHost`、`Pagination`、知识库模态 chrome；确认无需新建第二套 HTTP 栈
- [x] 1.2 扩展 Document API：`listDocuments`、`uploadDocument`、`updateChunkStrategy`、`setDocumentEnabled`、`deleteDocument` + 类型（对齐 `docs/backend/api.md` §3.7–3.12；含 `documentCount`）
- [x] 1.3 Document API 单元测试（成功路径 + 至少一种业务错误 `message` 透出）
- [x] 1.4 **验证**：相关单测通过；`npm test` 绿

## 2. 知识库列表增量（Pencil P-04 H-01 / H-02）

- [x] 2.1 表头增加「文档数」；展示接口 `documentCount`；**无**切片数/索引状态
- [x] 2.2 名称前图标；点击名称导航至 `/knowledge-bases/:kbId/documents`；移除任何「进入」按钮
- [x] 2.3 Admin：`documentCount > 0` 删除常色可点 → Toast「库下仍有文档，不能删除」，不打开 O-07；空库仍打开删除确认
- [x] 2.4 Staff：删库仍灰显可点 → Toast「无权限删除知识库」（文案不同于有文档）；点名称可进文档列表
- [x] 2.5 列表增量测试（文档数、导航、两类 Toast）
- [x] 2.6 **验证**：对照 `ui.pen` 的 `P-04/H-01`、`H-02`；`npm test` + lint

## 3. 文档列表主屏（Pencil P-05 V-01 / V-02 / V-03 / V-04）

- [x] 3.1 路由：`RequireAuth` + Shell 下 `/knowledge-bases/:kbId/documents`；侧栏仍高亮「知识库管理」；面包屑含当前库 Name；可返回列表
- [x] 3.2 工具栏：文件名模糊 +「查询」+「上传文档」；**无** status/enabled/strategy 筛选
- [x] 3.3 表格列严格按 Pencil：文件名（副行类型·大小）、状态（色点+文案无底；UPLOADED→「待分块」）、分块数（未分块「—」）、启用开关、更新时间、改策略/删除
- [x] 3.4 分页默认 20；更新时间倒序
- [x] 3.5 空态 V-02、筛选空 V-03 文案与结构对照稿面；上传入口可用
- [x] 3.6 库不存在 V-04：错误态 + 返回列表；**禁止**做成可上传空列表
- [x] 3.7 文档列表页测试（列、空态、筛选空、A002001）
- [x] 3.8 **验证**：对照 `ui.pen` `P-05/V-01`～`V-04`；`npm test` + lint

## 4. 上传模态 O-08 系（严格按 Pencil）

- [x] 4.1 O-08：拖拽/点击投放区；默认重叠分块 512/64；无单位标注；无同名说明；无约 50MB 文案；取消/上传
- [x] 4.2 O-08a：切结构分块字段 256/512/1024/32；无 JSON 文本框
- [x] 4.3 O-08b：策略校验内联/红条；不关窗、不脏数据
- [x] 4.4 O-08c：提交中锁定（按钮 loading、不可换文件）
- [x] 4.5 O-08d：业务失败弹窗内后端 `message`；解锁可重试
- [x] 4.6 成功 → Toast（G-01a）+ 关窗 + 刷新列表
- [x] 4.7 上传模态测试
- [x] 4.8 **验证**：对照 `ui.pen` `O-08`～`O-08d`；`npm test` + lint

## 5. 改策略 / 启用 / 删文档（O-09 / 开关 / O-10）

- [x] 5.1 O-09：回填已存值；切种类整份替换；保存成功 Toast + 刷新；无 JSON 框
- [x] 5.1a O-09：文件名主名可改、后缀只读；与策略一次提交
- [x] 5.2 行内 Enabled：点即提交；失败 Toast + 回滚开关；无确认框
- [x] 5.3 O-10：轻确认文案对齐稿面；Admin/Staff 均可；成功 Toast + 文档数 -1
- [x] 5.4 相关测试（回填、开关、删除、Staff 不灰显）
- [x] 5.5 **验证**：对照 `ui.pen` `O-09`、`O-10`、`G-01a`；全量 `npm test` + `npm run lint` + `npm run build`

## 6. 手工闭环验收

- [x] 6.1 Admin：列表见文档数 → 点名称进库 → 上传 → 列表「待分块」/「—」→ 改策略 → 开关禁用再启用 → 删文档 → 文档数归零后可删空库
- [x] 6.2 Staff：可上传/改策略/开关/删文档；删库仍无权限 Toast
- [x] 6.3 **验证**：逐帧对照 `ui.pen`；**不得**按 IXD 线框自创布局或列；行为符合 PRD AC-F401～F424
