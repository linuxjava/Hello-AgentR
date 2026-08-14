# 产品需求文档（PRD）：KnowledgeBase 下 Document 上传与元数据治理（V0.4）

**状态**：草稿 | **负责人**：待定（产品） | **最后更新**：2026-08-13

**版本**：V0.4  
**交付重心**：后端 API（Document 摄入元数据、对象存储写入、策略持久化）；不涉及 Web 管理后台开发，不执行分块。  
**领域词汇**：[`docs/backend/context/knowledge/CONTEXT.md`](../../context/knowledge/CONTEXT.md)  
**身份与鉴权**：沿用 V0.1，见 [`docs/backend/context/admin-identity/CONTEXT.md`](../../context/admin-identity/CONTEXT.md)  
**相关决策**：[`docs/adr/0003-pluggable-object-storage.md`](../../../adr/0003-pluggable-object-storage.md)

---

## 1. 目的与范围

- **业务目标引用**：`BRD-OBJ-TBD`（尚无正式 BRD；本迭代对齐：运营可将源文件纳入已有 KnowledgeBase，并锁定后续如何切块，但不在本版本切块）
- **问题陈述**：V0.2/V0.3 已能治理知识库容器与向量模型目录，但库内没有 Document。删除知识库的「无文档才能删」契约无法被真实数据触发；后续分块/索引缺少可引用的内容单元与对象存储中的源文件。
- **假设**：
  - 本迭代仅服务 Web 管理端后端 API，不服务用户 Web 端 / App。
  - 调用方必须持有有效管理端 token；角色沿用 V0.1（Admin / Staff）。
  - 领域术语以 Knowledge 词汇表为准；本版本**不**实现「开始分块」。
  - 活跃 ObjectStorage 为首版 `s3`；实现须可扩展 `oss`，但本版本不把 OSS 当活跃后端来验收。
- **范围内**：
  - 向指定 KnowledgeBase **单文件**上传本地文件，创建 Document（状态 `UPLOADED`）
  - 上传时必选 ChunkStrategy 及对应 ChunkStrategyParams（JSON）
  - 库内 Document 分页列表、详情、改策略（仅 `UPLOADED`）、启用/禁用、删除（同步删对象）
  - KnowledgeBase 列表/详情返回 `documentCount`；有 Document 时 Admin 删除知识库必须被拒绝
  - 部署级 ObjectStorage YAML（类型、bucket 等；密钥占位）；Tika 探测 AllowedMediaType
- **范围外**：
  - 开始分块、解析、Chunk 实体、向量写入、索引状态
  - URL 地址上传（仅预留 `DocumentSourceType=URL`）
  - 预签名直传/下载；Document 源文件下载或预览 API
  - 以 OSS 作为本版本活跃存储后端
  - 修改与 OriginalFilename 分离的显示名/备注
  - Web 管理端「进入知识库」与 Document UI
  - EndUser 检索/对话摄入入口

---

## 2. 目标与护栏

- **首要指标**：已登录 Admin 或 Staff 可完成至少 1 次「选定知识库 → 上传一份合法本地文件并提交策略 → 列表/详情可见 → 修改策略 → 删除 Document 后 `documentCount` 归零 → Admin 可删该空库」闭环（手工或自动化验收通过）。
- **次要指标**：
  - 0 字节、超限、白名单外 MIME、缺策略/参数不合法 100% 拒绝且不留下孤儿对象或半截 Document
  - Staff 删除 KnowledgeBase 仍 100% 拒绝；Staff **可以**删除 Document
  - 库下仍有 Document 时删除 KnowledgeBase 100% 拒绝
- **护栏**：
  - 不得在本版本执行切块或返回 Chunk
  - 列表/详情不得返回 objectKey、存储密钥或下载 URL
  - 不得按文档选择 S3/OSS；不得提供管理 API 增删改 ObjectStorage
  - 不得把客户端 Content-Type 当作媒体类型权威
  - 上传成功必须「对象已在存储中且 Document 记录已创建」；缺一不可

---

## 3. 关键决策（已确认）

1. **交付面**：仅后端 API；版本 V0.4；管理端 UI 另开。  
2. **上传与分块分离**：上传创建 Document；开始分块是后续独立操作。  
3. **策略时机**：上传时必须选定 ChunkStrategy 并提交参数；不是开始分块时才选。  
4. **策略可变性**：状态为 `UPLOADED` 时可改种类与参数（改种类则整份 JSON 替换）；离开 `UPLOADED` 后冻结（本版本不迁状态，故始终可改）。  
5. **状态**：本版本创建后固定 `UPLOADED`，预留字段但不迁到 `CHUNKING` / `CHUNKED` / `FAILED`。  
6. **用例套餐**：上传、库内分页列表、详情、改策略、启用/禁用、删除 Document。
7. **角色**：Admin 与 Staff 对 Document 的上传/列表/详情/改策略/启用禁用/删除权限相同；删 KnowledgeBase 仍仅 Admin。
8. **存储**：部署级单一活跃 ObjectStorage；YAML 配置；首版 `s3`，适配器可扩 `oss`。见 [ADR-0003](../../../adr/0003-pluggable-object-storage.md)。  
9. **来源**：`DocumentSourceType` 本版本仅 `LOCAL_FILE`，预留 `URL`。  
10. **重复**：同一 KnowledgeBase 内允许同名多次上传，每次都是新 Document；不以内容哈希去重。  
11. **删除对象**：删 Document 时业务记录与对象**同步删除**；对象删失败则整笔失败。  
12. **上传原子性**：先写对象，再写 Document；库写失败须尝试回滚对象。  
13. **单文件请求**：一次请求一份文件；批量由调用方多次调用。  
14. **无下载**：本版本不提供源文件下载/预览。  
15. **MIME**：Apache Tika 探测（须带字节 + OriginalFilename）；白名单见词汇表。  
16. **大小**：单文件与整次请求上限由部署配置声明（推荐初始：单文件 50MB、整次请求 100MB）；领域不写死。  
17. **空文件**：0 字节拒绝。  
18. **结构分块**：不限媒体类型；图片/表格也可选 `STRUCTURE_AWARE`。Markdown 结构剖面（H1–H6、围栏代码块、原子图/链）已定义；其它格式结构单元留到开始分块版本。  
19. **尺寸单位**：Unicode 字符；无额外绝对值上限，只校验相对不等式。  
20. **objectKey**：系统生成，含 Namespace；调用方不可传；API 不返回。  
21. **启动**：ObjectStorage 结构不合法 → 启动失败；存储密钥为空 → 不挡启动，上传/删对象时失败。  
22. **documentCount**：KnowledgeBase 列表与详情均返回该库 Document 条数（含已禁用）。
23. **Enabled**：上传默认启用；Admin/Staff 可切换；禁用不删记录与对象，列表仍可见，仍占用知识库。

---

## 4. 角色、任务与用例

| 用例 ID | 角色 | 任务 / 目标 | 边界说明 |
| ------- | ---- | ----------- | -------- |
| UC-401 | AdminUser（Admin 或 Staff） | 向某 KnowledgeBase 上传一份本地文件并指定分块策略 | 单文件；不切块 |
| UC-402 | AdminUser（Admin 或 Staff） | 分页查看某库下 Document，按原始文件名模糊、可选按状态与启用查找 | 默认更新时间倒序 |
| UC-403 | AdminUser（Admin 或 Staff） | 查看 Document 元数据详情 | 无 objectKey、无下载 |
| UC-404 | AdminUser（Admin 或 Staff） | 在 `UPLOADED` 时改 ChunkStrategy 与参数 | 改种类则整份参数替换 |
| UC-405 | AdminUser（Admin 或 Staff） | 删除 Document（含存储对象） | 与删库权限不同 |
| UC-408 | AdminUser（Admin 或 Staff） | 启用或禁用 Document | 不删对象；仍计入 documentCount |
| UC-406 | AdminUser（角色 Admin） | 仅当 `documentCount=0` 时删除 KnowledgeBase | 有文档则拒绝 |
| UC-407 | 运维 | 通过 YAML 配置 S3 对象存储并重启生效 | 密钥占位；不热加载 |

既有 KnowledgeBase 创建/改名/目录等用例沿用 V0.2 / V0.3，本表不重复，但列表/详情须增加 `documentCount`。

---

## 5. 需求登记表

| 需求 ID | 需求描述 | 角色 | 优先级 | 负责人 | 状态 | 业务目标引用 |
| ------- | -------- | ---- | ------ | ------ | ---- | ------------ |
| REQ-401 | 单文件本地上传：Tika 白名单、非空、大小受部署配置限制；必填 ChunkStrategy + 合法 Params；`sourceType=LOCAL_FILE`；先写 ObjectStorage 再创建 Document，状态 `UPLOADED` | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-402 | 库内 Document 分页列表（默认 20、上限 100；OriginalFilename 模糊；可选 status / enabled 精确；更新时间倒序） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-403 | 按 id 查询 Document 详情（元数据，不含 objectKey） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-404 | 改 ChunkStrategy 与 Params（仅 `UPLOADED`；改种类整份 JSON 替换）；可选改 OriginalFilename 主名（后缀锁定，不改 objectKey） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-405 | 删除 Document：记录与对象同步删；对象失败则整笔失败 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-412 | 启用/禁用 Document：`enabled` 与 status 解耦；上传默认 true；禁用不删对象且仍计入 documentCount | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-406 | KnowledgeBase 列表/详情返回 `documentCount` | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-407 | 删除 KnowledgeBase：仅 Admin；`documentCount>0` 必须拒绝 | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-408 | ObjectStorage YAML：活跃类型 `s3`、可扩展；密钥占位；结构非法拒启动；缺密钥不挡启动 | 运维 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-409 | objectKey 系统生成且含 Namespace；调用方不可传；API 不暴露 | 系统 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-410 | 未登录不得访问 Document 与本版本新增的知识库计数字段所在写接口 | 匿名 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-411 | 全局可见；Document 的 `createdBy` 只审计 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |

---

## 6. 用户故事与验收标准

### 6.1 用户故事

| 故事 ID | 关联需求 | 用户故事 | INVEST 自检 | 状态 |
| ------- | -------- | -------- | ----------- | ---- |
| US-401 | REQ-401 / REQ-409 | 作为已登录的 Admin 或 Staff，我想要把一份本地文件上传进指定知识库并选定分块策略与参数，以便后续版本按该约定切块。 | 通过 | 草稿 |
| US-402 | REQ-402 / REQ-411 | 作为已登录的 Admin 或 Staff，我想要按原始文件名、状态和是否启用查找某库下的文档列表，以便找到最近更新的文件。 | 通过 | 草稿 |
| US-403 | REQ-403 | 作为已登录的 Admin 或 Staff，我想要查看某文档的媒体类型、大小、状态与策略，以便确认上传是否正确。 | 通过 | 草稿 |
| US-404 | REQ-404 | 作为已登录的 Admin 或 Staff，我想要在尚未分块前改策略或参数，以便纠正上传时选错的切法。 | 通过 | 草稿 |
| US-405 | REQ-405 | 作为已登录的 Admin 或 Staff，我想要删掉传错的文档及其源文件，以便空库后可以由 Admin 删库。 | 通过 | 草稿 |
| US-409 | REQ-412 | 作为已登录的 Admin 或 Staff，我想要临时禁用某份文档而不删除它，以便后续检索版本可以跳过它。 | 通过 | 草稿 |
| US-406 | REQ-406 / REQ-407 | 作为 Admin，我想要在列表上看到文档数量，并在库非空时删库失败，以免误删仍有文件的容器。 | 通过 | 草稿 |
| US-407 | REQ-408 | 作为运维，我想要通过 YAML 配置 S3（密钥走环境变量），以便换环境或将来换 OSS 时不改 Document 模型。 | 通过 | 草稿 |
| US-408 | REQ-410 | 作为未登录访问者，我想要调用 Document API 被拒绝，以便摄入留在管理端会话内。 | 通过 | 草稿 |

### 6.2 验收标准

| 验收 ID | 关联故事 | 场景类型 | 前置条件（Given） | 动作（When） | 期望结果（Then） | 状态 |
| ------- | -------- | -------- | ----------------- | ------------ | ---------------- | ---- |
| AC-401 | US-401 | 正常 | Admin 或 Staff 已登录；目标知识库存在；文件非空、未超限、Tika 类型在白名单；策略与参数合法 | 单文件上传 | 成功；Document 状态 `UPLOADED`；`sourceType=LOCAL_FILE`；列表可见；`documentCount` +1；对象已写入存储 | 草稿 |
| AC-402 | US-401 | 正常 | 同上；库中已有同名文件 | 再传一份相同 OriginalFilename | 成功；两条 Document；不覆盖旧记录 | 草稿 |
| AC-403 | US-401 | 失败 | 已登录 | 上传 0 字节文件 | 拒绝；无 Document；存储无对应对象 | 草稿 |
| AC-404 | US-401 | 失败 | 已登录 | 上传超过部署配置的单文件上限，或不在 MIME 白名单 | 拒绝；无 Document；无孤儿对象 | 草稿 |
| AC-405 | US-401 | 失败 | 已登录 | 缺 ChunkStrategy，或 Params 缺键/不等式不成立/种类与键不匹配 | 拒绝；无 Document | 草稿 |
| AC-406 | US-401 | 失败 | 已登录 | 一次请求多个文件，或试图传 `sourceType=URL` | 拒绝（本版本仅单文件 `LOCAL_FILE`） | 草稿 |
| AC-407 | US-401 | 失败 | 已登录；知识库 id 不存在 | 上传 | 拒绝；不写存储（或写后须回滚，不得留下可查询 Document） | 草稿 |
| AC-408 | US-401 | 边界 | 已登录；对象写入成功但随后创建记录失败 | 上传 | API 失败；须尝试删除已写对象；列表无该 Document | 草稿 |
| AC-409 | US-401 | 正常 | 已登录；文件为 PNG，策略为 `STRUCTURE_AWARE` 且参数合法 | 上传 | 成功（本版本不因 MIME 限制策略） | 草稿 |
| AC-410 | US-401 | 正常 | 已登录；`.md` 且客户端 Content-Type 为 `application/octet-stream` | 上传（带 OriginalFilename） | Tika 结合文件名识别为 markdown 类则成功 | 草稿 |
| AC-411 | US-402 | 正常 | 已登录；库内多条 Document | 默认分页列表 | 按更新时间倒序；默认 20；含 OriginalFilename、媒体类型、大小、策略、状态等；不含 objectKey | 草稿 |
| AC-412 | US-402 | 边界 | 已登录 | OriginalFilename 模糊，或 `status` / `enabled` 精确筛选，或 pageSize=100 | 筛选/分页生效；超过 100 拒绝；非法 status 枚举拒绝 | 草稿 |
| AC-413 | US-403 | 正常 | 已登录；目标存在 | 查详情 | 返回元数据与策略 JSON；不返回 objectKey | 草稿 |
| AC-414 | US-403 | 失败 | 已登录 | 查询不存在的 Document，或 Document 不属于该知识库 | 失败（不存在） | 草稿 |
| AC-415 | US-404 | 正常 | 已登录；状态 `UPLOADED` | 将 `OVERLAPPING` 改为 `STRUCTURE_AWARE` 并提交新参数 | 成功；旧参数被整份替换；`updatedAt` 更新；列表顺序反映更新 | 草稿 |
| AC-416 | US-404 | 失败 | 已登录 | 用 `OVERLAPPING` 种类提交结构分块的键，或 overlap ≥ chunkSize | 拒绝；原策略不变 | 草稿 |
| AC-428 | US-404 | 正常 | 已登录；文件名为 `handbook.pdf` | 改策略请求带 `originalFilename=手册.pdf` | 成功；主名已改、后缀仍为 `.pdf`；objectKey 与对象内容不变 | 草稿 |
| AC-429 | US-404 | 失败 | 已登录；文件名为 `handbook.pdf` | 提交 `originalFilename=handbook.md` 或主名为空/含路径符 | 拒绝（后缀锁定或文件名不合法）；原文件名与策略不变 | 草稿 |
| AC-417 | US-405 | 正常 | Admin 或 Staff 已登录 | 删除 Document | 记录不可再查；对象已从存储删除；该库 `documentCount` -1 | 草稿 |
| AC-418 | US-405 | 失败 | 已登录；模拟对象删除失败 | 删除 Document | 整笔失败；Document 仍可查 | 草稿 |
| AC-419 | US-406 | 正常 | Admin 已登录；`documentCount=0` | 删除 KnowledgeBase | 成功；Namespace 可复用 | 草稿 |
| AC-420 | US-406 | 失败 | Admin 已登录；`documentCount≥1` | 删除 KnowledgeBase | 拒绝；库与文档仍在 | 草稿 |
| AC-421 | US-406 | 失败 | Staff 已登录；空库 | 删除 KnowledgeBase | 拒绝（无权限） | 草稿 |
| AC-422 | US-407 | 正常 | ObjectStorage YAML 结构合法；密钥可为空 | 启动进程 | 启动成功 | 草稿 |
| AC-423 | US-407 | 失败 | 缺 bucket 或活跃类型非法 | 启动进程 | 启动失败 | 草稿 |
| AC-424 | US-407 | 边界 | 结构合法但存储密钥为空 | 启动后尝试上传 | 启动成功；上传失败（存储侧） | 草稿 |
| AC-425 | US-408 | 失败 | 无 token 或 token 无效 | 调用任一 Document API | 鉴权失败（未登录） | 草稿 |
| AC-426 | US-409 | 正常 | 已登录；目标已启用 | 提交 `enabled=false` | 成功；详情为禁用；对象仍在；`documentCount` 不变；列表仍可见 | 草稿 |
| AC-427 | US-409 | 正常 | 已登录；目标已禁用 | 提交 `enabled=true` | 成功；详情为启用 | 草稿 |

---

## 7. 功能行为说明（FRS 精简）

### 7.1 主流程

1. **选库**：已登录 AdminUser 确认目标 KnowledgeBase 存在。  
2. **上传**：提交一份本地文件 + ChunkStrategy + ChunkStrategyParams → 拒绝空文件 → 校验大小 → Tika 探测 MIME → 写入 ObjectStorage（系统生成含 Namespace 的 objectKey）→ 创建 Document（`UPLOADED`，默认启用）。  
3. **查找**：在该库下按更新时间倒序列表；可用 OriginalFilename 模糊，以及可选 status / enabled 精确筛选（AND）；缺省不过滤启用，已禁用仍列出。  
4. **改策略**：仅元数据更新；可同时改 OriginalFilename 主名（后缀锁定）；不改对象内容与 objectKey。  
5. **启用/禁用**：仅改 `enabled`；不改对象、不改 DocumentStatus。  
6. **删文档**：同步删记录与对象；`documentCount` 降为 0 后 Admin 可删库。

### 7.2 异常 / 分支流程

- 未登录 → 拒绝（与 V0.1 未登录码一致）。  
- 知识库不存在 / Document 不存在或不属于该库 → 拒绝。  
- MIME 不在白名单、超限、0 字节、策略参数不合法 → 拒绝。  
- 存储密钥缺失或存储写入失败 → 上传失败，无 Document。  
- 对象已写、库写入失败 → 尝试删对象，API 失败。  
- 删对象失败 → 删 Document 失败，记录保留。  
- 库下仍有 Document（含已禁用）→ 删 KnowledgeBase 失败。  
- Staff 删 KnowledgeBase → 拒绝。

### 7.3 ChunkStrategyParams

**单位**：Unicode 字符。无额外绝对值上限。

**`OVERLAPPING`**（仅允许下列键）：

| 键 | 约束 |
| --- | --- |
| `chunkSize` | 整数，`> 0` |
| `overlap` | 整数，`0 ≤ overlap < chunkSize` |

**`STRUCTURE_AWARE`**（仅允许下列键）：

| 键 | 约束 |
| --- | --- |
| `defaultChunkSize` | 整数，`> 0` |
| `maxChunkSize` | 整数，`> 0` |
| `minChunkSize` | 整数，`> 0` |
| `overlap` | 整数，`0 ≤ overlap < minChunkSize` |

须满足 `minChunkSize ≤ defaultChunkSize ≤ maxChunkSize`。  
标题层级不进 JSON：各格式用自身标题/大纲；Markdown 为 ATX H1–H6，且围栏代码块、原子图片、原子链接不拆（执行留给后续版本）。

改种类时整份 JSON 替换，禁止混用另一类的键。

### 7.4 AllowedMediaType（Tika 探测结果，规范化后）

`text/plain`；`text/markdown`（含 `text/x-markdown`、`text/x-web-markdown`）；`application/pdf`；`application/msword`；`application/vnd.openxmlformats-officedocument.wordprocessingml.document`；`application/vnd.ms-powerpoint`；`application/vnd.openxmlformats-officedocument.presentationml.presentation`；`application/vnd.ms-excel`；`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`；`image/png`；`image/jpeg`；`image/svg+xml`。

探测必须使用文件字节与 OriginalFilename。Office 容器格式依赖 Tika 容器探测。

### 7.5 输入 / 输出边界

**上传**：单文件；`sourceType` 固定 `LOCAL_FILE`；调用方不可传 objectKey。  
**OriginalFilename**：来自本地文件名；非唯一；`UPLOADED` 时可随改策略提交完整文件名（只改主名，后缀锁定）；不改 objectKey。  
**Document 列表**：默认 pageSize=20，上限 100，超出拒绝；OriginalFilename 模糊；可选 status / enabled 精确筛选（缺省不过滤）；不做 strategy 筛选；默认更新时间倒序；缺省列表中已禁用仍列出。  
**Document 可见字段**（至少）：id、所属知识库 id、OriginalFilename、媒体类型、字节大小、DocumentStatus、Enabled、ChunkStrategy、ChunkStrategyParams、sourceType、createdBy、createdAt、updatedAt。不返回 objectKey。  
**KnowledgeBase 列表/详情**：在既有字段上增加 `documentCount`（含已禁用 Document）。  
**启用/禁用 Document**：切换 `enabled`；不删记录与对象。  
**删除 Document**：物理删除记录与对象。  
**删除 KnowledgeBase**：仅当 `documentCount=0`。

### 7.6 能力矩阵（产品规则）

| 动作 | Admin | Staff |
| --- | --- | --- |
| KnowledgeBase 列表/详情（含 documentCount） | 能 | 能 |
| 删除 KnowledgeBase（无 Document） | 能 | 不能 |
| 上传 / 列表 / 详情 Document | 能 | 能 |
| 改 ChunkStrategy | 能 | 能 |
| 启用 / 禁用 Document | 能 | 能 |
| 删除 Document | 能 | 能 |

**可见性**：任何已登录 AdminUser 可见全部库及其下 Document。

### 7.7 API 用例清单（本版本应提供）

| 序号 | 用例 | 谁可调用 |
| --- | --- | --- |
| 7 | 上传 Document（本地文件 + ChunkStrategy + Params） | Admin / Staff |
| 8 | 库内分页列表 Document | Admin / Staff |
| 9 | Document 详情 | Admin / Staff |
| 10 | 改 Document 的 ChunkStrategy | Admin / Staff |
| 11 | 启用 / 禁用 Document | Admin / Staff |
| 12 | 删除 Document | Admin / Staff |

既有 1–6（知识库容器与 EmbeddingModel 目录）沿用 V0.3。  
URL 路径与错误码表交 SRS / OpenSpec design，不在本 PRD 发明。

### 7.8 ObjectStorage 配置（产品级）

部署 YAML 须能声明：活跃类型（本版本 `s3`）、bucket、region、endpoint（如需要）、密钥的环境变量占位。配置键名交 SRS。变更仅重启生效。管理 API 不回传密钥，不提供存储 CRUD。

文件大小上限由部署配置声明。grilling 时的推荐初始值：单文件 50MB、整次请求 100MB（实现上可落在 servlet multipart 配置，但不作为领域常量）。

---

## 8. 非功能产品约束

- **性能**：本版本不设严格 SLA；单文件上传应在常规内网环境下可用于手工验收（P95 交 SRS/NFR）。不要求分片/断点续传。  
- **安全 / 隐私**：
  - 全部接口需管理端登录
  - 不以客户端 MIME 为权威；不暴露 objectKey 与存储密钥
  - YAML 禁止明文密钥
  - objectKey 含 Namespace，避免跨库路径混用
- **无障碍 / 可用性**：本 PRD 为后端 API；UI 不在范围。  
- **平台支持**：后端 HTTP API；首要消费方为后续 `frontend-admin`。  
- **可运维性**：存储结构错误启动期暴露；缺密钥不阻断登录与知识库只读治理。

---

## 9. 分析与遥测

- **事件（建议，V0.4 可不做产品埋点仪表盘）**：
  - `document_uploaded` / `document_strategy_updated` / `document_deleted`（可含知识库 id、Document id、媒体类型、策略种类；勿记录文件正文）
- **看板 / 告警**：待定；至少保留应用日志：MIME 拒绝、存储写入/删除失败、有文档时删库被拒、对象回滚失败（孤儿风险）。

---

## 10. 风险与决策

| 风险 / 决策 | 类型 | 负责人 | 状态 | 说明 |
| ----------- | ---- | ------ | ---- | ---- |
| 本版本不执行分块 | 决策 | 产品 | 已接受 | 上传与开始分块分离 |
| 策略+参数在上传时持久化 | 决策 | 产品 | 已接受 | JSON 按种类校验 |
| 可插拔 ObjectStorage，首版 s3 | 决策 | 产品 | 已接受 | ADR-0003 |
| Tika 为 MIME 权威 | 决策 | 产品 | 已接受 | 须传 OriginalFilename |
| 同步删对象 | 决策 | 产品 | 已接受 | 无补偿任务 |
| 无下载 API | 决策 | 产品 | 已接受 | 仅元数据 |
| 同库允许同名 Document | 决策 | 产品 | 已接受 | 文件名不是身份 |
| STRUCTURE_AWARE 不限 MIME | 决策 | 产品 | 已接受 | 无结构文件切块时再定义 |
| Staff 可删 Document、不可删库 | 决策 | 产品 | 已接受 | 内容运维 vs 容器破坏 |
| 管理端 UI 不在本版本验收 | 决策 | 产品 | 已接受 | 与 V0.3 节奏一致 |

---

## 11. 依赖与发布

- **依赖**：
  - 后端 V0.1 管理端登录与 Admin / Staff
  - 后端 V0.2 / V0.3 KnowledgeBase 与 EmbeddingModel 目录
  - Knowledge 词汇表；ADR-0003
  - 部署侧可用的 S3 兼容 ObjectStorage（本地可用 MinIO 等，具体交工程）
- **发布策略**：随 backend V0.4 发布；配置改动需重启；无特性开关要求（待定）。  
- **运维 / 支持就绪**：说明本版本不切块、无下载；提醒有文档不能删库；存储密钥走环境变量。  
- **成功标准**：见第 2 节首要指标。

---

## 12. 追溯链接

- **领域词汇表（Knowledge）**：`docs/backend/context/knowledge/CONTEXT.md`
- **领域词汇表（Admin Identity）**：`docs/backend/context/admin-identity/CONTEXT.md`
- **词汇表索引**：`docs/backend/CONTEXT.md`
- **架构决策**：`docs/adr/0003-pluggable-object-storage.md`
- **上下文地图**：`CONTEXT-MAP.md`
- **前序 PRD**：`docs/backend/版本迭代/V0.2/prd.md`、`docs/backend/版本迭代/V0.3/prd.md`
- **软件需求规格（SRS）**：待定（OpenSpec specs / design）
- **实现计划**：待定（OpenSpec change / tasks，前缀 `backend-`）
- **验证证据**：待定（接口测试 / 验收记录）

---

## 13. 变更记录

| 日期 | 作者 | 变更说明 |
| ---- | ---- | -------- |
| 2026-08-13 | grilling → PRD | 首稿：Document 上传/列表/改策略/删除 + 可插拔 S3 ObjectStorage；不含分块与管理端 UI |
| 2026-08-13 | 增量 | 增加 Document `enabled`：上传默认启用；可切换；禁用不删对象且仍计入 documentCount |
| 2026-08-14 | 增量 | 改策略可改 OriginalFilename 主名；后缀锁定；不改 objectKey |
| 2026-08-14 | 增量 | Document 列表可选 `status` / `enabled` 精确筛选；缺省不过滤；不做 strategy 筛选 |

---

## 14. 开放问题

- [ ] 产品 / 工程 / 测试负责人正式命名与 RACI
- [ ] 是否需要独立 BRD 编号替换 `BRD-OBJ-TBD`
- [ ] Document API 的 URL 路径与错误码表（交 SRS / OpenSpec design）
- [ ] ObjectStorage YAML 的配置键名与 S3 字段全集（交 SRS）
- [ ] 部署配置中单文件/请求大小的正式默认值（grilling 推荐 50MB / 100MB）
- [ ] V0.4 是否必须交付自动化测试作为发布门槛
- [ ] 对象回滚失败时的运维处置（日志告警即可，还是后续补偿任务）
