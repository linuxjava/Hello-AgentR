# 架构决策（按技术栈）

按技术栈存放**主动基线**（架构、性能、一致性、安全、可观测性等），供 OpenSpec `design` 引用。  
与 [`docs/adr/`](../adr/) 的区别：`adr/` 为编号的系统级单点决策；本目录为**按栈的通用基线**。修订本目录 = 演进标准。

| 文件                       | Change 前缀   | 栈              | 状态   |
| ------------------------ | ----------- | -------------- | ---- |
| [backend.md](backend.md) | `backend-`  | Spring Boot 后端 | 基线已建 |
| `react-admin.md`         | `frontAdm-` | React 管理端      | 待建基线 |
| `react-web.md`           | `front-`    | React 用户端      | 待建基线 |
| `flutter.md`             | `mobile-`   | Flutter        | 待建基线 |

路由：`openspec/config.yaml`。地图：[CONTEXT-MAP.md](../../CONTEXT-MAP.md)。

## 工作流执行顺序

| 顺序   | 做什么            | 触发                                       |
| ---- | -------------- | ---------------------------------------- |
| 1    | 领域 grilling    | `grill-with-docs`                        |
| 2    | 工程 grilling    | `grill-engineering`（对照本目录基线）             |
| 3    | 生成 OpenSpec 制品 | `/opsx:propose <前缀-名称>`（`backend-` / `frontAdm-` / `front-` / `mobile-`） |
| 4    | 补齐制品（按需）       | `/opsx:continue`                         |
| 5    | Apply 前架构审查    | 说「跑 `openspec-architecture-review`」→ 须 **PASS** |
| 6    | 实现             | `/opsx:apply`（也会先做审查；FAIL 则停）            |
| 7    | 核对             | `/opsx:verify`                           |
| 8    | 归档             | `/opsx:archive`（按需再 `/opsx:sync`）        |

纯文案 / 纯布局且无新 API 时可跳过步骤 2 与严格审查，但须在 proposal 写明跳过理由。
