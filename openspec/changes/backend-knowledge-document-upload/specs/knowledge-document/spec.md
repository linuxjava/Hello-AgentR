## ADDED Requirements

### Requirement: 上传本地文件创建 Document

已登录的 Admin 与 Staff SHALL 可向存在的 KnowledgeBase 上传**一份**本地文件。请求 MUST 包含文件、`chunkStrategy` 与 `chunkStrategyParams`。系统 MUST 先将对象写入 ObjectStorage，再创建 Document；仅两者都成功时 MUST 返回成功。成功后 `status` MUST 为 `UPLOADED`，`sourceType` MUST 为 `LOCAL_FILE`。objectKey MUST 由系统生成且包含该库 Namespace；调用方 MUST NOT 传入 objectKey。同一库内相同 OriginalFilename MUST 允许重复，每次 MUST 创建新 Document。

#### Scenario: 合法单文件上传成功

- **GIVEN** Admin 或 Staff 已登录，目标知识库存在，文件非空且 MIME 在白名单，策略与参数合法
- **WHEN** 提交单文件上传
- **THEN** 创建成功，状态为 `UPLOADED`，`enabled` 为 true，`sourceType` 为 `LOCAL_FILE`，随后列表可见，且该库 `documentCount` 增加 1

#### Scenario: 同名文件再次上传成功

- **GIVEN** 该库已存在相同 OriginalFilename 的 Document
- **WHEN** 再次上传同名合法文件
- **THEN** 创建新 Document，不覆盖已有记录

#### Scenario: 知识库不存在

- **GIVEN** 已登录
- **WHEN** 向不存在的知识库 id 上传
- **THEN** 系统拒绝且不产生可查询的 Document

#### Scenario: 未登录被拒绝

- **GIVEN** 无有效管理端 token
- **WHEN** 调用上传接口
- **THEN** 系统拒绝（未登录）

### Requirement: 拒绝空文件与非法来源

系统 MUST 拒绝 0 字节文件。本阶段 MUST 仅接受 `LOCAL_FILE` 语义的本地 multipart 文件；MUST NOT 实现 URL 拉取。一次请求 MUST 只处理一份文件。

#### Scenario: 0 字节文件被拒绝

- **GIVEN** 已登录且目标知识库存在
- **WHEN** 上传 0 字节文件
- **THEN** 系统拒绝，不产生 Document，对象存储无对应对象

#### Scenario: 非单文件本地上传被拒绝

- **GIVEN** 已登录
- **WHEN** 一次请求多个文件或试图按 URL 来源入库
- **THEN** 系统拒绝

### Requirement: Tika 媒体类型白名单

上传是否合法 MUST 以服务端 Tika 探测结果为准，MUST NOT 以客户端 Content-Type 为权威。探测 MUST 使用文件字节与 OriginalFilename。探测结果规范化后 MUST 属于词汇表 AllowedMediaType 集合，否则 MUST 拒绝。`text/x-markdown` 与 `text/x-web-markdown` MUST 视为 `text/markdown`。系统 MUST NOT 因媒体类型禁止某一 ChunkStrategy。

#### Scenario: 白名单类型上传成功

- **GIVEN** 已登录，文件经 Tika 识别为白名单类型（含客户端声明为 octet-stream 的 `.md`）
- **WHEN** 上传
- **THEN** 成功，详情中的 mediaType 为规范化后的类型

#### Scenario: 白名单外类型被拒绝

- **GIVEN** 已登录，Tika 探测结果不在白名单
- **WHEN** 上传
- **THEN** 系统拒绝，不产生 Document

#### Scenario: 图片可选结构分块

- **GIVEN** 已登录，文件为 `image/png`，策略为 `STRUCTURE_AWARE` 且参数合法
- **WHEN** 上传
- **THEN** 创建成功

### Requirement: ChunkStrategy 与参数校验

`chunkStrategy` MUST 为 `OVERLAPPING` 或 `STRUCTURE_AWARE`。参数 JSON MUST 仅含该种类允许的键，单位为 Unicode 字符，无额外绝对值上限。`OVERLAPPING` MUST 含 `chunkSize` > 0 且 `0 ≤ overlap < chunkSize`。`STRUCTURE_AWARE` MUST 含 `defaultChunkSize`、`maxChunkSize`、`minChunkSize`、`overlap`，且 `minChunkSize ≤ defaultChunkSize ≤ maxChunkSize`，前三者 > 0，`0 ≤ overlap < minChunkSize`。标题层级 MUST NOT 作为 JSON 字段。

#### Scenario: 合法重叠参数上传成功

- **GIVEN** 已登录，`chunkStrategy` 为 `OVERLAPPING` 且参数满足不等式
- **WHEN** 上传
- **THEN** 成功，详情返回所提交的种类与参数

#### Scenario: 种类与键不匹配被拒绝

- **GIVEN** 已登录
- **WHEN** 使用 `OVERLAPPING` 却提交结构分块键，或缺必填键
- **THEN** 系统拒绝，不产生 Document

#### Scenario: 不等式不成立被拒绝

- **GIVEN** 已登录
- **WHEN** `overlap >= chunkSize` 或结构分块 `minChunkSize > defaultChunkSize`
- **THEN** 系统拒绝，不产生 Document

### Requirement: 库内分页列表 Document

已登录的 Admin 与 Staff SHALL 可分页查询指定知识库下全部 Document。默认 pageSize MUST 为 20，上限 MUST 为 100；超过上限或小于 1 时系统 MUST 拒绝。系统 SHALL 支持按 OriginalFilename 模糊筛选，MUST NOT 提供按 DocumentStatus、ChunkStrategy 或 Enabled 筛选。默认 MUST 按更新时间倒序。列表项 MUST 含 OriginalFilename、mediaType、byteSize、status、enabled、chunkStrategy；MUST NOT 含 objectKey。已禁用 Document MUST 仍出现在列表中。

#### Scenario: 默认按更新时间倒序

- **GIVEN** 已登录，库内有多条 Document
- **WHEN** 请求列表且未指定 pageSize
- **THEN** 返回按更新时间倒序的结果，pageSize 默认为 20，且不含 objectKey

#### Scenario: OriginalFilename 模糊筛选

- **GIVEN** 已登录，存在文件名可被关键字匹配的 Document
- **WHEN** 请求列表并携带 OriginalFilename 模糊条件
- **THEN** 仅返回文件名匹配的记录

#### Scenario: pageSize 超上限拒绝

- **GIVEN** 已登录
- **WHEN** 请求列表且 pageSize 大于 100
- **THEN** 系统拒绝该请求

### Requirement: 查询 Document 详情

已登录的 Admin 与 Staff SHALL 可按知识库 id 与 Document id 查询详情。详情 MUST 包含策略 JSON、媒体类型与 `enabled` 等元数据，MUST NOT 包含 objectKey。目标不存在或不属于该知识库时系统 MUST 拒绝。

#### Scenario: 按 id 查询成功

- **GIVEN** 已登录且目标 Document 属于该知识库
- **WHEN** 查询详情
- **THEN** 返回元数据与策略参数，且响应不含 objectKey

#### Scenario: 文档不存在或不属于该库

- **GIVEN** 已登录
- **WHEN** 查询不存在的 id，或 id 属于其他知识库
- **THEN** 系统拒绝（文档不存在）

### Requirement: 修改 ChunkStrategy

已登录的 Admin 与 Staff SHALL 可修改状态为 `UPLOADED` 的 Document 的种类与参数。改种类时系统 MUST 整份替换参数 JSON。请求 MAY 携带 `originalFilename`：缺省 MUST 保留已存文件名；若提交则 MUST 只改主名，后缀 MUST 与已存值一致（大小写不敏感）。非法文件名或更换后缀 MUST 拒绝且原值不变。成功后 MUST 刷新更新时间。改名 MUST NOT 修改 objectKey 或重写对象。非法参数 MUST 拒绝且原值不变。

#### Scenario: 改种类并替换参数成功

- **GIVEN** 已登录，目标为 `UPLOADED`
- **WHEN** 将 `OVERLAPPING` 改为 `STRUCTURE_AWARE` 并提交合法新参数
- **THEN** 更新成功，旧参数被替换，更新时间变化

#### Scenario: 非法参数拒绝

- **GIVEN** 已登录，目标存在
- **WHEN** 提交不满足不等式或不匹配种类的参数
- **THEN** 系统拒绝，原策略与参数不变

#### Scenario: 改主名保留后缀成功

- **GIVEN** 已登录，目标文件名为 `handbook.pdf`
- **WHEN** 提交 `originalFilename` 为 `手册.pdf` 及合法策略
- **THEN** 文件名更新为主名已改、后缀仍为 `.pdf`，objectKey 与对象不变

#### Scenario: 更换后缀被拒绝

- **GIVEN** 已登录，目标文件名为 `handbook.pdf`
- **WHEN** 提交 `originalFilename` 为 `handbook.md`
- **THEN** 系统拒绝，原文件名与策略不变

### Requirement: 启用与禁用 Document

已登录的 Admin 与 Staff SHALL 可切换任意已存在 Document 的 `enabled`。该开关 MUST 与 DocumentStatus 解耦。禁用 MUST NOT 删除业务记录或 ObjectStorage 对象。禁用后该 Document MUST 仍可列表与详情查询，且 MUST 仍计入所属知识库 `documentCount`。成功后 MUST 刷新更新时间。缺 `enabled` 时系统 MUST 拒绝。

#### Scenario: 禁用成功

- **GIVEN** 已登录，目标 Document 存在且当前为启用
- **WHEN** 提交 `{ "enabled": false }`
- **THEN** 更新成功，详情 `enabled` 为 false，记录与对象仍在，该库 `documentCount` 不变

#### Scenario: 再次启用成功

- **GIVEN** 已登录，目标 Document 已禁用
- **WHEN** 提交 `{ "enabled": true }`
- **THEN** 更新成功，详情 `enabled` 为 true

### Requirement: 删除 Document 同步删除对象

已登录的 Admin 与 Staff SHALL 可物理删除 Document。系统 MUST 删除业务记录与 ObjectStorage 对象；对象删除失败时 MUST 整笔失败且 Document 仍可查询。删除成功后该库 `documentCount` MUST 减 1。

#### Scenario: 删除成功

- **GIVEN** Admin 或 Staff 已登录，目标存在且对象可删
- **WHEN** 删除该 Document
- **THEN** 详情不可再查，对象已删除，该库 `documentCount` 减 1

#### Scenario: 对象删除失败则保留记录

- **GIVEN** 已登录，目标存在，且对象删除失败
- **WHEN** 删除该 Document
- **THEN** 系统拒绝，Document 仍可查询

### Requirement: ObjectStorage 配置加载

进程启动时 MUST 加载部署级 ObjectStorage 配置。活跃类型/bucket 等结构不合法时 MUST 启动失败。存储密钥占位未解析或为空时 MUST NOT 阻止启动；此时上传或删除对象 MUST 失败。本阶段活跃类型 MUST 为 `s3`。

#### Scenario: 结构合法可启动

- **GIVEN** ObjectStorage YAML 结构合法，密钥可为空
- **WHEN** 启动进程
- **THEN** 启动成功

#### Scenario: 结构不合法启动失败

- **GIVEN** 缺 bucket 或活跃类型非法
- **WHEN** 启动进程
- **THEN** 启动失败

#### Scenario: 缺密钥时上传失败

- **GIVEN** 结构合法但存储密钥为空，进程已启动，调用方已登录
- **WHEN** 上传合法文件
- **THEN** 上传失败，不产生 Document
