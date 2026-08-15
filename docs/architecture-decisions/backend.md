# Backend architecture decisions (baseline)

适用：`backend-*` OpenSpec change；代码落在 `backend/`（`app` + `fw-base`）。  
本文是**按栈的主动基线**：新后端能力默认按此设计，而非等踩坑再补条款。  
项目结构与模块事实见 [工程架构](../backend/工程架构.md)。与编号系统 ADR（[`docs/adr/`](../adr/)）互补：本文件管通用基线，`adr/` 管单点难逆决策。

**OpenSpec**：`design.md` 须声明已阅读本文；对适用条款写「如何满足」，不适用写 `N/A + why`。后续修订本文 = 演进标准；个案例外写在该 change 的 design，不静默违反。

---

## A. 架构与模块

1. **按 feature 分包**：新能力优先 `com.xgc.agent.rag.features.<module>/`（controller / service / dao / dto），避免按技术层横切堆砌。
2. **依赖方向**：`app` → `fw-base` 单向；业务不反向依赖、不把域错误码塞进 `fw-base`。
3. **分层**：Controller = HTTP + 校验 + DTO；Service = 用例编排与事务边界；Mapper/DAO = 持久化；不在 Controller 写业务规则或直访 Mapper（除非既有模式已如此且本变更不扩大）。
4. **API 契约**：对外用 DTO/`record` 视图；不把 `*DO` 直接当响应体。
5. **可复用基建**：鉴权会话、统一响应/异常、MP、ID、ObjectStorage 等先查 `fw-base` 与既有 feature；禁止业务包直绑云厂商 SDK（存储等走端口）。
6. **配置**：类型安全绑定（`@ConfigurationProperties`）；密钥与连接信息不入库、不进 API、不写进可提交文档正文。

## B. 性能与资源

1. **大对象 / 请求体 I/O**：业务主路径默认流式或 `Path`，禁止默认整包 `byte[]` / `getBytes()`；例外须在 design 写上限与理由。
2. **多遍消费**：校验与上传/解析若需多次读取，design 写清策略（再开流、有限前缀、临时文件等），避免「为省事整包进堆」。
3. **体积与超时**：multipart / 请求大小等走部署配置时，design 写明配置键与超限错误映射；领域更严上限一并写清。
4. **列表与查询**：分页必有上限；避免明显 N+1；热路径所需索引在 design 或 SQL 脚本说明中点出。
5. **同步路径**：避免在请求线程做无界重计算、无超时的外部调用；长耗时默认评估异步/出队（本阶段不做则 out-of-scope）。
6. **连接与池**：不在业务代码手工泄漏 JDBC/HTTP/SDK 客户端；复用 Spring 管理的 Bean。

## C. 一致性与可靠性

1. **本地事务**：`@Transactional` 仅覆盖同一事务资源（通常单一 DB）；边界放在 Service 用例层；禁止无必要的大事务（长 IO/外部调用包进同一事务）。
2. **多资源写/删**：DB + ObjectStorage / HTTP / 消息等须写明顺序、失败保留侧、补偿、补偿失败可观测性；不得假装与 DB 同一本地事务。
3. **失败可验收**：跨资源失败语义应能落成 spec scenario，或 proposal 显式 out-of-scope。
4. **幂等与重试**：对外写操作若可能重复提交，design 说明幂等键或「本阶段不保证」；对外部调用的重试须防放大（有界、幂等）。
5. **并发**：若存在丢失更新/竞态，design 写明策略（乐观锁、DB 约束、或本阶段不处理）。
6. **迁移**：无 Flyway；DDL 以 `resources/db/*.sql` 手工脚本交付，design/tasks 写明脚本名与执行顺序。

## D. 安全

1. **门禁与能力**：`/admin/**` 等与既有鉴权、角色能力矩阵、系统 ADR（身份隔离等）一致；不在本变更悄悄放宽。
2. **数据出站**：objectKey、密钥、内部存储路径等不得进入对外 DTO/日志明文。
3. **输入**：请求 DTO 用 Bean Validation；文件类型以服务端探测为准时，不把客户端 Content-Type 当权威。
4. **租户/归属**：按知识库、用户等做存在性与归属校验，防止 IDOR 式越权（对照词汇表与既有错误码）。

## E. API 与错误模型

1. **统一响应**：遵循既有 `R<T>` / 全局异常与错误码体系；新码分段与命名与现网文档一致。
2. **端口异常映射**：`fw-base` 抛基建异常，feature 映射为管理端/业务码，不向客户端暴露厂商报文。
3. **校验失败**：参数/状态不合法走既有 4xx 语义与错误码，不返回 500 冒充系统故障。

## F. 可观测性

1. **日志**：SLF4J；关键失败（存储、补偿、鉴权拒绝）打清上下文 id，禁止日志打印密钥与大包正文。
2. **半成功**：可能出现孤儿资源/不一致时，design 点名日志或指标意图，便于运维发现。
3. **本阶段不做的** tracing/metrics 看板：写入 proposal out-of-scope，避免 Apply 临场加半套。

## G. 测试与验证

1. 纯规则/映射优先单测；涉及 DB/外部端口的失败路径至少有一处可重复验证（单测或契约测）。
2. OpenSpec tasks：凡 design 记载了本规约相关决策，对应 phase 须有「与 design / 本文一致」的验证项。

---

## design 响应模板（可复制）

```markdown
### Backend architecture decisions
- 已阅读：docs/architecture-decisions/backend.md
- A 架构：…
- B 性能与资源：…（或 N/A — …）
- C 一致性与可靠性：…
- D 安全：…
- E API/错误：…
- F 可观测性：…
- G 测试：…
```
