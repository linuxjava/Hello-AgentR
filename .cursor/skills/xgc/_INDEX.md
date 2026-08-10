# xgc — 设计交付流水线（项目本地）

PRD → IXD → ui-plan → Pixso。帧 ID：**P/H/V/O/G/DS**（见 `references/frame-id-convention.md`）。加载：`<SKILLS>/xgc/<skill>/SKILL.md`。

## File Match

| Skill | File pattern | Keywords |
| ----- | ------------ | -------- |
| **xgc-prd-to-ixd** | `docs/specs/prd-*.md`, `docs/specs/ixd-*.md` | 交互设计, IXD, interaction design, 线框说明, 用户流程说明, prd to ixd |
| **xgc-ixd-to-ui-plan** | `docs/specs/ixd-*.md`, `docs/specs/ui-plan-*.md`, `docs/specs/prd-*.md` | ui-plan, UI计划, 页面清单, 设计规范规划, 出图顺序, ixd to ui-plan |
| **xgc-ui-plan-to-pixso** | `docs/specs/ui-plan-*.md`, `docs/design/html/*.html` | pixso, code_to_design, HTML 出图, 导入设计稿, 画板生成, ui-plan to pixso |

## Keyword Match

| Skill | Match when user mentions |
| ----- | ------------------------ |
| **xgc-prd-to-ixd** | 交互设计, IXD, 线框说明, PRD 转 IXD |
| **xgc-ixd-to-ui-plan** | UI计划, ui-plan, 页面清单, 出图顺序 |
| **xgc-ui-plan-to-pixso** | Pixso 出图, HTML 导入设计稿, code_to_design |

> 各 skill 要求用户**明确意图**后才执行；仅打开 spec 文件不自动跑全流程。

## 顺序

1. `xgc-prd-to-ixd` → 2. `xgc-ixd-to-ui-plan` → 3. `xgc-ui-plan-to-pixso`（每步需人工 review）
