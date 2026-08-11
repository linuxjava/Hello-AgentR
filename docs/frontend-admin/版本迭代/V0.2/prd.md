# 产品需求文档（PRD）：Web 管理端知识库容器治理（V0.2）

**状态**：草稿 | **负责人**：待定（产品） | **最后更新**：2026-08-11

**版本**：V0.2  
**交付重心**：`frontend-admin` 功能闭环（知识库列表、创建 / 改文案 / 删除模态）；**视觉定稿不在本阶段**（后续 Pencil）。  
**领域词汇**：屏态见 [`docs/frontend-admin/CONTEXT.md`](../../CONTEXT.md)；实体见 [`docs/backend/context/knowledge/CONTEXT.md`](../../../backend/context/knowledge/CONTEXT.md)  
**后端契约**：[`docs/backend/api.md`](../../../backend/api.md)（§3 知识库与模拟目录）  
**后端 PRD**：[`docs/backend/版本迭代/V0.2/prd.md`](../../../backend/版本迭代/V0.2/prd.md)  
**相关决策**：  
- [`docs/adr/0001-separate-admin-and-enduser-identity.md`](../../../adr/0001-separate-admin-and-enduser-identity.md)  
- [`docs/adr/0002-admin-console-token-in-localstorage.md`](../../../adr/0002-admin-console-token-in-localstorage.md)

---

## 1. 目的与范围

- **业务目标引用**：`BRD-OBJ-TBD`（尚无正式 BRD；对齐总目标：运营人员可在 Web 管理端创建并治理 KnowledgeBase 容器）
- **问题陈述**：后端 V0.2 KnowledgeBase API 已就绪，管理端仍只有登录与账号治理；运营无法在控制台完成建库、改名、删空库。若前端自行发明 Dataset / Collection，或展示文档数、索引状态等假字段，将与 Knowledge 词汇表和 API 漂移。
- **假设**：
  - 后端 V0.2 API 可用（`/admin/knowledge-bases/**`、`/admin/embedding-models`）；会话与角色沿用 V0.1。
  - 领域实体与能力矩阵以后端 Knowledge / Admin Identity 词汇表为准；本 PRD 只定义 **UI 行为与验收**。
  - 本阶段**没有** Document；删除确认仍须写明「有文档则不能删」，即使当前恒为空库。
  - EmbeddingModel 下拉只消费服务端模拟目录；文案须标明**非生产模型**。
  - 视觉由后续 Pencil 再换皮；本阶段样式以可替换为前提。
  - 交互模式沿用 V0.1：写操作挂在列表页的**模态框**；Staff 无权限入口**可见但禁用 + tooltip**。
- **范围内**：
  - 侧栏新增「知识库管理」；知识库列表（分页、Name 模糊）
  - 创建 KnowledgeBase（Name、Description、Namespace、EmbeddingModel）
  - 修改任意库的 Name / Description（Namespace / EmbeddingModel 只读展示）
  - Admin 删除确认（物理删除、不可恢复）；Staff 删除入口灰显
  - 空列表、校验、业务错误与 Toast
- **范围外**：
  - Document 上传 / 列表 / 删除、解析、切块、向量、索引状态
  - 按 Namespace 筛选；修改 Namespace 或 EmbeddingModel
  - 恢复已删除的知识库；按创建人或租户隔离可见性
  - 独立详情路由、文档数 / 切片数等假字段
  - 真实模型注册中心、把模拟标识包装成生产模型名
  - 视觉定稿 / 设计系统落地（Pencil 后续）
  - 后端 API 变更（本 PRD 只消费已有契约）
  - 账号治理行为变更（仍以 V0.1 为准）

---

## 2. 目标与护栏

- **首要指标**：Admin 或 Staff 可在管理端完成「侧栏进入知识库 → 打开创建并拉模拟目录 → 建库成功出现在列表 → 改 Name/描述且 Namespace/模型不变 → Admin 删除成功 → 原 Namespace 可再建」闭环。
- **次要指标**：
  - Staff 删除入口灰显，无法提交；布局与 Admin 行操作区一致
  - 非法 Name / Namespace / 超长描述 / 目录外模型 / 重名 / 重复 Namespace：表单或弹窗内展示后端 `message`，列表无脏数据
  - 列表与表单均不出现文档数、切片数、索引状态
- **护栏**：
  - 不绕过后端鉴权（灰显是体验，不是安全边界）
  - 不引入 Dataset、Collection（作业务实体）、知识库实例等与词汇表冲突的名称
  - 不提供 Namespace 筛选控件
  - 不把模拟 EmbeddingModel 写成生产可用模型
  - Token / 会话行为不回退 V0.1（localStorage + `me` / `A000001`）

---

## 3. 角色、任务与用例

| 用例 ID | 角色 | 任务 / 目标 | 边界说明 |
| ------- | ---- | ----------- | -------- |
| UC-F101 | AdminUser（Admin 或 Staff） | 从侧栏进入知识库列表并按 Name 查找 | 全局可见；无 Namespace 筛选 |
| UC-F102 | AdminUser（Admin 或 Staff） | 创建空 KnowledgeBase | 无文档上传；模型来自模拟目录 |
| UC-F103 | AdminUser（Admin 或 Staff） | 修改任意库的 Name / Description | 不可改 Namespace / EmbeddingModel |
| UC-F104 | AdminUser（角色 Admin） | 确认后删除空库，释放 Namespace | Staff 入口灰显；有 Document 则后端拒绝 |
| UC-F105 | AdminUser（Admin 或 Staff） | 在创建表单看到可绑定的模拟模型 | 只读目录；须有非生产提示 |

---

## 4. 需求登记表

| 需求 ID | 需求描述 | 角色 | 优先级 | 负责人 | 状态 | 业务目标引用 |
| ------- | -------- | ---- | ------ | ------ | ---- | ------------ |
| REQ-F101 | 侧栏增加「知识库管理」；进入知识库列表页 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F102 | 列表：分页、Name 模糊、创建时间倒序；展示约定列；无摄入假字段 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F103 | 创建模态：Name、Description、Namespace、EmbeddingModel（目录下拉） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F104 | 编辑模态：可改 Name / Description；Namespace 与 EmbeddingModel 只读 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F105 | 删除确认模态；文案标明物理删除、不可恢复、有文档则不能删 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F106 | Staff 删除入口可见但禁用 + tooltip；创建与改文案可用 | Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F107 | 字段内联校验对齐后端规则；成功 Toast；业务失败弹窗内展示 `message` | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F108 | 空列表态；创建入口仍可用（Admin / Staff） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-F109 | 模拟目录加载失败时不可提交创建；标明非生产模型 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |

---

## 5. 用户故事与验收标准

### 5.1 用户故事

| 故事 ID | 关联需求 | 用户故事 | INVEST 自检 | 状态 |
| ------- | -------- | -------- | ----------- | ---- |
| US-F101 | REQ-F101 / REQ-F102 | 作为已登录的 Admin 或 Staff，我想要从侧栏打开知识库列表并按名称查找，以便找到同事建的库。 | 通过 | 草稿 |
| US-F102 | REQ-F103 / REQ-F109 | 作为已登录的 Admin 或 Staff，我想要在弹窗里填写 Name、Namespace、模拟目录中的 EmbeddingModel（及可选描述）创建知识库，以便后续版本往这个容器里放文档。 | 通过 | 草稿 |
| US-F103 | REQ-F104 | 作为已登录的 Admin 或 Staff，我想要修改任意库的显示名或描述，并且看到 Namespace 与模型不能改，以便纠正标题而不动隔离键。 | 通过 | 草稿 |
| US-F104 | REQ-F105 | 作为 Admin，我想要在确认弹窗后删除一个空知识库，以便释放 Namespace 供重建。 | 通过 | 草稿 |
| US-F105 | REQ-F106 | 作为 Staff，我想要看到删除入口但无法提交，同时仍能创建和改文案，以便理解权限边界且布局稳定。 | 通过 | 草稿 |
| US-F106 | REQ-F107 / REQ-F108 | 作为已登录的 AdminUser，我想要在空列表、校验失败或后端拒绝时得到明确反馈，以免误以为成功。 | 通过 | 草稿 |

### 5.2 验收标准

| 验收 ID | 关联故事 | 场景类型 | 前置条件（Given） | 动作（When） | 期望结果（Then） | 状态 |
| ------- | -------- | -------- | ----------------- | ------------ | ---------------- | ---- |
| AC-F101 | US-F101 | 正常 | Admin 或 Staff 已登录 | 点侧栏「知识库管理」 | 进入知识库列表；侧栏高亮该项；仍保留「首页」「账号管理」 | 草稿 |
| AC-F102 | US-F101 | 正常 | 已登录；库中有多条 | 打开列表（不填筛选） | 按创建时间倒序分页；默认 pageSize=20；列含 Name、Namespace、EmbeddingModel、描述（可空）、createdAt；**无**文档数 / 切片数 / 索引状态 | 草稿 |
| AC-F103 | US-F101 | 边界 | 已登录 | 用 Name 模糊筛选或翻页 | 结果与筛选/分页一致；页上**没有** Namespace 筛选控件 | 草稿 |
| AC-F104 | US-F102 | 正常 | 已登录；目录接口成功；Name/Namespace 未被占用 | 打开创建弹窗，选 `mock-embedding-v1` 或 `mock-embedding-v2`，提交合法表单 | Toast 成功；弹窗关闭；列表可见新库；Namespace 与模型与提交一致 | 草稿 |
| AC-F105 | US-F102 | 正常 | 已登录 | 打开创建弹窗 | 模型为下拉，选项来自 `GET /admin/embedding-models`；附「模拟目录，非生产模型」说明；无自填任意模型 | 草稿 |
| AC-F106 | US-F102 | 失败 | 已登录 | Name 为空/超 64、Namespace 含大写或连字符、描述超 200 | 弹窗不关闭；内联或弹窗内错误；不发成功请求或后端拒绝后无新行 | 草稿 |
| AC-F107 | US-F102 | 失败 | 已登录；Name 或 Namespace 已存在 | 再次提交冲突值 | 弹窗内展示后端文案（如「名称已存在」「Namespace 已存在」）；原库不被覆盖 | 草稿 |
| AC-F108 | US-F103 | 正常 | 已登录；目标存在 | 打开编辑弹窗，改 Name，清空描述并提交 | 成功；列表刷新；Namespace 与 EmbeddingModel 仍为原值且控件不可编辑 | 草稿 |
| AC-F109 | US-F103 | 失败 | 已登录 | 将 Name 改为已存在名称 | 弹窗内错误；原记录不变 | 草稿 |
| AC-F110 | US-F104 | 正常 | Admin 已登录；目标无 Document（本阶段皆无） | 打开删除确认并确认 | Toast 成功；该行消失；可用同一 Namespace 再创建 | 草稿 |
| AC-F111 | US-F104 | 边界 | Admin 已登录；后端返回 `A002008`（有文档，下一版本或夹具） | 确认删除 | 弹窗内展示「知识库下仍有文档，不能删除」；记录仍在 | 草稿 |
| AC-F112 | US-F105 | 失败 | Staff 已登录 | 查看行内删除 | 入口可见但禁用；tooltip 说明无权限；无法打开可提交的删除确认；创建 / 编辑仍可用 | 草稿 |
| AC-F113 | US-F105 | 正常 | Staff 与 Admin 分别打开同一列表 | 对比页头与行操作区 | 控件占位一致；仅删除可交互态不同 | 草稿 |
| AC-F114 | US-F106 | 正常 | 已登录；一条知识库都没有 | 打开列表 | 空态说明尚无知识库；创建入口可用 | 草稿 |
| AC-F115 | US-F106 | 失败 | 已登录 | 模拟目录请求失败后点创建提交 | 不可成功建库；提示目录不可用 | 草稿 |
| AC-F116 | US-F101 | 失败 | 无有效会话 | 访问知识库路由 | 清会话并进入登录页（与 V0.1 `A000001` 行为一致） | 草稿 |

---

## 6. 功能行为说明（FRS 精简）

### 6.1 主流程

1. **进入**：已登录 → 侧栏「知识库管理」→ 知识库列表（或空态）。
2. **建库**：页头「创建」→ 拉取模拟目录 → 填 Name、Namespace、选 EmbeddingModel、可选 Description → 成功 Toast → 列表刷新。
3. **查找**：Name 模糊 + 分页；打开编辑核对应 Namespace 与已绑定模型。
4. **改文案**：任意 Admin / Staff 改 Name 或 Description；隔离键与模型只读。
5. **删库（Admin）**：确认弹窗 → 物理删除 → Namespace 可再建。

### 6.2 异常 / 分支流程

- 未登录 / `A000001` → 清会话回登录页（V0.1）。
- 字段不合规 → 内联错误，不关闭弹窗。
- 业务失败（冲突、不存在、无权限、有文档）→ 弹窗内展示后端 `message`。
- 网络 / 未知错误 → Toast。
- 目录加载失败 → 创建不可提交。
- Staff 点删除（若未拦住）→ 以后端 `A001002` 为准，记录不变。

### 6.3 屏态与导航

| 屏 | 路由意图（逻辑） | 说明 |
| --- | --- | --- |
| 知识库列表 | `/knowledge-bases`（或等价；实现前工程选定） | 需登录；侧栏文案「知识库管理」 |
| 创建 / 编辑 / 删除 | 无独立路由 | 挂在列表页的模态框 |
| 详情 | 不单独占路由 | 列表列 + 编辑弹窗只读区覆盖核对需求 |

侧栏三项：**首页** | **账号管理** | **知识库管理**。顶栏身份区不改。

### 6.4 能力矩阵（UI 层，与后端一致）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 列表 / Name 模糊 / 打开创建与编辑 | 能 | 能 |
| 创建 / 改任意库的 Name·描述 | 能 | 能 |
| 改 Namespace / EmbeddingModel | 不能（只读展示） | 不能（只读展示） |
| 删除 | 能（确认后提交） | **入口灰显，不能提交** |

### 6.5 输入边界（与后端对齐）

- **Name**：去首尾空白后 1–64；允许中文与常见标点；全局唯一；可改。
- **Description**：选填；最长 200；空或清空表示无描述。
- **Namespace**：创建时人填；2–32；仅 `[a-z0-9]`；全局唯一；创建后只读。
- **EmbeddingModel**：创建时必选；仅目录返回的稳定标识（当前为 `mock-embedding-v1`、`mock-embedding-v2`）；创建后只读；UI 展示标识本身，不另起生产向别名。
- **列表**：默认 pageSize=20；翻页控件上限 100（与账号列表一致）；仅 Name 模糊。
- **列表列**：Name、Namespace、EmbeddingModel、Description、createdAt；可选展示 createdBy（AdminUser id，本阶段不要求反查 username）。
- **删除文案**：须同时点明物理删除、不可恢复、库下仍有 Document 时不能删除。

### 6.6 反馈（沿用 V0.1）

- 字段校验：表单内联。
- 业务失败：弹窗内 `message`。
- 业务成功（创建 / 更新 / 删除）：Toast，关弹窗，刷新列表。
- 全局意外：Toast。

---

## 7. 非功能产品约束

- **性能**：常规内网下列表与弹窗可手工验收；不设严格 P95。
- **安全 / 隐私**：
  - 复用 V0.1 会话（ADR-0002）；不另存密码
  - 前端灰显不等于授权；删除以后端为准
- **无障碍 / 可用性**：本阶段不设 WCAG 硬指标；禁用删除须有可感知原因（tooltip 或等价）。
- **平台**：桌面浏览器优先（Chrome / Safari / Edge 近两个大版本）；不承诺移动端管理体验。
- **视觉**：不定稿；结构清晰、可换皮。

---

## 8. 分析与遥测

- V0.2 **可不做**产品埋点仪表盘。
- 建议控制台可诊断失败（勿打印 token）；不要把整段 Description 打进噪音日志。

---

## 9. 风险与决策

| 风险 / 决策 | 类型 | 负责人 | 状态 | 说明 |
| ----------- | ---- | ------ | ---- | ---- |
| 只做容器 UI，不做 Document 页 | 决策 | 产品 | 已接受 | 对齐后端 V0.2 grilling |
| 写操作继续用列表页模态，无详情路由 | 决策 | 产品 | 已接受 | 与 V0.1 账号治理一致；字段少 |
| Staff 删除灰显 + tooltip，创建/编辑可用 | 决策 | 产品 | 已接受 | 对齐后端能力矩阵与 V0.1 权限表现 |
| 不提供 Namespace 筛选 | 决策 | 产品 | 已接受 | 对齐后端契约 |
| 模型下拉只读模拟目录并标明非生产 | 决策 | 产品 | 已接受 | 防止运营当成真实模型 |
| Namespace / EmbeddingModel 编辑态只读 | 决策 | 产品 | 已接受 | 选错只能删库重建 |
| 删除文案预埋「有文档不能删」 | 决策 | 产品 | 已接受 | 契约先于 Document 版本 |
| 不展示摄入假字段 | 决策 | 产品 | 已接受 | 避免与下一版本语义打架 |
| 侧栏从两项扩为三项 | 决策 | 产品 | 已接受 | 知识库与账号分入口 |
| 视觉后置 Pencil | 决策 | 产品 | 已接受 | 本 PRD 不验收视觉稿 |
| IXD 未出时实现按本 PRD + CONTEXT | 风险 | 产品 + 设计 | 待处理 | 需要时可补 `ixd.md` / Pencil |

---

## 10. 依赖与发布

- **依赖**：
  - 后端 V0.2 KnowledgeBase API 与模拟目录（见 `api.md`）
  - 管理端 V0.1 登录、壳层、会话
  - 词汇表：frontend-admin CONTEXT + backend Knowledge / Admin Identity
- **发布策略**：随 `frontend-admin` V0.2 发布；无特性开关要求（待定）。
- **运维 / 支持就绪**：说明模拟 EmbeddingModel 非生产模型；提醒 Namespace 创建后不可改。
- **成功标准**：见第 2 节首要指标。

---

## 11. 追溯链接

- **前端领域词汇**：`docs/frontend-admin/CONTEXT.md`
- **后端 Knowledge 词汇**：`docs/backend/context/knowledge/CONTEXT.md`
- **后端 Admin Identity 词汇**：`docs/backend/context/admin-identity/CONTEXT.md`
- **后端 API**：`docs/backend/api.md`
- **后端 PRD**：`docs/backend/版本迭代/V0.2/prd.md`
- **管理端 V0.1 PRD**：`docs/frontend-admin/版本迭代/v0.1/prd.md`
- **ADR**：0001 身份隔离；0002 localStorage token
- **上下文地图**：`CONTEXT-MAP.md`
- **视觉 / IXD / ui-plan**：待 Pencil 与后续文档
- **实现计划**：待定（OpenSpec change 前缀 `frontAdm-`）
- **验证证据**：待定（手工验收清单 / 组件测试）

---

## 12. 变更记录

| 日期 | 作者 | 变更说明 |
| ---- | ---- | -------- |
| 2026-08-11 | grilling → PRD | 首稿：基于后端 Knowledge V0.2 已锁定结论 + 管理端 V0.1 交互模式 |

---

## 13. 开放问题

- [ ] 产品 / 工程 / 测试负责人正式命名与 RACI
- [ ] 路由 path 最终命名（`/knowledge-bases` 等）——实现前由工程选定即可
- [ ] Pencil 视觉稿就绪后，是否单独立项「换皮」而不改本 PRD 行为条款
- [ ] V0.2 是否必须自动化测试作为发布门槛，还是允许手工验收
- [ ] 是否需要独立 BRD 编号替换 `BRD-OBJ-TBD`
- [ ] 列表是否展示 createdBy（id）——不展示也不影响主闭环
