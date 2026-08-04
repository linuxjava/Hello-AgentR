# AGENTS.md

## 项目简介

企业级 Agentic RAG 智能体 — 全链路覆盖文档解析、多路检索、意图识别、问题重写、会话记忆、MCP 工具调用与深度思考。面向真实业务场景，从 0 到 1 完整工程实现。

## 目录结构

| 目录 | 说明 |
| ---- | ---- |
| [backend](backend) | 基于 SpringBoot 开发的后端 |
| [frontend-admin](frontend-admin) | Web 管理后台 |
| [frontend](frontend) | Web 用户端 |
| [mobile](mobile) | 基于 Flutter 的 App 移动端 |
| [docs](docs) | 项目文档目录 |

```
Hello-ARag/
├── backend/           # SpringBoot 后端
├── frontend-admin/    # Web 管理后台
├── frontend/          # Web 用户端
├── mobile/            # Flutter 移动端
└── docs/              # 项目文档
    ├── backend/              # 后端文档
    ├── frontend-admin/       # 管理后台文档
    │   └── design-system/    # 管理后台设计系统
    ├── frontend/             # Web 用户端文档
    │   └── design-system/    # 用户端设计系统
    └── mobile/               # 移动端文档
        └── design-system/    # 移动端设计系统
```

## 文档目录（docs）

| 目录 | 说明 |
| ---- | ---- |
| [docs/backend](docs/backend) | 后端文档 |
| [docs/frontend-admin](docs/frontend-admin) | Web 管理后台文档 |
| [docs/frontend-admin/design-system](docs/frontend-admin/design-system) | 管理后台设计系统 |
| [docs/frontend](docs/frontend) | Web 用户端文档 |
| [docs/frontend/design-system](docs/frontend/design-system) | 用户端设计系统 |
| [docs/mobile](docs/mobile) | Flutter 移动端文档 |
| [docs/mobile/design-system](docs/mobile/design-system) | 移动端设计系统 |

## 核心文档

所有生成的文档使用中文输出，代码相关术语请使用英文。

| 类型     | 路径                                       | 说明                                       |
| ------ | ---------------------------------------- | ---------------------------------------- |
| 工程架构   | [工程架构](docs/工程架构.md)                     | 不涉及技术细节，专注工程架构、三方依赖说明等                   |
| 开发进度   | [开发进度](docs/开发进度.md)                     | REQ/模块实现状态与排期建议                          |
| 代码注释规范 | [代码注释规范](docs/代码注释规范.md)                 | 通用中文注释规范（不绑定 PRD/IXD）；改码前必读              |
| 版本迭代目录 | [version-iteration](docs/version-iteration) | 版本迭代目录，每个版本以Vx.x.x，里面必须包含prd.md、交互设计文档ixd.md、ui-plan.md |


## OpenSpec 工作流规则

### 核心纪律

1. **先读后做**：执行任何 OpenSpec 命令前，先读取：
  - openspec/config.yaml（项目约束）
  - openspec/specs/ 目录下相关域的规范（当前系统行为）
  - openspec/changes/ 当前活跃的变更（如果存在）
2. **不要猜测需求**：如果 spec 中没有明确定义某个行为，问我，不要自行补充。
3. **out-of-scope 是红线**：proposal.md 中标注为 out-of-scope 的功能，严禁实现。

### Apply 阶段规则

1. 每完成一个 tasks.md 中的 Phase，停下来。
2. 总结当前阶段的代码变更（改了什么文件、为什么这么改）。
3. 等待我 review 并确认后，再继续下一 Phase。
4. 严禁一次性实现所有任务。

