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

**EmbeddingModel（嵌入模型）**：
创建 KnowledgeBase 时绑定的嵌入模型；创建后不可更换；不是对话用的 LLM。本阶段由只读模拟目录提供可选项，创建只接受目录中的标识。
_Avoid_: LLM、Chat 模型、向量模型（口语可，文档用 EmbeddingModel）

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

**可见性（本阶段）**：任何已登录 AdminUser 都能看见全部 KnowledgeBase。`createdBy` 只做审计，不做访问隔离。

## API Use Cases（本阶段）

| # | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 分页列表 KnowledgeBase | Admin / Staff |
| 2 | 知识库详情 | Admin / Staff |
| 3 | 创建 KnowledgeBase | Admin / Staff |
| 4 | 改 Name / Description | Admin / Staff |
| 5 | 删除 KnowledgeBase | Admin |
| 6 | EmbeddingModel 模拟目录 | Admin / Staff |

## Delete（本阶段）

- 仅 Admin 可删。
- 仅当该 KnowledgeBase 下没有 Document 时允许删除；本阶段尚未有 Document，因此该条件恒成立，规则仍写入契约，供下一版本生效。
- 物理删除；删除成功后 Namespace 立刻可被新库使用。

## List（本阶段）

分页默认 20、上限 100；按 **Name 模糊**筛选；不按 Namespace 筛选；默认按创建时间倒序。

## In-scope（本阶段知识库容器）

- 创建 KnowledgeBase（Name、Description、Namespace、EmbeddingModel）
- 分页列表与详情
- 修改任意库的 Name / Description
- 物理删除（无 Document 前提；仅 Admin）
- EmbeddingModel 只读模拟目录

## Out-of-scope（本阶段明确不做）

- Document 上传、列表、删除
- 解析、切块、向量写入与索引状态
- 按 Namespace 筛选
- 修改 Namespace 或 EmbeddingModel
- 恢复已删除的 KnowledgeBase
- 按创建人或租户隔离可见性
- 管理端知识库页面（可并行，但不作为本上下文验收对象）
