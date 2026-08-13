# Backend / Knowledge

管理端治理的可检索知识容器。本阶段只定义容器本身，不含内容摄入与检索执行。  
本词汇表由 V0.2 引入，跨版本持续生效；不随版本目录归档。

## Language

**KnowledgeBase（知识库）**：
运营人员创建并治理的知识容器；本阶段只包含容器本身，不含其中的文档、切块与索引。每个 KnowledgeBase 有可变的 Name、不可变的 Namespace，并在创建时绑定一个 EmbeddingModel。
_Avoid_: Dataset、Collection（作业务实体时）、知识库实例、Index（作知识库别名时）

**Name（名称）**：
KnowledgeBase 的面向人的显示名；全局唯一；创建后可以改。长度 1–64；允许中文与常见标点；首尾空白忽略。
_Avoid_: title、displayName、别名

**Description（描述）**：
KnowledgeBase 的可选说明；最长 200 字。
_Avoid_: 简介、备注（口语可，文档用 Description）

**Namespace**：
KnowledgeBase 的稳定唯一标识；由运营人员在创建时填写；仅小写字母与数字（`[a-z0-9]`）；长度 2–32；创建后不可改；用于存储目录与检索隔离。
_Avoid_: slug、code、Collection、path、用 Name 当存储键、系统自动生成的目录名

**ModelProvider（模型提供商）**：
上游嵌入服务的接入点；由部署侧 YAML 以 **map** 声明，不是运营在 API 里创建的实体。map 的 **key 即 providerId**，同时也是协议适配标识；首版仅允许 `alibailian`、`siliconflow` 两个 key，**每个 key 最多一条**（无 `type` 字段——key 即 type）。每条声明含连接参数（baseUrl、鉴权密钥引用等）。密钥在配置中只以环境变量/占位引用出现，不以明文写入 YAML。本阶段不包含 Chat/LLM。`ModelProvider` 与 `EmbeddingModel` 在配置结构上分开声明；`EmbeddingModel.providerId` 必须指向 map 中已存在的 key。连接参数只服务后续摄入/调用，不通过管理 API 回传密钥；本阶段不调用上游做连通性探测。
_Avoid_: Vendor、Supplier、账号、把 Provider 当成 EmbeddingModel、在目录 API 中暴露密钥、YAML 明文 apiKey、自定义实例名（如 bailian-main）、同一厂商多条配置

**EmbeddingModel（向量模型）**：
创建 KnowledgeBase 时绑定的向量模型；创建后不可更换；不是对话用的 LLM。权威来源是部署侧 YAML（挂在某个 ModelProvider 下）；进程启动时加载为只读目录，**仅重启后**反映配置变更（不热加载）。标识在全配置内全局唯一；KnowledgeBase 只存该标识，不存 Provider。目录项对人暴露 id、model、dimension、providerId、priority、isDefault；创建知识库时由后端自动选择 `isDefault=true` 的目录项，不接受前端传入模型 id。`model` 是调用上游 Embedding 接口时使用的模型标识。目录返回顺序按 priority 升序（数值越小优先级越高）；priority 相同按 id 升序稳定排序。`dimension` 在本配置中要求统一大小（所有 EmbeddingModel 必须相同）。`isDefault` 在全目录中必须且仅能有一个 `true`。
代码 / API / YAML 用 `EmbeddingModel`；界面、错误提示、中文文档用「向量模型」。
_Avoid_: LLM、Chat 模型、嵌入模型（技术对照可，文档与界面用向量模型）、模拟目录（已废弃称谓）、运行中热更新目录

**目录漂移（已绑定但配置已移除）**：
若某 KnowledgeBase 已绑定的 EmbeddingModel id 不再出现在当前目录中：已有库仍可列表、详情、改 Name/Description、删除；仅**新建**时拒绝不在目录中的 id。详情/列表仍返回库中已存的 id，不因目录缺失而失败。
_Avoid_: 因此启动失败、因此阻断读改删

**配置加载（本阶段）**：
进程启动时从 YAML 加载。结构不合法（缺必填、`modelProviders` map key 不在允许集合、EmbeddingModel id 全局冲突、dimension 非法或不一致、priority 非法、`providerId` 未指向 map 中已声明 key、`isDefault=true` 数量不是 1 等）→ 启动失败。密钥占位未解析或为空 → 不挡启动。目录可以为空（0 个 EmbeddingModel）→ 启动成功，创建一律因模型不合法被拒。
_Avoid_: 因缺密钥拒绝启动、把空目录当启动失败

**Document（文档）**：
KnowledgeBase 下的内容单元；本阶段不实现其 API，下一版本再做。删除 KnowledgeBase 的前提是其下没有 Document。
_Avoid_: 附件、File（作业务实体时）、把 Document 当成 KnowledgeBase

## Capability（本阶段）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 列表 / 详情 | 能 | 能 |
| 创建 KnowledgeBase | 能 | 能 |
| 改任意库的 Name / 描述 | 能 | 能 |
| 改 Namespace / EmbeddingModel | 不能 | 不能 |
| 删除 KnowledgeBase | 能 | 不能 |
| 通过 API 增删改 ModelProvider / EmbeddingModel | 不能 | 不能 |

**可见性（本阶段）**：任何已登录 AdminUser 都能看见全部 KnowledgeBase。`createdBy` 只做审计，不做访问隔离。

## API Use Cases（本阶段）

| # | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 分页列表 KnowledgeBase | Admin / Staff |
| 2 | 知识库详情 | Admin / Staff |
| 3 | 创建 KnowledgeBase | Admin / Staff |
| 4 | 改 Name / Description | Admin / Staff |
| 5 | 删除 KnowledgeBase | Admin |
| 6 | EmbeddingModel 只读目录（对象列表） | Admin / Staff |

## Delete（本阶段）

- 仅 Admin 可删。
- 仅当该 KnowledgeBase 下没有 Document 时允许删除；本阶段尚未有 Document，因此该条件恒成立，规则仍写入契约，供下一版本生效。
- 物理删除；删除成功后 Namespace 立刻可被新库使用。

## List（本阶段）

分页默认 20、上限 100；按 **Name 模糊**筛选；不按 Namespace 筛选；默认按创建时间倒序。

## In-scope（本阶段）

- 创建 KnowledgeBase（Name、Description、Namespace；EmbeddingModel 由后端默认模型自动绑定）
- 分页列表与详情
- 修改任意库的 Name / Description
- 物理删除（无 Document 前提；仅 Admin）
- 从 YAML 加载 ModelProvider（map key = providerId，首版 `alibailian` | `siliconflow`）+ EmbeddingModel（list），暴露 EmbeddingModel 只读目录（对象：id / model / dimension / providerId / priority / isDefault）；密钥不出现在 API 响应；配置变更仅重启生效
- 创建时使用目录唯一默认模型；无默认模型或默认模型缺失时拒绝创建
- 目录漂移按宽松规则（已绑定可读写删；仅新建校验目录）
- 配置结构不合法则启动失败；缺密钥与空目录不挡启动

## Out-of-scope（本阶段明确不做）

- Document 上传、列表、删除
- 解析、切块、向量写入与索引状态
- 按 Namespace 筛选
- 修改 Namespace 或 EmbeddingModel
- 恢复已删除的 KnowledgeBase
- 按创建人或租户隔离可见性
- 通过 API 或管理端增删改 ModelProvider / EmbeddingModel
- Chat/LLM 的 Provider 与模型配置
- 单独的 ModelProvider 列表 API（目录已含 providerId）
- 调用上游 Embedding 或连通性探测 API
- Web 管理端页面与契约消费方改造（可并行，但不作为本上下文验收对象）
