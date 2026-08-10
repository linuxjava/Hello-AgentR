---
name: xgc-prd-to-ixd
description: >-
  将已确认的 PRD 转为中文交互设计说明（IXD）：信息架构、屏/态清单、手势、文案意图、AC 追溯。
  Use when the user explicitly asks for 交互设计、IXD、interaction spec、线框说明、用户流程说明、
  or PRD to IXD — not when only editing PRD or requesting visual/UI plan/Pixso.
metadata:
  triggers:
    files:
      - 'docs/specs/prd-*.md'
      - 'docs/specs/ixd-*.md'
    keywords:
      - 交互设计
      - interaction design
      - IXD
      - 线框说明
      - 用户流程说明
      - prd to ixd
---

# PRD → 交互设计（IXD）

## 触发条件（必须满足）

- 用户**明确**要交互设计 / IXD / 线框说明 / 用户流程说明，或要求「PRD 转 IXD」。
- **不触发**：仅写/改 PRD、补 AC、要 UI 计划/视觉稿/Pixso/Figma（交其他 skill）。

## 角色与边界

- **产出**：交互规格（用户做什么、在什么状态下看到什么、如何反馈）。
- **不写**：视觉稿、色值、组件库、实现代码、API/库表。
- **语言**：IXD 正文默认**中文**（缩写如 IXD、AC 可保留）。

## 输入 / 输出

| 输入 | 默认路径（项目可另有约定） |
| ---- | ------------------------- |
| PRD | `docs/specs/prd-<feature>.md` |

| 输出 | 默认路径 |
| ---- | -------- |
| IXD | `docs/specs/ixd-<feature>.md` |

PRD 缺关键行为/边界 → **向用户追问**（见下节），不臆造业务规则。

## PRD 疑问与追问

执行本 skill 过程中，凡 PRD **未写清、自相矛盾、或与 IXD 必需信息缺口** 导致无法定稿交互的，**必须先向用户追问**，再写 IXD 正文；不得用惯例、实现假设或「SRS 定稿」一笔带过（除非 PRD 已明确 defer 给 SRS 且 IXD 仅需标 TBD）。

| 应追问 | 不追问（可标 TBD 或按 PRD 复述） |
| ------ | -------------------------------- |
| 主路径/异常分支行为不明 | 纯视觉、组件库、色值（属 ui-plan） |
| 删除/权限/空态等交互范围或文案意图不明 | PRD 已写 defer SRS 且 IXD 只需占位说明 |
| 两条 AC/REQ 冲突 | PRD 已明确的性能数字（IXD 不改指标） |
| out-of-scope 边界模糊（是否允许某入口） | 帧 ID 命名（按 frame-id-convention） |

**追问格式**：编号列出问题；每条附 PRD 章节/REQ/AC 引用与当前理解；说明缺什么信息才能写对应屏/手势/文案。用户回复前：**可输出已无疑问的章节草稿**，但疑点对应段落标 **TBD** 或暂停该段，**不编造**规则。

## 工作流

1. **确认意图** — 未满足「触发条件」则停止，不执行本 skill。
2. **读 PRD** — scope、out-of-scope、REQ/AC、主路径与异常；整理疑问清单 → **有疑点则先追问用户**，无疑点或已获答复后再继续。
3. **加载模板** — `references/ixd-template.md`。
4. **屏与态清单** — 按 **P/H/V/O/G/DS** 前缀赋 ID（见 `../references/frame-id-convention.md`）；表含 ID、前缀类型、名称、挂载父级、入口、出口；全文 ID 一致。
5. **逐条规格** — 每 ID：目标、ASCII 线框、状态表、手势→结果、中文文案（可选 Key）。
6. **追溯** — AC-* → IXD 章节/屏 ID。
7. **停止** — 输出变更摘要；**等用户确认**后再做 UI 计划或视觉（不自动续做）。

## 规则

- PRD **out-of-scope** → IXD 不得出现对应入口/屏。
- 交互细节（删除确认、权限、离线等）**仅复述 PRD**；PRD 未写则 **向用户追问**（§PRD 疑问与追问），不写项目惯例默认值。
- 性能/指标数字以 PRD 为准；IXD 只描述加载/空/错等**态**，不改指标。

## 反模式

- 不绑定技术栈（Flutter、M3、双端等除非 PRD 写明）。
- 不用无前缀或纯数字 ID（不利于阅读与 Pixso 对齐）。
- 不写 hex、不生成 ui-plan / HTML / 设计工具导入。
- 不因「想一次出完整 IXD」而跳过追问；疑点未闭合时不得把猜测写成确定交互。

## 参考

- `../references/frame-id-convention.md` — P/H/V/O/G/DS 前缀与序号规则
- `references/ixd-template.md` — 中文章节骨架
