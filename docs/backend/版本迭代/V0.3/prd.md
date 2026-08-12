# 产品需求文档（PRD）：配置驱动 Embedding 模型目录与知识库绑定（V0.3）

**状态**：草稿 | **负责人**：待定（产品） | **最后更新**：2026-08-12

**版本**：V0.3  
**交付重心**：后端开发（配置加载、启动校验、目录 API、建库校验）；不涉及 Web 管理后台开发。  
**领域词汇**：[`docs/backend/context/knowledge/CONTEXT.md`](../../context/knowledge/CONTEXT.md)  
**身份与鉴权**：沿用 V0.1，见 [`docs/backend/context/admin-identity/CONTEXT.md`](../../context/admin-identity/CONTEXT.md)

---

## 1. 目的与范围

- **业务目标引用**：`BRD-OBJ-TBD`
- **问题陈述**：V0.2 的 EmbeddingModel 目录为模拟写死数据，无法按环境配置真实可用模型。需要将目录改为 YAML 配置驱动，并在创建 KnowledgeBase 时由后端自动绑定默认模型，确保后续 query 与知识库使用同一向量模型。
- **假设**：
  - 本迭代仅覆盖 Embedding 相关配置，不覆盖 Chat/LLM。
  - 配置为后端唯一事实来源；不提供 Provider/Model 的管理 API。
  - 目录变更通过重启生效，不做热加载。
- **范围内**：
  - `modelProviders` 与 `embeddingModels` 的 YAML 配置结构
  - 启动加载与结构校验
  - `GET /admin/embedding-models` 目录接口（对象列表）
  - 创建 KnowledgeBase 时模型合法性校验（只接受目录内 id）
  - 目录漂移（已绑定模型后续被移除）下的运行语义
- **范围外**：
  - Web 管理端页面改造
  - Chat/LLM Provider 或模型配置
  - 上游连通性探测、真实 Embedding 调用
  - Provider/Model CRUD API

---

## 2. 目标与护栏

- **首要指标**：运维仅通过 YAML 即可完成多厂商 Embedding 模型目录配置；已登录 Admin/Staff 创建知识库时由后端自动绑定默认模型，且无默认模型时 100% 拒绝创建。
- **次要指标**：
  - 配置结构错误在启动期 100% fail-fast
  - 目录排序稳定、可预测
- **护栏**：
  - KnowledgeBase 仍只绑定单字段 `embeddingModel`（模型 `id`），不改为复合键
  - `Namespace` 与 `EmbeddingModel` 创建后不可修改
  - 密钥不得以明文提交到仓库配置（仅环境变量占位）
  - 配置变更仅重启生效

---

## 3. 关键决策（已确认）

1. **配置驱动方式**：Provider 与 EmbeddingModel 通过 YAML 配置，不通过 API 创建。  
2. **范围限定**：仅 Embedding（E），不含 Chat。  
3. **Provider 结构**：`modelProviders` 使用 **map**；key 即 `providerId`。  
4. **Provider key 约束**：首版仅允许 `alibailian`、`siliconflow`；每厂商最多一条配置（K1）。  
5. **去掉 type 字段**：不再单独配置 `type`，map key 即协议标识。  
6. **Model 结构**：`embeddingModels` 为 list，并通过 `providerId` 关联 provider。  
7. **模型字段**：去掉 `displayName`；保留 `model` 字段作为上游请求模型名。  
8. **模型唯一性**：`embeddingModels.id` 全局唯一（G）。  
9. **维度约束**：所有 `embeddingModels.dimension` 必须统一大小。  
10. **默认模型**：新增 `isDefault`，全局必须且仅一个 `true`；创建知识库固定使用该默认模型。  
11. **目录排序**：`priority ASC, id ASC`（priority 可重复，P1）。  
12. **目录漂移策略**：L（宽松）——已绑定但被移除的模型不阻断已有库读/改/删，仅阻断新建。  
13. **引用完整性**：`providerId` 悬空即启动失败（R1）。  
14. **密钥策略**：仅环境变量占位（P），不允许明文。  
15. **生效策略**：重启生效（R），不做热加载。  
16. **启动容错策略**：B——结构错误启动失败；缺密钥不挡启动；空目录可启动但创建必拒绝。

---

## 4. 配置规格（YAML）

### 4.1 结构定义

```yaml
hello-agentr:
  model-catalog:
    modelProviders: # map
      alibailian:
        baseUrl: https://dashscope.aliyuncs.com/compatible-mode/v1
        apiKey: ${ALIBAILIAN_API_KEY}
      siliconflow:
        baseUrl: https://api.siliconflow.cn/v1
        apiKey: ${SILICONFLOW_API_KEY}

    embeddingModels: # list
      - id: bge-m3
        model: bge-m3
        dimension: 1024
        providerId: alibailian
        priority: 10
        isDefault: true
      - id: sf-bge-large-zh
        model: BAAI/bge-large-zh-v1.5
        dimension: 1024
        providerId: siliconflow
        priority: 20
        isDefault: false
```

### 4.2 字段语义

| 字段 | 说明 |
| --- | --- |
| `modelProviders` | Provider 配置 map，key 即 providerId |
| `baseUrl` | 上游服务地址 |
| `apiKey` | 鉴权密钥占位（环境变量） |
| `embeddingModels.id` | 平台内稳定模型标识（KnowledgeBase 绑定此字段） |
| `embeddingModels.model` | 调用上游接口时传入的模型名 |
| `embeddingModels.dimension` | 向量维度（全目录一致） |
| `embeddingModels.providerId` | 归属 provider（必须命中 map key） |
| `embeddingModels.priority` | 排序优先级，数字越小越靠前 |
| `embeddingModels.isDefault` | 默认模型标记（全局唯一 true） |

---

## 5. 启动加载与校验规则

### 5.1 启动失败条件（Fail Fast）

- `modelProviders` key 不在允许集合（非 `alibailian` / `siliconflow`）
- Provider 必填字段缺失（如 `baseUrl`）
- `embeddingModels.id` 重复
- `embeddingModels.model` 为空
- `dimension` 非法或目录内不一致
- `priority` 非法
- `providerId` 未指向已声明 provider（悬空引用）
- `isDefault=true` 数量不是 1

### 5.2 可启动但带约束条件

- `apiKey` 占位未解析或为空：**不挡启动**
- `embeddingModels` 为空：**可启动**，但创建 KnowledgeBase 时模型校验全部失败

---

## 6. API 与业务行为

### 6.1 目录 API

- `GET /admin/embedding-models`（需登录）
- 返回对象字段：`id` / `model` / `dimension` / `providerId` / `priority` / `isDefault`
- 排序：`priority ASC, id ASC`
- 不返回敏感字段：`apiKey`（及其他连接秘密）

### 6.2 创建 KnowledgeBase

- 请求不再接收 `embeddingModel`
- 后端读取目录中的默认模型（`isDefault=true`）并自动绑定
- 当默认模型不存在/不可用时拒绝创建（`A002007`）
- 成功后库内只保存模型 id，不保存 provider 信息

### 6.3 目录漂移（L）

- 若历史 KnowledgeBase 绑定的模型 id 已从当前目录移除：
  - 仍允许：列表、详情、改 Name/Description、删除
  - 不允许：新建时使用目录外 id

---

## 7. 角色与用例

| 用例 ID | 角色 | 目标 |
| --- | --- | --- |
| UC-301 | Admin / Staff | 查询配置驱动的 Embedding 模型目录 |
| UC-302 | Admin / Staff | 创建 KnowledgeBase 并绑定目录中的模型 id |
| UC-303 | Admin / Staff | 在目录漂移后继续维护已有知识库（不影响读改删） |
| UC-304 | 运维 | 通过 YAML 调整 Provider / Model 配置并重启生效 |

---

## 8. 验收标准（核心）

| 验收 ID | 场景 | 期望 |
| --- | --- | --- |
| AC-301 | 配置合法启动 | 服务启动成功，目录 API 可返回对象列表 |
| AC-302 | providerId 悬空 | 启动失败并给出配置错误信息 |
| AC-303 | 两个默认模型 | 启动失败 |
| AC-304 | 维度不一致 | 启动失败 |
| AC-305 | 非法模型创建 | 创建失败（模型不合法） |
| AC-306 | 目录漂移 | 历史库可读改删；新建目录外模型失败 |
| AC-307 | 密钥为空 | 服务可启动；目录仍可查询 |
| AC-308 | 空目录 | 服务可启动；创建全部拒绝 |

---

## 9. 非功能约束

- **安全**：禁止明文密钥；仅环境变量占位
- **一致性**：目录排序稳定，避免前后端顺序抖动
- **可运维性**：所有结构问题在启动期暴露，不延迟到运行时

---

## 10. 依赖与发布

- 依赖 V0.1 鉴权体系（Admin/Staff）
- 与 V0.2 KnowledgeBase API 契约兼容（创建字段仍是 `embeddingModel` 单值）
- 发布方式：随 backend V0.3 发布，配置改动需重启

---

## 11. 追溯链接

- 词汇表：`docs/backend/context/knowledge/CONTEXT.md`
- 上下文地图：`CONTEXT-MAP.md`
- V0.2 PRD：`docs/backend/版本迭代/V0.2/prd.md`
- 后续 SRS / OpenSpec：待补（建议 change 前缀：`backend-`）

---

## 12. 变更记录

| 日期 | 作者 | 变更说明 |
| ---- | ---- | -------- |
| 2026-08-12 | grilling 会话沉淀 | 首稿：配置驱动 Provider/EmbeddingModel（K1 map + model 字段 + 默认模型 + 统一维度） |

