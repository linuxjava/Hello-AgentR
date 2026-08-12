## 1. 契约梳理与复用确认

- [x] 1.1 复用现有 `knowledgeApi`、列表页、创建模态，不新建第二套知识库页面
- [x] 1.2 明确目录对象字段与前端类型映射（`id/model/dimension/providerId/priority/isDefault`）

### Phase 1 验证

- [x] 1.3 输出映射清单并确认创建仍提交 `embeddingModel=id`

## 2. API 类型与数据层改造

- [x] 2.1 更新 `listEmbeddingModels` 返回类型：`string[]` -> `EmbeddingModelCatalogItem[]`
- [x] 2.2 增加目录项 TypeScript 类型定义并在调用处收敛使用
- [x] 2.3 更新创建请求映射，确保提交字段仍为 `embeddingModel`

### Phase 2 验证

- [x] 2.4 单测覆盖：目录字段解析、创建请求体映射正确

## 3. 创建模态与失败态

- [x] 3.1 更新创建模态下拉选项构建：value 使用 `id`
- [x] 3.2 目录失败态：显示目录不可用并禁用创建按钮
- [x] 3.3 未选模型提交：前端阻断并提示

### Phase 3 验证

- [x] 3.4 交互测试覆盖：目录成功、目录失败、未选模型

## 4. 列表与权限回归

- [x] 4.1 列表“向量模型”列保持展示 `embeddingModel`（id）
- [x] 4.2 Staff 删除限制行为回归（不可提交删除）
- [x] 4.3 编辑流程回归（仅名称/描述可改）

### Phase 4 验证

- [x] 4.4 回归测试通过：Admin/Staff 关键路径无回归

## 5. 文档与收尾

- [x] 5.1 更新前端 API/实现注释中的目录契约描述
- [x] 5.2 对照 `docs/frontend-admin/版本迭代/V0.3/prd.md` 与 `ixd.md` 完成验收点自查
- [x] 5.3 确认无 out-of-scope 实现（无 provider 管理、无 chat 配置）

### Phase 5 验证

- [x] 5.4 `lint/test/build` 通过并附验证记录
