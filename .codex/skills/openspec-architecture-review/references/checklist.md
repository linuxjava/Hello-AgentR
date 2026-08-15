# Architecture review checklist (pre-Apply)

Evaluate `design.md` (+ proposal out-of-scope / grill-engineering skip notes).

| ID | FAIL if |
| -- | ------- |
| R1 | design 未声明适用栈，或未写明已阅读对应 `docs/architecture-decisions/<stack>.md`（文件不存在时未写「基线待建 + 本栈取舍」） |
| R2 | 适用基线有章节被变更触及，但 design 未响应且无 `N/A + why`（backend 对照 A–G） |
| R3 | proposal 声称跳过 grill-engineering，但 change 触及 API / 持久化 / 外部 I/O / 双写 |
| R4 | design 记载的栈级决策与 tasks 脱节（无对应验证 task） |
| R5 | design 与已引用的 `docs/adr/*` 冲突且未说明 |

## Stack files

| Prefix | Baseline |
| ------ | -------- |
| `backend-` | `docs/architecture-decisions/backend.md` |
| `frontAdm-` | `docs/architecture-decisions/react-admin.md` |
| `front-` | `docs/architecture-decisions/react-web.md` |
| `mobile-` | `docs/architecture-decisions/flutter.md` |

## Output

`Architecture review: PASS | FAIL — R# …`
