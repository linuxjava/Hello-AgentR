---
name: xgc-ui-plan-to-pixso
description: >-
  按已确认的 ui-plan，一次一帧产出静态 HTML 并通过 Pixso code_to_design 导入画板。
  Use when the user explicitly asks for Pixso 出图、HTML 导入设计稿、code_to_design、
  或指定 ui-plan 中某一帧的视觉实现 — not when drafting PRD/IXD/ui-plan only.
metadata:
  triggers:
    files:
      - 'docs/specs/ui-plan-*.md'
      - 'docs/design/html/*.html'
    keywords:
      - pixso
      - code_to_design
      - HTML 出图
      - 导入设计稿
      - 画板生成
      - ui-plan to pixso
---

# UI Plan → Pixso（逐步出图）

## 触发条件（必须满足）

- 用户**明确**要 Pixso 出图 / HTML 导入 / `code_to_design`，或指定 ui-plan 中的**某一帧 ID**。
- **前置**：`ui-plan` 已确认（种子色等待决项已拍板或按 ui-plan 默认值执行）。
- **不触发**：仅写 PRD、IXD、ui-plan；未指定帧 ID 且未同意「从出图顺序第 1 帧开始」。

## 角色与边界

- **产出**：单帧 HTML + 导入 Pixso；说明给用户的中文操作提示。
- **不写**：PRD/IXD/ui-plan 正文、Flutter/前端业务代码。
- **节奏**：**一次只处理一帧**；完成后停止，等用户确认再下一帧（除非用户明确要求批量）。

## 输入 / 输出

| 输入 | 默认路径 |
| ---- | -------- |
| UI Plan | `docs/specs/ui-plan-<feature>.md` |
| HTML | `docs/design/html/<ID>-<slug>.html`（ID 含 P/H/V/O/G/DS 前缀） |

| 环境 | 说明 |
| ---- | ---- |
| Pixso 客户端 | 用户本地已打开 |
| Pixso MCP | 默认 `http://127.0.0.1:3667/mcp`（以 `~/.cursor/mcp.json` 为准） |

## 工作流（单帧）

1. **确认意图与帧 ID** — 从 ui-plan §4 / §10 取该帧的尺寸、类型、令牌；未决项未闭合则 Ask。
2. **前缀分支** — ID 以 `O-` 或 `G-` 开头时，加载 `references/html-import-rules.md` §叠加层；`DS-` 用宽画板规则；`P-/H-/V-` 用常规范。
3. **写 HTML** — 画板内容包在 **`div.<stem>`**（`P-00-splash.html` → `class="P-00-splash"`），并设 `data-frame-id` / `id` 与 ui-plan 帧 ID 一致；根 div 内联 width/height（与 ui-plan §9 一致）。色/字/间距取自 ui-plan §3。
4. **导入** — `pixso_code_to_design.py` **按 class stem 查找画板根 div** 后调 MCP `code_to_design`（勿手传整页 HTML）。
5. **交付说明（中文）** — 在 Pixso 中选中 `div.<stem>`，确认尺寸，重命名为 ui-plan **ID**（如 `P-00`），归入 §5 分区。
6. **停止** — 汇报本帧路径与导入结果；不自动下一帧。

## HTML 导入约束（Pixso code_to_design）

- 仅用 `div` 布局，不用 `button` / `input` / `form`。
- 颜色与尺寸以 **ui-plan** 为准，不新增计划外色值。
- 叠加层：见 `references/html-import-rules.md`（纯色蒙层、显式 px 定位）。
- 避免：父级 `opacity`、`inset` 简写、半透明 `rgba` 蒙层（易导致导入错位）。

## MCP 兜底

```bash
python .cursor/skills/xgc/xgc-ui-plan-to-pixso/scripts/pixso_code_to_design.py <path-to.html>
```

可选环境变量：`PIXSO_MCP_URL`（默认 `http://127.0.0.1:3667/mcp`）。

## 规则

- ui-plan 列出的帧 ID **不得改名**；不新增计划外帧。
- 截图/预览仅用于核对，**不以含浏览器外壳的截图**作为画板尺寸依据。
- 批量导入须用户**明确授权**。

## 反模式

- 不擅自改 ID 前缀（如把 O-01 改成 dialog-01）。
- 不在此 skill 内重写 ui-plan 或 IXD。

## 参考

- `../references/frame-id-convention.md`
- `references/html-import-rules.md`
- `scripts/pixso_code_to_design.py`
