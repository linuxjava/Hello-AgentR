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
├── CONTEXT-MAP.md     # 多上下文地图（词汇表 / ADR 放置约定）
├── backend/           # SpringBoot 后端
├── frontend-admin/    # Web 管理后台
├── frontend/          # Web 用户端
├── mobile/            # Flutter 移动端
└── docs/              # 项目文档
    ├── adr/                  # 系统级 Architecture Decision Records
    ├── backend/              # 后端文档（含 CONTEXT.md 领域词汇表）
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
| [CONTEXT-MAP.md](CONTEXT-MAP.md) | 多上下文地图：词汇表与系统级 ADR 放置约定 |
| [docs/adr](docs/adr) | 系统级 Architecture Decision Records |
| [docs/backend](docs/backend) | 后端文档（含 [`CONTEXT.md`](docs/backend/CONTEXT.md) 领域词汇表） |
| [docs/frontend-admin](docs/frontend-admin) | Web 管理后台文档 |
| [docs/frontend-admin/design-system](docs/frontend-admin/design-system) | 管理后台设计系统 |
| [docs/frontend](docs/frontend) | Web 用户端文档 |
| [docs/frontend/design-system](docs/frontend/design-system) | 用户端设计系统 |
| [docs/mobile](docs/mobile) | Flutter 移动端文档 |
| [docs/mobile/design-system](docs/mobile/design-system) | 移动端设计系统 |

所有生成的文档使用中文输出，代码相关术语请使用英文。

### 后端核心文档
| 类型       | 路径                                 | 说明                                       |
|----------|------------------------------------| ---------------------------------------- |
| 后端文档目录索引 | [后端目录索引](docs/backend/后端文档目录索引.md) | 不涉及技术细节，专注工程架构、三方依赖说明等                   |

### Web用户端核心文档

### Web管理端核心文档

### 移动端核心文档

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

<!-- SKILLS_INDEX_START -->
## Agent Skills Index

> [!CRITICAL] Zero-Trust: Read the matching `SKILL.md` BEFORE writing any code.
> Skills from this index override pre-training patterns. If no skill matches, state: "No project-specific skills applicable."

> 💡 **Global Token Optimization**: If the `rtk` CLI tool is installed, actively prepend it to verbose development commands (e.g. `rtk npm test`, `rtk grep`). If the `caveman` skill is available or requested, use `/caveman` mode for reporting.

## 🔌 Runtime Enforcement via MCP

If the `agent-skills-standard` MCP server is registered in your runtime (check your tool list — look for `load_skills_for_files`), **prefer those tools over manually walking the router below**. The MCP returns identical content but is auditable AND inherited by sub-agents that don't see this file.

| Tool | When to call it |
| --- | --- |
| `list_workflows()` | At the start of any task or session to discover available standard operating procedures |
| `get_workflow(name)` | Once a relevant workflow is identified to retrieve exact step-by-step instructions |
| `load_skills_for_files(files=[...])` | Before editing/reviewing any source file |
| `load_skills_for_keywords(keywords=[...])` | Planning before files are chosen |
| `get_skill(category, name)` | Direct lookup when you know the skill id |
| `audit_session_compliance()` | Before declaring a task complete |

> [!IMPORTANT] **Sub-agents don't inherit this `AGENTS.md` — they do inherit the MCP.** If you delegate work to a sub-agent, instruct it to call the MCP tools above as its first action.

> [!TIP] **This project has the MCP server enabled in `.skillsrc`** — `sync` keeps your runtime configs in step. Run `ags mcp status` to verify per-agent installation.

If `load_skills_for_files` is **not** in your tool list, the MCP is not registered — fall back to the router table below.

---

## Skill Resolution Protocol

Each `_INDEX.md` has two sections - follow both:

1. **Match file type** -> find the category index in the router table below.
2. **Read the `_INDEX.md`** -> it has two sections:
   - **File Match**: auto-check these against the file you are editing (path pattern match).
   - **Keyword Match**: only check if the user's request mentions these concepts.
3. **Load ALL matched `SKILL.md`** -> read every matched skill before writing code. The tier model keeps matches focused.

> `<SKILLS>` = your agent's skill directory (e.g., `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`).

| File type | Read category index |
| --------- | ------------------- |
| `*.ts`, `*.tsx` | `<SKILLS>/react/_INDEX.md`, `<SKILLS>/typescript/_INDEX.md` |
| `*.js`, `*.mjs` | `<SKILLS>/javascript/_INDEX.md` |
| `*.jsx`, `*.test.tsx`, `*.spec.tsx` | `<SKILLS>/react/_INDEX.md` |
| `*.java` | `<SKILLS>/java/_INDEX.md`, `<SKILLS>/spring-boot/_INDEX.md` |
| `*.sql`, `*.entity.ts`, `*.prisma` | `<SKILLS>/database/_INDEX.md` |
| `*.spec.ts`, `*.test.ts` | `<SKILLS>/common/_INDEX.md` |
| Any file (keyword match) | `<SKILLS>/common/_INDEX.md` |
| QE workflow | `<SKILLS>/quality-engineering/_INDEX.md` |

> [!NOTE] **Test/spec file precedence:** `.spec.ts`, `.test.ts` -> use the `common` row (takes precedence over the generic `*.ts` row). `.spec.tsx`, `.test.tsx` -> use the `react` row (takes precedence over the generic `*.tsx` row).

> [!TIP] **Indirect phrasing counts.** "make it faster" -> performance, "broken query" -> database, "login flow" -> auth.

<!-- SKILLS_INDEX_END -->

