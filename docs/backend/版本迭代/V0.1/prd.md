# 产品需求文档（PRD）：Web 管理端身份与账号 API（V0.1）

**状态**：草稿 | **负责人**：待定（产品） | **最后更新**：2026-08-07

**版本**：V0.1  
**交付重心**：后端 API（供 `frontend-admin` 对接）；本 PRD 不涵盖管理端 UI 视觉与交互稿。  
**领域词汇**：见 [`docs/backend/CONTEXT.md`](../../CONTEXT.md)  
**相关决策**：[`docs/adr/0001-separate-admin-and-enduser-identity.md`](../../../adr/0001-separate-admin-and-enduser-identity.md)

---

## 1. 目的与范围

- **业务目标引用**：`BRD-OBJ-TBD`（尚无正式 BRD；本迭代对齐项目总目标：企业级 Agentic RAG 管理控制台可安全登录并治理后台账号）
- **问题陈述**：管理后台尚无独立身份体系与账号治理能力，无法安全初始化首个管理员，也无法在多人协作下按角色管理后台账号；若与未来 EndUser 共用身份，存在权限泄漏与演进耦合风险。
- **假设**：
  - V0.1 仅服务 Web 管理端（`frontend-admin`），不服务用户 Web 端 / App。
  - 鉴权基建采用已引入的 Sa-Token + Redis；会话细节以产品行为为准（见需求/验收标准），实现选型不在本 PRD 展开。
  - 领域术语以 `CONTEXT.md` 为准：实体为 **AdminUser**，角色为 **Admin** / **Staff**。
- **范围内**：
  - 管理端专用登录 / 登出 / 当前账号资料
  - AdminUser 创建、分页列表、重置他人密码、变更角色、物理删除、修改自己密码
  - 固定两角色：Admin、Staff 及能力矩阵
  - 启动时 Bootstrap Admin 初始化（`admin` / `admin@123456`，`bootstrap=true`）
  - 末账号 / 末 Admin / Bootstrap 删除保护；密码变更与删除后的会话作废
- **范围外**：
  - 启用 / 停用 AdminUser
  - 自定义角色 / 权限码配置
  - EndUser 登录与账号 API
  - 登录验证码 / 失败次数锁定
  - 用户名变更、系统生成临时密码流程
  - 昵称 / 头像 / 邮箱、操作审计日志 API
  - 管理端前端页面实现与视觉设计（可并行，但不作为本 PRD 验收对象）
  - RAG 业务能力（文档、检索、会话等）

---

## 2. 目标与护栏

- **首要指标**：V0.1 后端发布后，可使用 Bootstrap Admin 完成首次登录，并完成至少 1 次「创建 Staff → 列表可见 → 重置密码 / 改角色 / 删除（非保护对象）」闭环（手工或自动化验收通过）。
- **次要指标**：
  - 能力矩阵中「不能」的操作 100% 返回明确拒绝（非静默成功）
  - 登录失败不泄露用户名是否存在
- **护栏**：
  - AdminUser 凭证不得用于 EndUser 客户端登录（身份隔离，见 ADR-0001）
  - 不得删除 Bootstrap Admin；不得删除当前登录账号；不得造成「零 AdminUser」或「零 Admin 角色」锁死
  - 任何列表/详情响应不得返回密码或密码哈希

---

## 3. 角色、任务与用例

| 用例 ID | 角色 | 任务 / 目标 | 边界说明 |
| ------- | ---- | ----------- | -------- |
| UC-001 | 未登录访问者 | 使用用户名密码进入管理端会话 | 仅管理端登录入口 |
| UC-002 | AdminUser（角色 Admin） | 治理后台账号（增删改角色、重置密码） | 受 Bootstrap / 末账号 / 末 Admin 保护 |
| UC-003 | AdminUser（角色 Staff） | 登录后查看账号列表、维护自己的密码 | 无账号治理写操作 |
| UC-004 | 系统（启动过程） | 确保存在可救回的 Bootstrap Admin | 非 HTTP；不覆盖已有 bootstrap |

---

## 4. 需求登记表

| 需求 ID | 需求描述 | 角色 | 优先级 | 负责人 | 状态 | 业务目标引用 |
| ------- | -------- | ---- | ------ | ------ | ---- | ------------ |
| REQ-001 | 管理端与 EndUser 身份隔离（分表、分登录入口、凭证互不通用） | 全体 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-002 | Bootstrap Admin 启动初始化与冲突失败策略 | 系统 | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-003 | 管理端登录 / 登出 / 会话规则 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-004 | 当前登录 AdminUser 资料查询（`me`） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-005 | 修改自己的密码 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-006 | 分页列表 AdminUser（筛选） | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-007 | 创建 AdminUser（指定角色） | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-008 | 重置他人密码（含 Bootstrap） | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-009 | 变更他人角色（末 Admin 保护） | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-010 | 物理删除 AdminUser（保护规则 + 会话作废） | Admin | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-011 | 用户名与密码约束 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |
| REQ-012 | 角色能力矩阵强制鉴权 | Admin / Staff | P0 | 工程待定 | 草稿 | BRD-OBJ-TBD |

---

## 5. 用户故事与验收标准

### 5.1 用户故事

格式：作为〔角色〕，我想要〔动作〕，以便〔收益〕。

| 故事 ID | 关联需求 | 用户故事 | INVEST 自检 | 状态 |
| ------- | -------- | -------- | ----------- | ---- |
| US-001 | REQ-003 | 作为未登录的管理员候选人，我想要使用用户名和密码登录管理端，以便进入受保护的管理 API 会话。 | 通过 | 草稿 |
| US-002 | REQ-003 | 作为已登录的 AdminUser，我想要登出，以便当前会话 token 立即失效。 | 通过 | 草稿 |
| US-003 | REQ-004 | 作为已登录的 AdminUser，我想要查看我的账号资料，以便前端展示身份与角色。 | 通过 | 草稿 |
| US-004 | REQ-005 | 作为已登录的 AdminUser，我想要修改自己的密码，以便轮换凭证且旧会话失效。 | 通过 | 草稿 |
| US-005 | REQ-006 | 作为 Admin 或 Staff，我想要分页筛选查看 AdminUser 列表，以便掌握后台账号现状。 | 通过 | 草稿 |
| US-006 | REQ-007 | 作为 Admin，我想要创建带角色的 AdminUser，以便团队成员能登录管理端。 | 通过 | 草稿 |
| US-007 | REQ-008 | 作为 Admin，我想要重置他人密码（含 Bootstrap），以便账号在遗忘密码后可被救回。 | 通过 | 草稿 |
| US-008 | REQ-009 | 作为 Admin，我想要变更他人角色，以便权限可在 Admin 与 Staff 间调整且不锁死管理。 | 通过 | 草稿 |
| US-009 | REQ-010 | 作为 Admin，我想要删除其他 AdminUser，以便离职或废弃账号被移除且会话失效。 | 通过 | 草稿 |
| US-010 | REQ-002 | 作为系统运维相关方，我想要应用首次就绪即存在 Bootstrap Admin，以便无需手工插库即可登录。 | 通过 | 草稿 |
| US-011 | REQ-012 | 作为 Staff，我想要被拒绝执行账号治理写操作，以便运营人员无法越权改删账号。 | 通过 | 草稿 |

### 5.2 验收标准

| 验收 ID | 关联故事 | 场景类型 | 前置条件（Given） | 动作（When） | 期望结果（Then） | 状态 |
| ------- | -------- | -------- | ----------------- | ------------ | ---------------- | ---- |
| AC-001 | US-001 | 正常 | 存在用户名为 `admin`、密码正确的 AdminUser | 调用管理端登录并提交正确凭证 | 返回有效 token；后续请求可在 `Authorization` 头携带该 token 访问受保护 API | 草稿 |
| AC-002 | US-001 | 失败 | 用户名或密码任一错误 | 调用登录 | 失败且文案统一为「用户名或密码错误」；不暗示用户名是否存在 | 草稿 |
| AC-003 | US-001 | 边界 | 同一 AdminUser 已在其他端登录 | 再次登录成功 | 允许多端并发；各端独立 token（不强制踢掉旧端） | 草稿 |
| AC-004 | US-002 | 正常 | 持有有效 token | 调用登出 | 该 token 立即失效；再用该 token 访问受保护 API 失败 | 草稿 |
| AC-005 | US-003 | 正常 | 已登录 | 查询 `me` | 返回 id、username、role、bootstrap、createdAt 等；不含密码/哈希 | 草稿 |
| AC-006 | US-003 | 失败 | 无 token 或 token 无效 | 查询 `me` 或其他受保护 API | 鉴权失败（未登录） | 草稿 |
| AC-007 | US-004 | 正常 | 已登录且旧密码正确 | 提交旧密码 + 符合规则的新密码（且不同于旧密码） | 密码更新成功；该 AdminUser 全部既有 token 作废 | 草稿 |
| AC-008 | US-004 | 失败 | 已登录 | 旧密码错误，或新密码不合规，或新密码等于旧密码 | 变更失败；既有 token 保持有效 | 草稿 |
| AC-009 | US-005 | 正常 | Admin 或 Staff 已登录 | 请求列表（默认分页） | 按创建时间倒序返回；默认 pageSize=20；不含密码/哈希 | 草稿 |
| AC-010 | US-005 | 边界 | 已登录 | pageSize=100 或带 `username` 模糊、`role` 精确筛选 | 筛选/分页生效；pageSize 上限 100，超出被拒绝或按约定截断（须在 SRS 中二选一并测） | 草稿 |
| AC-011 | US-006 | 正常 | Admin 已登录 | 创建用户名唯一、密码合规、角色为 Admin 或 Staff 的账号 | 创建成功；列表可查到 | 草稿 |
| AC-012 | US-006 | 失败 | Staff 已登录 | 尝试创建 AdminUser | 拒绝（无权限） | 草稿 |
| AC-013 | US-006 | 失败 | Admin 已登录 | 用户名重复或格式非法或密码不合规 | 创建失败并返回可理解错误 | 草稿 |
| AC-014 | US-007 | 正常 | Admin 已登录 | 为他人（含 Bootstrap Admin）设置合规新密码 | 成功；目标账号全部 token 作废 | 草稿 |
| AC-015 | US-007 | 失败 | Staff 已登录 | 尝试重置他人密码 | 拒绝（无权限） | 草稿 |
| AC-016 | US-008 | 正常 | 至少两名 Admin；操作者是 Admin | 将其中一名非唯一 Admin 改为 Staff | 成功 | 草稿 |
| AC-017 | US-008 | 边界 | 仅剩一名角色为 Admin 的 AdminUser | 尝试将其改为 Staff | 拒绝（末 Admin 保护） | 草稿 |
| AC-018 | US-008 | 失败 | Staff 已登录 | 尝试变更他人角色 | 拒绝（无权限） | 草稿 |
| AC-019 | US-009 | 正常 | Admin 已登录；目标非 Bootstrap、非自己、删除后仍至少 1 个 AdminUser 且仍至少 1 名 Admin | 物理删除目标 | 删除成功；目标全部 token 作废 | 草稿 |
| AC-020 | US-009 | 边界 | 目标为 Bootstrap Admin，或目标为当前登录账号，或仅剩 1 个 AdminUser，或删除会导致零 Admin | 尝试删除 | 拒绝 | 草稿 |
| AC-021 | US-009 | 失败 | Staff 已登录 | 尝试删除 | 拒绝（无权限） | 草稿 |
| AC-022 | US-010 | 正常 | 库中不存在 `bootstrap=true` 的 AdminUser，且用户名 `admin` 未被占用 | 应用启动 | 插入 Bootstrap Admin：username=`admin`，初始密码=`admin@123456`，role=Admin，bootstrap=true | 草稿 |
| AC-023 | US-010 | 边界 | 已存在 bootstrap AdminUser | 再次启动 | 不覆盖密码、不重置字段 | 草稿 |
| AC-024 | US-010 | 边界 | 仅有普通 AdminUser、无 bootstrap，且 `admin` 用户名可用 | 启动 | 仍补插 Bootstrap Admin | 草稿 |
| AC-025 | US-010 | 失败 | `admin` 已被非 bootstrap 账号占用且缺少 bootstrap | 启动 | 启动失败并记录明确错误；不静默改名 | 草稿 |
| AC-026 | US-011 | 失败 | Staff 已登录 | 调用创建 / 重置他人密码 / 改角色 / 删除 | 全部拒绝 | 草稿 |

---

## 6. 功能行为说明（FRS 精简）

### 6.1 主流程

1. **首次就绪**：应用启动 → 按 REQ-002 初始化 Bootstrap Admin → Admin 使用 `admin` / `admin@123456` 登录 → 获取 token。
2. **账号治理**：Admin 创建 Staff/Admin → 列表可见 →（可选）改角色 / 重置密码 / 删除。
3. **Staff 日常**：Staff 登录 → 查看列表 → 修改自己密码 → 登出。
4. **会话轮换**：改己密或重置他人密成功 → 目标账号所有 token 失效 → 需重新登录。

### 6.2 异常 / 分支流程

- 登录凭证错误 → 统一失败文案。
- 无权限（Staff 越权、未登录）→ 拒绝。
- 校验失败（用户名/密码规则、用户名冲突）→ 拒绝。
- 保护规则触发（Bootstrap / 自己 / 末账号 / 末 Admin）→ 拒绝。
- Bootstrap 用户名冲突 → **进程启动失败**（非业务 API 错误）。

### 6.3 输入 / 输出边界

**用户名**：创建后不可改；全局唯一；长度 4–32；仅 `[a-zA-Z0-9_]`；登录精确匹配（大小写敏感）。

**密码**：长度 8–64；须同时含字母与数字；单向哈希存储；响应永不回传密码/哈希。

**角色**：仅 `Admin` | `Staff`；无自定义角色。

**Bootstrap**：布尔标记；不可去除；用于识别初始管理员，**不是**角色名。

**列表**：默认 pageSize=20，上限 100；`username` 模糊；`role` 精确；默认创建时间倒序。

**会话**：token 置于 `Authorization`；多端并发；登出作废当前 token；改密/重置/删除作废目标账号全部 token。

### 6.4 能力矩阵（产品规则）

| 动作 | Admin | Staff |
| --- | --- | --- |
| 登录管理端 | 能 | 能 |
| 创建 AdminUser（指定 Admin 或 Staff） | 能 | 不能 |
| 列表 / 分页查询 AdminUser | 能 | 能 |
| 重置他人密码 | 能 | 不能 |
| 重置 Bootstrap Admin 密码 | 能 | 不能 |
| 删除他人（非保护对象） | 能 | 不能 |
| 删除 Bootstrap Admin | 不能 | 不能 |
| 修改自己的密码 | 能 | 能 |
| 变更他人角色 | 能（不得使 Admin 人数降为零） | 不能 |

### 6.5 API 用例清单（本版本应提供）

| 序号 | 用例 | 谁可调用 |
| --- | --- | --- |
| 1 | 登录 | 匿名 |
| 2 | 登出 | 已登录 |
| 3 | 当前 AdminUser 资料（`me`） | 已登录 |
| 4 | 修改自己的密码 | 已登录 |
| 5 | 分页列表 AdminUser | Admin / Staff |
| 6 | 创建 AdminUser | Admin |
| 7 | 重置他人密码 | Admin |
| 8 | 变更他人角色 | Admin |
| 9 | 删除 AdminUser | Admin |
| — | Bootstrap 初始化 | 启动时，非 HTTP |

---

## 7. 非功能产品约束

- **性能**：本版本不设严格 SLA；登录与账号 CRUD 应在常规内网环境下可用于手工验收（具体 P95 指标交 SRS/NFR 补齐）。
- **安全 / 隐私**：
  - 管理端与 EndUser 身份隔离（ADR-0001）
  - 密码单向哈希；禁止响应泄露哈希
  - 登录失败防枚举（统一错误）
  - 写操作按角色鉴权；保护规则不可绕过
- **无障碍 / 可用性**：本 PRD 为后端 API；UI 无障碍不在范围。
- **平台支持**：后端 HTTP API；首要消费方为 Web 管理端。

---

## 8. 分析与遥测

- **事件（建议，V0.1 可不做产品埋点仪表盘）**：
  - `admin_auth_login_success` / `admin_auth_login_failure`（无用户名明文）
  - `admin_user_created` / `admin_user_deleted` / `admin_user_role_changed` / `admin_user_password_reset`
- **看板 / 告警**：待定；至少保留应用日志：Bootstrap 初始化成功/跳过/启动失败原因。

---

## 9. 风险与决策

| 风险 / 决策 | 类型 | 负责人 | 状态 | 说明 |
| ----------- | ---- | ------ | ---- | ---- |
| AdminUser 与 EndUser 分表分入口 | 决策 | 产品 + 工程 | 已接受 | ADR-0001；降低权限泄漏与模型耦合 |
| 实体名使用 AdminUser（不用 Operator） | 决策 | 产品 | 已接受 | grilling 更正；避免与角色/口语混淆 |
| 固定两角色，不做权限码 | 决策 | 产品 | 已接受 | V0.1 降低复杂度 |
| 不做启用/停用 | 决策 | 产品 | 已接受 | 延后；原「不可停用」规则一并延后 |
| 明文初始密码 `admin@123456` 写入文档 | 风险 | 工程 / 运维 | 待处理 | 仅引导首次登录；生产须尽快改密（本版仅有「改自己密码」，无强制首登改密——见开放问题） |
| Staff 可见全部账号列表 | 决策 | 产品 | 已接受 | 便于协作感知；写操作仍收口 Admin |
| pageSize 超上限：拒绝 vs 截断 | 可行性 | 工程 | 待定 | AC-010 要求 SRS 二选一 |

---

## 10. 依赖与发布

- **依赖**：
  - 后端工程（Spring Boot / PostgreSQL / Redis / Sa-Token）
  - 领域词汇 `docs/backend/CONTEXT.md`
  - 后续：`frontend-admin` 对接（非本 PRD 完成定义）
- **发布策略**：随 backend V0.1 发布；无特性开关要求（待定）。
- **运维 / 支持就绪**：
  - 首次部署确认 Bootstrap 可登录
  - 文档说明初始密码并提醒立即修改
  - `admin` 用户名冲突导致启动失败的排障说明
- **成功标准**：见第 2 节首要指标。

---

## 11. 追溯链接

- **领域词汇表**：`docs/backend/CONTEXT.md`
- **架构决策**：`docs/adr/0001-separate-admin-and-enduser-identity.md`
- **上下文地图**：`CONTEXT-MAP.md`
- **软件需求规格（SRS）**：待定（建议下一步：`docs/backend/版本迭代/V0.1/srs.md` 或 OpenSpec specs）
- **实现计划**：待定（OpenSpec change / tasks）
- **验证证据**：待定（接口测试 / 验收记录）

---

## 12. 变更记录

| 日期 | 作者 | 变更说明 |
| ---- | ---- | -------- |
| 2026-08-07 | grilling → PRD | 首稿：基于 Admin Identity grilling 结论生成 V0.1 PRD |
| 2026-08-07 | — | 全文改为中文表述（代码相关术语保留英文） |

---

## 13. 开放问题

- [ ] 是否要求 Bootstrap Admin **首次登录强制修改密码**？（当前仅提供「改自己密码」，不强制）
- [ ] pageSize 超过 100：拒绝请求，还是截断为 100？
- [ ] 产品 / 工程 / 测试负责人正式命名与 RACI
- [ ] 是否需要独立 BRD 编号替换 `BRD-OBJ-TBD`
- [ ] 登录/账号 API 的 URL 路径与错误码表（交 SRS / OpenSpec design）
- [ ] V0.1 是否必须交付自动化测试作为发布门槛，还是允许手工验收
