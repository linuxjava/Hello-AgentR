## 1. 探查与复用确认

- [x] 1.1 盘点可复用实现：`EmbeddingModelCatalog` 接口、Knowledge 创建校验路径、`/admin/**` 登录门禁、统一响应 `R<T>`
- [x] 1.2 确认现有配置绑定机制（`@ConfigurationProperties`）与包落点，避免新建重复配置框架

### Phase 1 验证

- [x] 1.3 输出复用清单：列出继续复用的类与将被替换的 V0.2 模拟目录实现

## 2. 配置模型与启动校验

- [x] 2.1 新增 `model-catalog` 配置绑定对象：`modelProviders`（map）与 `embeddingModels`（list）
- [x] 2.2 实现启动期校验：provider key 白名单、`id` 全局唯一、`model` 必填、`dimension` 全局一致、`providerId` 引用完整、`isDefault=true` 全局唯一、`priority` 合法
- [x] 2.3 明确容错：`apiKey` 为空不挡启动；`embeddingModels` 为空可启动

### Phase 2 验证

- [x] 2.4 覆盖启动校验测试：非法 provider、悬空 providerId、重复 id、双默认、维度不一致、空目录可启动

## 3. 目录实现与 API 契约

- [x] 3.1 将目录实现从模拟字符串替换为配置驱动对象集合
- [x] 3.2 实现目录排序规则：`priority ASC, id ASC`（priority 可重复）
- [x] 3.3 调整 `GET /admin/embedding-models` 响应 DTO：`id/model/dimension/providerId/priority/isDefault`
- [x] 3.4 保证 API 不返回敏感字段（`apiKey` 等）

### Phase 3 验证

- [ ] 3.5 接口测试断言字段完整、排序稳定、无敏感字段泄露

## 4. KnowledgeBase 创建校验与漂移语义

- [x] 4.1 创建时继续只接收 `embeddingModel=id`，并改为对新目录对象集合做成员校验
- [x] 4.2 保持 `embeddingModel` 创建后不可修改
- [x] 4.3 落地目录漂移语义：历史库读/改名描述/删除可继续，新建目录外 id 拒绝

### Phase 4 验证

- [ ] 4.4 覆盖闭环：目录查询 → 合法创建成功 → 非法 id 创建失败 → 漂移后历史库可读改删

## 5. 文档与收尾

- [x] 5.1 更新 `docs/backend/api.md` 第 3 节目录响应示例与字段说明
- [x] 5.2 补充 `docs/backend/环境变量清单.md`（新增或确认 `ALIBAILIAN_API_KEY`、`SILICONFLOW_API_KEY` 占位）
- [x] 5.3 确认无范围外内容（无 Chat、无 Provider CRUD、无上游连通探测）

### Phase 5 验证

- [ ] 5.4 代码、测试、文档三者与本变更 spec 一致
