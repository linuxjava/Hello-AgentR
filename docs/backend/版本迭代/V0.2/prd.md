# 产品需求文档（PRD）：Web 管理端知识库容器 API（V0.2）

**状态**：草稿 | **负责人**：待定（产品） | **最后更新**：2026-08-11

**版本**：V0.2  
**交付重心**：后端 API（供后续 `frontend-admin` 对接）；本 PRD 不涵盖管理端 UI 视觉与交互稿。  
**领域词汇**：[`docs/backend/context/knowledge/CONTEXT.md`](../../context/knowledge/CONTEXT.md)  
**身份与鉴权**：沿用 V0.1，见 [`docs/backend/context/admin-identity/CONTEXT.md`](../../context/admin-identity/CONTEXT.md)  
**相关决策**：[`docs/adr/0001-separate-admin-and-enduser-identity.md`](../../../adr/0001-separate-admin-and-enduser-identity.md)

---

## 1. 目的与范围

- **业务目标引用**：`BRD-OBJ-TBD`（尚无正式 BRD；本迭代对齐项目总目标：运营人员可在管理端创建并治理可检索知识的容器）
- **问题陈述**：管理端已能登录与治理账号，但没有 KnowledgeBase 这一业务容器，无法为后续文档摄入、检索隔离提供稳定锚点；若把文档、切块、索引与容器一次做完，删除语义、模型绑定与存储路径会缠在一起，难以单独验收。
- **假设**：
  - V0.2 仅服务 Web 管理端（`frontend-admin`），不服务用户 Web 端 / App 检索。
  - 调用方必须持有有效管理端 token；角色与会话规则沿用 V0.1（Admin / Staff）。
  - 领域术语以 Knowledge 词汇表为准：实体为 **KnowledgeBase**；**Document** 下一版本再实现 API，但「无 Document 才能删除」本版本写入契约。
  - EmbeddingModel 本阶段使用服务端模拟目录，不接真实模型注册中心。
- **范围内**：
  - KnowledgeBase 创建、分页列表、详情、修改 Name / Description、物理删除
  - Namespace（人填、不可变）与 EmbeddingModel（创建时绑定、不可变）
  - EmbeddingModel 只读模拟目录
  - Admin / Staff 能力矩阵与全局可见性
- **范围外**：
  - Document 上传、列表、删除
  - 解析、切块、向量写入、索引状态
  - 按 Namespace 筛选；修改 Namespace 或 EmbeddingModel
  - 恢复已删除的 KnowledgeBase
  - 按创建人或租户隔离可见性
  - 管理端知识库页面与视觉设计（可并行，但不作为本 PRD 验收对象）
  - EndUser 检索 / 对话 API

---

## 2. 目标与护栏

- **首要指标**：V0.2 后端发布后，已登录 Admin 或 Staff 可完成至少 1 次「拉模拟目录 → 创建 KnowledgeBase → 列表可见 → 改 Name/描述 → Admin 删除成功 → 原 Namespace 可再建」闭环（手工或自动化验收通过）。
- **次要指标**：
  - Staff 调用删除 100% 被明确拒绝（非静默成功）
  - 非法 Namespace / 重复 Name 或 Namespace / 目录外 EmbeddingModel 100% 被拒绝
- **护栏**：
  - 不得修改已创建 KnowledgeBase 的 Namespace 或 EmbeddingModel
  - 不得在「该库下存在 Document」时删除（本阶段无 Document，条件恒成立，契约仍须实现）
  - Staff 不得删除任何 KnowledgeBase
  - 列表/详情不得把 Namespace 误称为 Collection，也不得返回与摄入相关的假字段充数（如切片数、索引状态）

---

## 3. 角色、任务与用例

| 用例 ID | 角色 | 任务 / 目标 | 边界说明 |
| ------- | ---- | ----------- | -------- |
| UC-001 | AdminUser（Admin 或 Staff） | 创建空 KnowledgeBase，选定 Namespace 与 EmbeddingModel | 无文档上传 |
| UC-002 | AdminUser（Admin 或 Staff） | 分页查找并查看任意知识库详情 | 全局可见；仅 Name 模糊 |
| UC-003 | AdminUser（Admin 或 Staff） | 修改任意库的 Name / Description | 不可改 Namespace / EmbeddingModel |
| UC-004 | AdminUser（角色 Admin） | 删除空 KnowledgeBase，释放 Namespace | Staff 不能删；有 Document 则不能删 |
| UC-005 | AdminUser（Admin 或 Staff） | 获取可绑定的 EmbeddingModel 模拟名单 | 只读；创建校验同一份名单 |

---

## 4. 需求登记表

| 需求 ID | 需求描述 | 角色 | 优先级 | 负责人 | 状态 | 业务目标引用 |
| ------- | -------- | ---- | ------ | ------ | ---- | ------------ |
| REQ-001 | 创建 KnowledgeBase（Name、Description、Namespace、EmbeddingModel） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-002 | 分页列表（Name 模糊；默认 20、上限 100；创建时间倒序） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-003 | 按 id 查询详情 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-004 | 修改任意库的 Name / Description | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-005 | Admin 物理删除；无 Document 前提；成功后 Namespace 可复用 | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-006 | Staff 删除必须拒绝 | Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-007 | Namespace / Name 全局唯一与字段约束 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-008 | EmbeddingModel 只读模拟目录；创建只接受名单内标识；创建后不可改 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-009 | 未登录不得访问本域 API | 匿名 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-010 | 全局可见；createdBy 只审计 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |

---

## 5. 用户故事与验收标准

### 5.1 用户故事

| 故事 ID | 关联需求 | 用户故事 | INVEST 自检 | 状态 |
| ------- | -------- | -------- | ----------- | ---- |
| US-001 | REQ-001 / REQ-007 / REQ-008 | 作为已登录的 Admin 或 Staff，我想要填写 Name、Namespace、EmbeddingModel（及可选描述）创建知识库，以便后续版本往这个容器里放文档。 | 通过 | 草稿 |
| US-002 | REQ-002 / REQ-010 | 作为已登录的 Admin 或 Staff，我想要按名称模糊搜索并分页查看全部知识库，以便找到同事建的库。 | 通过 | 草稿 |
| US-003 | REQ-003 | 作为已登录的 Admin 或 Staff，我想要查看某个知识库的详情，以便确认 Namespace 与已绑定的 EmbeddingModel。 | 通过 | 草稿 |
| US-004 | REQ-004 / REQ-007 | 作为已登录的 Admin 或 Staff，我想要修改任意库的显示名或描述，以便纠正标题而不改隔离键。 | 通过 | 草稿 |
| US-005 | REQ-005 | 作为 Admin，我想要删除一个下面没有文档的知识库，以便释放 Namespace 供重建。 | 通过 | 草稿 |
| US-006 | REQ-006 | 作为 Staff，我想要删除被拒绝，以免误删团队知识库。 | 通过 | 草稿 |
| US-007 | REQ-008 | 作为已登录的 Admin 或 Staff，我想要拉取 EmbeddingModel 模拟目录，以便创建时只选合法标识。 | 通过 | 草稿 |
| US-008 | REQ-009 | 作为未登录访问者，我想要访问知识库 API 被拒绝，以便容器治理留在管理端会话内。 | 通过 | 草稿 |

### 5.2 验收标准

| 验收 ID | 关联故事 | 场景类型 | 前置条件（Given） | 动作（When） | 期望结果（Then） | 状态 |
| ------- | -------- | -------- | ----------------- | ------------ | ---------------- | ---- |
| AC-001 | US-001 | 正常 | Admin 或 Staff 已登录；Name/Namespace 未被占用；EmbeddingModel 在模拟目录中 | 提交合法创建请求 | 创建成功；列表与详情可见；Namespace 与 EmbeddingModel 与提交一致 | 草稿 |
| AC-002 | US-001 | 失败 | 已登录 | Name 为空或超 64，或 Namespace 不合 `[a-z0-9]`{2,32}，或描述超 200 | 创建失败；不产生记录 | 草稿 |
| AC-003 | US-001 | 失败 | 已登录；已存在相同 Name 或相同 Namespace | 再次创建 | 创建失败（冲突）；不覆盖已有库 | 草稿 |
| AC-004 | US-001 | 失败 | 已登录 | EmbeddingModel 不在模拟目录中 | 创建失败 | 草稿 |
| AC-005 | US-002 | 正常 | 已登录；库中有多条记录 | 默认分页列表 | 按创建时间倒序；默认 pageSize=20；含 Name、Namespace、EmbeddingModel 等；不含摄入假字段 | 草稿 |
| AC-006 | US-002 | 边界 | 已登录 | Name 模糊筛选，或 pageSize=100 | 筛选/分页生效；pageSize 超过 100 拒绝 | 草稿 |
| AC-007 | US-002 | 边界 | 已登录 | 尝试按 Namespace 作为筛选条件 | 本版本不提供该筛选；忽略或按契约视为不支持（SRS 须写明，不得变成模糊匹配） | 草稿 |
| AC-008 | US-003 | 正常 | 已登录；目标存在 | 按 id 查详情 | 返回 Name、Description、Namespace、EmbeddingModel、审计字段；Namespace/EmbeddingModel 只读语义明确 | 草稿 |
| AC-009 | US-003 | 失败 | 已登录 | 查询不存在的 id | 失败（不存在） | 草稿 |
| AC-010 | US-004 | 正常 | 已登录；新 Name 全局唯一 | 修改自己或他人库的 Name / Description | 成功；Namespace 与 EmbeddingModel 不变 | 草稿 |
| AC-011 | US-004 | 失败 | 已登录 | 将 Name 改为已存在的名称，或字段不合规 | 失败；原记录不变 | 草稿 |
| AC-012 | US-004 | 失败 | 已登录 | 请求体试图修改 Namespace 或 EmbeddingModel | 拒绝；两字段保持原值 | 草稿 |
| AC-013 | US-005 | 正常 | Admin 已登录；目标无 Document（本阶段皆无） | 物理删除 | 成功；详情不再可查；原 Namespace 可立即用于新库 | 草稿 |
| AC-014 | US-005 | 边界 | Admin 已登录；目标下存在 Document（下一版本可测；本阶段可用夹具模拟「非空」若实现已预留检查） | 尝试删除 | 拒绝；记录仍在 | 草稿 |
| AC-015 | US-006 | 失败 | Staff 已登录 | 尝试删除 | 拒绝（无权限）；记录仍在 | 草稿 |
| AC-016 | US-007 | 正常 | 已登录 | 请求 EmbeddingModel 目录 | 返回至少 2 个稳定标识；与创建校验为同一份名单 | 草稿 |
| AC-017 | US-008 | 失败 | 无 token 或 token 无效 | 调用任一知识库 API（含目录） | 鉴权失败（未登录） | 草稿 |

---

## 6. 功能行为说明（FRS 精简）

### 6.1 主流程

1. **选模型**：已登录 AdminUser 拉取 EmbeddingModel 模拟目录。
2. **建库**：填写 Name、Namespace、目录中的 EmbeddingModel、可选 Description → 创建成功。
3. **查找**：列表按创建时间倒序；可用 Name 模糊找到任意人创建的库；打开详情核对 Namespace 与模型。
4. **改文案**：任意 Admin / Staff 修改 Name 或 Description；隔离键与模型不变。
5. **删库（Admin）**：确认无 Document → 物理删除 → Namespace 可被新库使用。

### 6.2 异常 / 分支流程

- 未登录 → 拒绝（与 V0.1 未登录码一致）。
- Staff 删除 → 拒绝（无权限）。
- 校验失败（长度、字符集、目录外模型）→ 拒绝。
- Name 或 Namespace 冲突 → 拒绝。
- 试图修改 Namespace / EmbeddingModel → 拒绝。
- 目标不存在 → 拒绝。
- 目标下存在 Document → 拒绝删除（下一版本真正出现数据；本版本实现须保留该判断）。

### 6.3 输入 / 输出边界

**Name**：1–64；允许中文与常见标点；首尾空白忽略后再校验与判重；去空白后全局唯一（精确匹配，拉丁字母大小写敏感）；可改。

**Description**：选填；最长 200；可改为空。

**Namespace**：创建时由人填写；2–32；仅 `[a-z0-9]`；全局唯一；创建后不可改。

**EmbeddingModel**：创建时必选；必须是模拟目录中的标识；创建后不可改。

**列表**：默认 pageSize=20，上限 100，超出拒绝；仅 Name 模糊；不按 Namespace 筛；默认创建时间倒序。

**详情 / 列表可见字段**（至少）：id、Name、Description、Namespace、EmbeddingModel、createdBy、createdAt、updatedAt。本版本不返回文档数、切片数、索引状态。

**删除**：物理删除；成功后 Namespace 立刻可复用。

### 6.4 能力矩阵（产品规则）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 列表 / 详情 / 模拟目录 | 能 | 能 |
| 创建 | 能 | 能 |
| 改任意库的 Name / Description | 能 | 能 |
| 改 Namespace / EmbeddingModel | 不能 | 不能 |
| 删除（无 Document） | 能 | 不能 |

### 6.5 API 用例清单（本版本应提供）

| 序号 | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 分页列表 KnowledgeBase | Admin / Staff |
| 2 | 知识库详情 | Admin / Staff |
| 3 | 创建 KnowledgeBase | Admin / Staff |
| 4 | 改 Name / Description | Admin / Staff |
| 5 | 删除 KnowledgeBase | Admin |
| 6 | EmbeddingModel 模拟目录 | Admin / Staff |

URL 路径与错误码表交 SRS / OpenSpec design，不在本 PRD 发明。

---

## 7. 非功能产品约束

- **性能**：本版本不设严格 SLA；列表与创建应在常规内网环境下可用于手工验收（P95 交 SRS/NFR）。
- **安全 / 隐私**：
  - 全部接口需管理端登录（V0.1 会话）
  - 写删除按角色鉴权，不可只靠前端隐藏
  - Namespace 用于未来存储/检索隔离，本版本只保证唯一与不可变
- **无障碍 / 可用性**：本 PRD 为后端 API；UI 无障碍不在范围。
- **平台支持**：后端 HTTP API；首要消费方为 Web 管理端。

---

## 8. 分析与遥测

- **事件（建议，V0.2 可不做产品埋点仪表盘）**：
  - `knowledge_base_created` / `knowledge_base_updated` / `knowledge_base_deleted`（可含 id，勿把描述全文当日志噪音）
- **看板 / 告警**：待定；至少保留应用日志：创建冲突、非法模型标识、Staff 删库被拒。

---

## 9. 风险与决策

| 风险 / 决策 | 类型 | 负责人 | 状态 | 说明 |
| ----------- | ---- | ------ | ---- | ---- |
| 本版本只做容器、不做 Document | 决策 | 产品 | 已接受 | grilling；摄入下一版本 |
| Namespace 人填且不可变，作存储/检索隔离键 | 决策 | 产品 | 已接受 | 不用 Name、不用内部 id 当目录键 |
| EmbeddingModel 创建时绑定且不可改 | 决策 | 产品 | 已接受 | 选错只能删库重建 |
| 模拟目录由服务端提供 | 决策 | 产品 | 已接受 | 前后端同一份名单 |
| 全局可见；任意 Staff 可改 Name/描述 | 决策 | 产品 | 已接受 | 团队资产；删除收口 Admin |
| 物理删除且 Namespace 立即释放 | 决策 | 产品 | 已接受 | 本阶段无存储残留；有 Document 后须先清空再删 |
| 无 Document 才能删（契约先落地） | 决策 | 产品 | 已接受 | 本阶段恒成立 |
| pageSize 超过 100 拒绝 | 决策 | 产品 | 已接受 | 与账号列表上限一致，本域明确为拒绝而非截断 |

---

## 10. 依赖与发布

- **依赖**：
  - 后端 V0.1 管理端登录与 Admin / Staff 角色
  - Knowledge 词汇表 `docs/backend/context/knowledge/CONTEXT.md`
  - 后续：`frontend-admin` 对接（非本 PRD 完成定义）
- **发布策略**：随 backend V0.2 发布；无特性开关要求（待定）。
- **运维 / 支持就绪**：说明模拟 EmbeddingModel 目录非生产模型；提醒 Namespace 创建后不可改。
- **成功标准**：见第 2 节首要指标。

---

## 11. 追溯链接

- **领域词汇表（Knowledge）**：`docs/backend/context/knowledge/CONTEXT.md`
- **领域词汇表（Admin Identity）**：`docs/backend/context/admin-identity/CONTEXT.md`
- **词汇表索引**：`docs/backend/CONTEXT.md`
- **架构决策**：`docs/adr/0001-separate-admin-and-enduser-identity.md`
- **上下文地图**：`CONTEXT-MAP.md`
- **软件需求规格（SRS）**：待定（OpenSpec specs / design）
- **实现计划**：待定（OpenSpec change / tasks，前缀 `backend-`）
- **验证证据**：待定（接口测试 / 验收记录）

---

## 12. 变更记录

| 日期 | 作者 | 变更说明 |
| ---- | ---- | -------- |
| 2026-08-11 | grilling → PRD | 首稿：基于 Knowledge grilling 结论生成 V0.2 PRD |

---

## 13. 开放问题

- [ ] 产品 / 工程 / 测试负责人正式命名与 RACI
- [ ] 是否需要独立 BRD 编号替换 `BRD-OBJ-TBD`
- [ ] 知识库 API 的 URL 路径与错误码表（交 SRS / OpenSpec design）
- [ ] 模拟目录中的具体 EmbeddingModel 标识文案（实现时可写死至少 2 个稳定 id）
- [ ] V0.2 是否必须交付自动化测试作为发布门槛，还是允许手工验收
- [ ] AC-014「有 Document 时拒删」本阶段用夹具预留还是只保留接口分支、等下一版本再测
