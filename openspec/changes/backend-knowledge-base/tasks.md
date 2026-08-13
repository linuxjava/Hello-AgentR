## 1. 探查与依赖

- [x] 1.1 确认可复用：`AdminAccessService`、`R<T>`、`WebAdminException`、MyBatis-Plus 分页、`/admin/**` 登录拦截；禁止再造登录或分页框架
- [x] 1.2 确认迁移方式与 V0.1 一致（`resources/db/*.sql` 手工执行，无 Flyway）

### Phase 1 验证

- [x] 1.3 写下复用清单（可放 design Open Questions 关闭说明）：拦截器已覆盖新路径、删除走 `requireAdmin()`

## 2. 数据模型与持久化

- [x] 2.1 新增 `t_knowledge_base.sql`（字段对齐 design D2；name / namespace 唯一；无 `deleted` 列）
- [x] 2.2 新增 KnowledgeBase DO / Mapper（包 `com.xgc.agent.rag.knowledge`）；物理删除
- [x] 2.3 新增按 name、namespace 查重与分页查询（Name 模糊、创建时间倒序）

### Phase 2 验证

- [x] 2.4 测试上下文可加载 Mapper；唯一约束与 design 一致

## 3. 目录与占用端口

- [x] 3.1 实现 EmbeddingModel 模拟目录（至少 `mock-embedding-v1`、`mock-embedding-v2`）
- [x] 3.2 实现 `DocumentPresence` 端口；V0.2 默认恒未占用，删除路径必须调用

### Phase 3 验证

- [x] 3.3 目录两次读取标识集合一致；占用端口可在测试中打桩为「已占用」

## 4. 知识库 API（knowledge-base + catalog）

- [x] 4.1 新增 `KnowledgeErrorCode`（A002xxx）与字段校验（Name / Namespace / Description）
- [x] 4.2 实现 `GET /admin/embedding-models`（需登录）
- [x] 4.3 实现 `POST /admin/knowledge-bases`（目录校验；写 createdBy）
- [x] 4.4 实现 `GET /admin/knowledge-bases`（默认 20、上限 100 拒绝、Name 模糊、无 namespace 参数）
- [x] 4.5 实现 `GET /admin/knowledge-bases/{id}`
- [x] 4.6 实现 `PUT /admin/knowledge-bases/{id}`（可改 Name/Description；不改 Namespace/EmbeddingModel）
- [x] 4.7 实现 `DELETE /admin/knowledge-bases/{id}`（仅 Admin；占用则拒；成功后 Namespace 可复用）

### Phase 4 验证

- [x] 4.8 对照两份 spec 与 PRD 主闭环：目录 → 创建 → 列表/详情 → 改名 → Admin 删除 → Namespace 重建；Staff 删被拒

## 5. 收尾

- [x] 5.1 端点与 `design.md` 一致；错误码纳入既有异常体系
- [x] 5.2 更新 `docs/backend/api.md` 与版本/索引中必要说明（不把模拟模型写成生产模型）
- [x] 5.3 相关测试通过

### Phase 5 验证

- [x] 5.4 无范围外功能（无 Document 上传、无向量写入、无按 Namespace 筛选）
