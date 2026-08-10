---
name: xgc-ixd-to-ui-plan
description: >-
  根据 PRD 与 IXD 编写中文 UI 计划（ui-plan）：视觉定位、设计令牌、全帧清单、设计工具分区与出图顺序、待决项。
  Use when the user explicitly asks for UI计划、ui-plan、页面清单、设计规范规划、出图顺序 —
  not when writing IXD only, PRD only, or requesting HTML/Pixso/Figma 导入.
metadata:
  triggers:
    files:
      - 'docs/specs/ixd-*.md'
      - 'docs/specs/ui-plan-*.md'
      - 'docs/specs/prd-*.md'
    keywords:
      - ui-plan
      - UI计划
      - 页面清单
      - 设计规范规划
      - 出图顺序
      - ixd to ui-plan
---

# PRD + IXD → UI 计划（ui-plan）

## 触发条件（必须满足）

- 用户**明确**要 UI 计划 / ui-plan / 页面清单 / 设计规范规划 / 出图顺序。
- **不触发**：仅写 IXD、仅改 PRD、直接要 HTML/设计稿导入（交 `xgc-ui-plan-to-pixso`）。

## 角色与边界

- **产出**：视觉与交付规划（§1–§11 一体文档：令牌、分前缀帧表、工具内分区、出图顺序、待决项）。
- **不写**：完整交互叙述（引用 IXD）、实现代码、HTML、设计工具 API 调用。
- **语言**：ui-plan 正文默认**中文**。

## 输入 / 输出

| 输入 | 默认路径 |
| ---- | -------- |
| PRD | `docs/specs/prd-<feature>.md` |
| IXD | `docs/specs/ixd-<feature>.md` |

| 输出 | 默认路径 |
| ---- | -------- |
| UI Plan | `docs/specs/ui-plan-<feature>.md` |

IXD 无屏/态清单或 ID 不一致 → **追问或对齐 IXD**，不擅自改名、不删态。

## 文档结构（必须遵守）

按 `references/ui-plan-template.md` 的 **§1–§11** 分节输出（**禁止**压成单表 7 列简版）：

| 节 | 内容 |
| -- | ---- |
| §1 | 文档目的、out-of-scope 引用 |
| §2 | 设计定位表（产品类型、风格、色彩/字体/暗色策略） |
| §3 | 设计系统：3.1 主色候选 → 3.2 语义色 → 3.3 字阶 → 3.4 间距 → 3.5 图标 → 3.6 动效 → 3.7 C-*（可选） |
| §4 | 全帧清单：4.1 Mermaid → **4.2 P-** → **4.3 H-** → **4.4 V-** → **4.5 O-** → **4.6 G-** → **4.7 不出图** |
| §5 | 设计文件目录树 + **出图顺序** + 帧数量 |
| §6 | 列表行 / 多选等视觉布局摘要（细节指 IXD） |
| §7 | 文案 Key 表（与 IXD 一致） |
| §8 | PRD/IXD 对齐表 |
| §9 | 待决事项 |
| §10 | 变更记录 |
| §11 | 关联文档路径 |

> **结构密度参考**：仓库内已批准的 `docs/specs/ui-plan-*.md` 实例（仅学 **分节与表粒度**，不得复制其业务文案、路由、色值）。

## 工作流

1. **确认意图** — 未满足触发条件则停止。
2. **读 PRD + IXD** — scope、out-of-scope；IXD §4 屏/态 **1:1** 落入 §4.2–§4.6（可标主流程子集，须在 §9 说明范围）。
3. **加载模板** — `references/ui-plan-template.md`，按 §1–§11 填空。
4. **§2 设计定位** — 产品气质、场景、明/暗；技术栈**仅当 PRD/项目已声明**（不默认 Flutter/M3）。
5. **§3 设计系统** — 语义色与字阶/间距；未定主色在 §3.1 列 A/B/C 并在 §9 登记。
6. **§4 帧表** — **沿用 IXD 的 P/H/V/O/G/DS ID**；每表列：触发条件、关键 UI（非完整交互复述）；§4.1 Mermaid 与表 ID 一致。
7. **§5 工具结构** — Cover / Design System / Screens 分区 / Overlays；写明推荐出图顺序（默认：DS → 主列表态 H/V → O → 空态/多选 → P-00，见 `frame-id-convention.md`）。
8. **§6–§8** — 布局视觉摘要、文案 Key、PRD 映射。
9. **§9 待决** — 种子色、画板尺寸、IXD 开放问题、出图范围。
10. **停止** — 摘要 + **等用户确认**后再做 HTML/设计导入。

## 规则

- IXD 中的屏/态/叠加层 **ID 不得改名**；ui-plan 只增尺寸、分区、顺序、视觉说明。
- PRD out-of-scope → 不得出现在 §4.2–§4.6；可写入 §4.7。
- 画板尺寸：写**项目约定**；无约定时在 §9 标注，不硬编码机型（模板中 375×812 仅为示例占位）。
- **通用性**：模板与产出不得绑定单一 App 名称、包名、`lib/` 路径；示例色值须来自 PRD/IXD 或标为待决。

## 反模式

- 不用单表合并 P/H/V/O（必须用 §4.2–§4.6 分表）。
- 不重复 IXD 全文（用「见 IXD §x / 帧 ID」引用）。
- 不将 H-/V- 合并为无前缀「态」ID。
- 不生成 HTML、不调用 Pixso/Figma MCP。

## 参考

- `../references/frame-id-convention.md`
- `references/ui-plan-template.md`
