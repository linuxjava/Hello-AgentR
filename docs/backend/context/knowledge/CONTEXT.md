# Backend / Knowledge

管理端治理的可检索知识容器。V0.2 起定义容器本身；V0.3 起 EmbeddingModel 目录为配置驱动；**V0.4 起引入 Document 摄入（上传与元数据），本阶段仅后端 API，不含分块执行与管理端 UI。**  
本词汇表跨版本持续生效；不随版本目录归档。

## Language

**KnowledgeBase（知识库）**：
运营人员创建并治理的知识容器。每个 KnowledgeBase 有可变的 Name、不可变的 Namespace，创建时绑定一个 EmbeddingModel；V0.4 起其下可包含 Document。
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
**ObjectStorage**：活跃类型/bucket 等结构不合法 → 启动失败；存储密钥占位未解析或为空 → 不挡启动，上传/删除对象时再失败。
_Avoid_: 因缺密钥拒绝启动、把空目录当启动失败、缺 S3 密钥导致整个管理端无法启动

**Document（文档）**：
KnowledgeBase 下的内容单元；对应一份已入库的源文件（对象存储中的二进制）及其业务元数据。上传成功即创建 Document，状态为 `UPLOADED`，默认 **Enabled**。**开始分块**是后续独立操作，不是上传的一部分。同一 KnowledgeBase 内允许存在多份 Document，即使原始文件名相同——每次上传都是新 Document，不以文件名或内容哈希作为身份。删除 KnowledgeBase 的前提是其下没有 Document（含已禁用）。
_Avoid_: 附件、File（作业务实体时）、把 Document 当成 KnowledgeBase、把「上传」与「分块」当成同一步、同库同名互斥、按内容去重（本阶段不做）

**OriginalFilename（原始文件名）**：
运营本地选择文件时的文件名；随 Document 持久化，供列表/详情展示与下载命名。不是唯一键，创建后本阶段不提供改名。
_Avoid_: Name（那是 KnowledgeBase 的显示名）、displayName、把文件名当 DocumentId

**DocumentStatus（文档状态）**：
Document 在摄入管线上的阶段标记。本阶段创建后固定为 `UPLOADED`，不迁到其他值；词汇上预留后续如 `CHUNKING` / `CHUNKED` / `FAILED`（具体枚举以后版本再钉）。仅当状态为 `UPLOADED` 时允许修改 ChunkStrategy。
_Avoid_: 本阶段实现完整状态迁移、用「有没有 Chunk」代替状态字段（已否决）、Processing（含糊）、用 DocumentStatus 表示启用/禁用

**Enabled（启用）**：
Document 的运营开关，与 DocumentStatus 解耦。上传成功后默认为启用（`true`）。Admin 与 Staff 可随时切换；禁用**不**删除业务记录或 ObjectStorage 对象，列表仍可见，且仍计入 `documentCount`（删库占用检查把禁用文档视为仍占用）。本阶段不做按 Enabled 筛选，也不把禁用接入检索/分块执行（那些能力尚未交付）。
代码 / API 用 `enabled`（boolean）；界面可用「启用 / 禁用」。
_Avoid_: active、online、上架、用 status 字段兼做开关、禁用即软删除、禁用后从列表隐藏（已否决）、禁用后 documentCount 不计（已否决）

**ChunkStrategy（分块策略）**：
Document 在上传时由运营人员选定并持久化的切块方式；取值仅允许 `OVERLAPPING`（重叠分块）与 `STRUCTURE_AWARE`（基于文档结构的分块）。上传与改策略时必须同时提交对应的 ChunkStrategyParams。状态为 `UPLOADED` 时可改种类和参数（改种类则整份 JSON 替换）；一旦离开 `UPLOADED` 则种类与参数一并冻结。本阶段不执行分块、不产生 Chunk，故策略与参数始终可改。
代码 / API 用 `ChunkStrategy`；界面与中文文档可用「重叠分块」「基于文档结构的分块」。
_Avoid_: ChunkingMode、SplitStrategy、把策略拖到「开始分块」才首次选择（已否决）、上传后策略永久不可改（已否决）、本阶段只存枚举不收参数（已否决）、本阶段执行切块

**ChunkStrategyParams（分块策略参数）**：
随 ChunkStrategy 持久化的 JSON；键由种类决定，禁止无关键、禁止混用另一类的键。
- `OVERLAPPING`：`chunkSize`（块大小）、`overlap`（重叠大小）；整数；单位为 **Unicode 字符**；`chunkSize > 0`；`0 ≤ overlap < chunkSize`。无额外绝对值上限。
- `STRUCTURE_AWARE`：按**该文件格式自身的文档结构**切分，不限定为 Markdown。V0.4 上传**不**按媒体类型限制策略（图片、表格也可选 `STRUCTURE_AWARE`）。JSON 必含 `defaultChunkSize`、`maxChunkSize`、`minChunkSize`、`overlap`（整数；单位为 **Unicode 字符**；均 `> 0` 除 overlap 可为 0；`minChunkSize ≤ defaultChunkSize ≤ maxChunkSize`；`0 ≤ overlap < minChunkSize`）。无额外绝对值上限。标题层级不另设 JSON 字段：各格式用各自的标题/大纲（Markdown 为 ATX `H1`–`H6`）。Markdown 另固有：围栏代码块保持完整、原子图片与原子链接不拆开。其它格式的结构单元在「开始分块」版本再钉。
_Avoid_: 任意自由 JSON、把 STRUCTURE_AWARE 限定为仅 Markdown（已否决）、上传时按 MIME 禁止某策略（已否决）、把标题层级做成运营多选、本阶段把正则写进词汇表、把参数留到开始分块再收（已否决）、V0.4 执行切块或格式转换

**ObjectStorage（对象存储）**：
部署级、全局唯一的活跃文件后端，实现落在 `fw-base`，不是 Knowledge 独有实体。由部署侧 YAML 声明，不是运营可切换的业务选项。首版活跃类型为 `s3`；实现须可扩展为 `oss` 等，但同一时刻只有一个活跃后端。连接参数按 `type` 分挂在 `s3` / `oss` 子块（endpoint、bucket、region 或 internal-endpoint 等）；密钥只以环境变量/占位引用出现，不以明文写入 YAML，也不通过管理 API 回传。配置变更仅重启后生效。只校验当前活跃子块。S3 适配器在首次写入/删除对象时，若配置桶不存在则自动创建（账号须有建桶权限）。Document 的 **objectKey 由 Knowledge 生成**（调用方不可传），路径包含该库 Namespace 以实现存储隔离；不使用 OriginalFilename 作为路径主体。objectKey 不通过管理 API 返回。存储失败由 Document 用例映射为 `A002015`。
_Avoid_: 每文档绑定 storageProvider、把 S3/OSS 当运营可选项、在管理 API 中暴露密钥或 objectKey、YAML 明文密钥、Bucket（作业务实体名时）、运行中热切换存储后端、调用方自定 objectKey、把存储适配器放进 knowledge 包、fw-base 依赖 Knowledge 错误码、启动期强制建桶（会挡登录）

**DocumentSourceType（文档来源）**：
Document 的入库来源类型；上传时写入并持久化。本阶段仅允许 `LOCAL_FILE`（运营选择本地文件，经管理 API 入库）；后续可扩展 `URL`（从地址拉取后再写入同一 ObjectStorage，仍是同一 Document 模型）。本阶段 API 拒绝非 `LOCAL_FILE`。
_Avoid_: 为 URL 另建实体、本阶段实现 URL 拉取、把来源当成 ObjectStorage 厂商

**AllowedMediaType（允许的媒体类型）**：
上传是否合法以**服务端内容探测结果**为准，不以客户端声明的 Content-Type 为准。本阶段用 Apache Tika 探测（须同时提供文件字节与 OriginalFilename，否则 Markdown 等无魔数格式会退化成 `text/plain`）。探测结果规范化后须落在下列集合内，否则拒绝上传：
- `text/plain`
- `text/markdown`（Tika 历史别名 `text/x-markdown`、`text/x-web-markdown` 视为同类）
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `image/png`
- `image/jpeg`
- `image/svg+xml`
探测得到的媒体类型随 Document 持久化。列表/详情对调用方只返回元数据（含 OriginalFilename、媒体类型、大小、ChunkStrategy、DocumentStatus、Enabled 等），**不**返回 objectKey。Office 容器格式（DOC/PPT/XLS 与 OOXML）依赖 Tika 的容器探测，不能只靠扩展名。
_Avoid_: 只信 multipart Content-Type、只认扩展名、本阶段不限类型、把解析能否切块当作上传门槛、排除 PPTX/XLSX（已否决）

## Upload（V0.4）

- 校验顺序：拒绝 0 字节 → 大小（部署配置）→ Tika 探测 AllowedMediaType → 写入 ObjectStorage → 创建 Document。
- 成功条件：源文件**先**写入活跃 ObjectStorage，**再**创建 Document；仅当两者都成功时 API 才返回成功。库写入失败须尝试删除已写入对象，避免孤儿文件。
- 上传请求必须带 ChunkStrategy、该策略的参数 JSON，与**一份**本地文件（单文件）；`sourceType` 固定为 `LOCAL_FILE`。批量由调用方多次请求完成，本阶段不做多文件事务。
- 本阶段不提供预签名直传、不提供 URL 拉取。
- 单文件大小与整次请求大小上限由**部署配置**声明（不写死在领域规则里）；配置外的文件拒绝。

## Capability（本阶段）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 列表 / 详情 KnowledgeBase | 能 | 能 |
| 创建 KnowledgeBase | 能 | 能 |
| 改任意库的 Name / 描述 | 能 | 能 |
| 改 Namespace / EmbeddingModel | 不能 | 不能 |
| 删除 KnowledgeBase | 能 | 不能 |
| 通过 API 增删改 ModelProvider / EmbeddingModel | 不能 | 不能 |
| 上传 / 列表 / 详情 Document | 能 | 能 |
| 改 Document 的 ChunkStrategy | 能 | 能 |
| 启用 / 禁用 Document | 能 | 能 |
| 删除 Document | 能 | 能 |

**可见性（本阶段）**：任何已登录 AdminUser 都能看见全部 KnowledgeBase 及其下 Document。`createdBy` 只做审计，不做访问隔离。

## API Use Cases（本阶段）

| # | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 分页列表 KnowledgeBase | Admin / Staff |
| 2 | 知识库详情 | Admin / Staff |
| 3 | 创建 KnowledgeBase | Admin / Staff |
| 4 | 改 Name / Description | Admin / Staff |
| 5 | 删除 KnowledgeBase | Admin |
| 6 | EmbeddingModel 只读目录（对象列表） | Admin / Staff |
| 7 | 上传 Document（本地文件 + ChunkStrategy） | Admin / Staff |
| 8 | 库内分页列表 Document | Admin / Staff |
| 9 | Document 详情 | Admin / Staff |
| 10 | 改 Document 的 ChunkStrategy | Admin / Staff |
| 11 | 启用 / 禁用 Document | Admin / Staff |
| 12 | 删除 Document | Admin / Staff |

## Delete（本阶段）

**KnowledgeBase**
- 仅 Admin 可删。
- 仅当该 KnowledgeBase 下没有 Document 时允许删除（V0.4 起该条件真正可触发；已禁用 Document 仍占用）。
- 物理删除；删除成功后 Namespace 立刻可被新库使用。

**Document**（V0.4）
- Admin / Staff 均可删。
- 物理删除：业务记录与 ObjectStorage 中的源文件**同步删除**；对象删除失败则整笔失败，Document 仍保留。
- 删除后该库若已无 Document，即可再次删除 KnowledgeBase。

## List（本阶段）

**KnowledgeBase**：分页默认 20、上限 100；按 **Name 模糊**筛选；不按 Namespace 筛选；默认按创建时间倒序。列表与详情均返回 **documentCount**（该库下 Document 条数，含已禁用）。

**Document**（V0.4）：在某一 KnowledgeBase 下分页列表；分页默认 20、上限 100；可按 **OriginalFilename 模糊**筛选；不按 Namespace / DocumentStatus / ChunkStrategy / Enabled 筛选；默认按 **更新时间倒序**（改 ChunkStrategy 或 Enabled 会刷新更新时间；新建时更新时间等于创建时间）。已禁用 Document 仍出现在列表中。

## In-scope（本阶段）

- （既有）KnowledgeBase 容器治理与 EmbeddingModel 配置目录（见上代已锁定能力）；列表/详情增加 **documentCount**
- **V0.4 Document**：`sourceType=LOCAL_FILE` 的本地文件上传（必选 ChunkStrategy、AllowedMediaType、大小受部署配置限制）→ 先写入 ObjectStorage 再创建记录，状态 `UPLOADED`、默认 `enabled=true`；库内分页列表；详情；改 ChunkStrategy（仅 `UPLOADED`）；启用/禁用；删除 Document（同步删对象）；`sourceType` 持久化以预留 `URL`
- 对象存储：部署级单一活跃 **ObjectStorage**（实现在 `fw-base`；YAML 声明，首版 `s3`，可扩展 `oss`；密钥占位；仅重启生效）；Document 存 Knowledge 生成的 objectKey，不按文档选厂商

## Out-of-scope（本阶段明确不做）

- **开始分块**、解析、切块执行、Chunk 实体、向量写入与索引状态
- URL 地址上传（仅预留 `DocumentSourceType=URL`，本版不实现）
- 预签名直传 / 预签名下载 ObjectStorage
- Document 源文件下载或预览 API（列表/详情只返回元数据，不暴露 objectKey）
- OSS 作为活跃存储后端（仅要求可扩展，本版活跃后端为 S3）
- 修改 Document 显示名/备注（若与原始文件名分离——本版不做套餐 C）
- 按 Namespace 筛选 KnowledgeBase；修改 Namespace 或 EmbeddingModel
- 恢复已删除的 KnowledgeBase / Document
- 按创建人或租户隔离可见性
- 通过 API 或管理端增删改 ModelProvider / EmbeddingModel
- Chat/LLM 的 Provider 与模型配置
- 调用上游 Embedding 或连通性探测 API
- **Web 管理端** Document 页与「进入知识库」UI（V0.4 验收不含；可并行另开）
- EndUser / 用户端检索摄入入口
