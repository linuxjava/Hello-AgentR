## 1. 探查与依赖

- [x] 1.1 确认可复用：`AdminAccessService`、`R<T>`、`WebAdminException`、MyBatis-Plus 分页、`/admin/**` 登录拦截、`DocumentPresence` 端口、`KnowledgeErrorCode`、全局 `MaxUploadSizeExceededException`、BOM 中的 Tika 与 AWS SDK v2 S3；禁止再造登录、分页或存储 SDK
- [x] 1.2 确认 `backend/app` 是否已传递 S3 依赖（目前仅 `fw-base` 声明）；端口与 S3 适配器落在 `fw-base`，Knowledge 不拥有存储实现、不把 Document/objectKey 下沉到 fw-base
- [x] 1.3 确认迁移方式仍为 `resources/db/*.sql` 手工执行

### Phase 1 验证

- [x] 1.4 写下复用清单：拦截器覆盖 `/admin/knowledge-bases/{id}/documents/**`；超限错误与 multipart 50MB/100MB 对齐

## 2. 数据模型

- [x] 2.1 新增 `t_knowledge_document.sql`（字段对齐 design D2；无同名唯一约束；无 `deleted` 列；`(knowledge_base_id, update_time DESC)` 索引）
- [x] 2.2 新增 Document DO / Mapper；物理删除；JSONB 或等价存储 `chunk_strategy_params`
- [x] 2.3 实现按库分页（OriginalFilename 模糊、更新时间倒序）与 `countByKnowledgeBaseId`

### Phase 2 验证

- [x] 2.4 测试上下文可加载 Mapper；同库同文件名可插入两行

## 3. ObjectStorage 与占用端口

- [x] 3.1 在 `fw-base` 新增 ObjectStorage 端口与 YAML 配置绑定（type/bucket/region/endpoint/密钥占位）；结构非法 fail-fast；缺密钥不挡启动
- [x] 3.2 在 `fw-base` 实现 S3 适配器（put/delete）；Knowledge 用 `ObjectKeys` 生成 `{namespace}/{documentId}`，失败映射 `A002015`
- [x] 3.3 将 `EmptyDocumentPresence` 替换为基于 Document 计数的实现；KnowledgeBase 删除路径继续调用该端口

### Phase 3 验证

- [x] 3.4 缺 bucket 的测试配置无法启动；密钥为空时可启动；`hasDocuments` 在插入行后为 true

## 4. 探测与策略校验

- [x] 4.1 实现 Tika 探测（必须设置 OriginalFilename）；规范化 markdown 别名；白名单拒绝 `A002011`
- [x] 4.2 实现 ChunkStrategy / Params 校验（`A002013` / `A002014`）；0 字节 `A002010`；超限对齐 `A002012`
- [x] 4.3 新增 `KnowledgeErrorCode` A002009–A002015

### Phase 4 验证

- [x] 4.4 单测：合法 MIME、octet-stream+.md、白名单外、空文件、overlap 越界、种类与键混用

## 5. Document API

- [x] 5.1 `POST /admin/knowledge-bases/{kbId}/documents`：单文件 multipart；先 put 后插库；库失败回滚对象
- [x] 5.2 `GET` 分页列表与详情（不含 objectKey）；知识库不存在 `A002001`；文档不存在或不属该库 `A002009`
- [x] 5.3 `PUT .../chunk-strategy`：整份替换参数并刷新 `update_time`
- [x] 5.3a `PUT .../chunk-strategy`：可选 `originalFilename`（主名可改、后缀锁定；不改 objectKey）
- [x] 5.4 `DELETE`：同步删对象；对象失败则整笔失败

### Phase 5 验证

- [x] 5.5 对照 knowledge-document spec：上传成功/同名重复、列表倒序与模糊、改策略、删除与对象失败保留记录；Staff 可删 Document

## 6. KnowledgeBase 视图与删库

- [x] 6.1 `KnowledgeBaseView` 增加 `documentCount`（列表/详情/创建/更新同源 COUNT）
- [x] 6.2 有 Document 时 Admin 删库返回 `A002008`；空库删除后 Namespace 可复用

### Phase 6 验证

- [x] 6.3 对照 knowledge-base delta：列表含 documentCount；有文档拒删；Staff 删库仍 `A001002`

## 7. 收尾

- [x] 7.1 端点、错误码与 `design.md` 一致；更新 `docs/backend/api.md`
- [x] 7.2 相关测试通过；无范围外功能（无切块、无下载、无 URL 上传、无 OSS 活跃实现）

### Phase 7 验证

- [x] 7.3 走通 PRD 首要闭环：上传 → 列表/详情 → 改策略 → 删文档 → `documentCount=0` → Admin 删库

## 8. Document 启用 / 禁用

- [x] 8.1 `t_knowledge_document` 增加 `enabled BOOLEAN NOT NULL DEFAULT TRUE`（含已有库 ALTER）
- [x] 8.2 `DocumentView` 返回 `enabled`；上传默认 `true`；`PUT .../enabled` 切换；刷新 `update_time`
- [x] 8.3 列表不按 enabled 筛选；禁用仍计入 `documentCount`；不删对象

### Phase 8 验证

- [x] 8.4 单测：上传默认启用；禁用后 `enabled=false`；再次启用成功
