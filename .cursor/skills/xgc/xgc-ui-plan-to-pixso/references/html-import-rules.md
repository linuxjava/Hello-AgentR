# HTML → Pixso（code_to_design）规则

帧 ID：`P-/H-/V-/O-/G-/DS-` 见 `../../references/frame-id-convention.md`。

## 画板根节点（约定，必须）

| 项 | 规则 |
| -- | ---- |
| 文件路径 | `docs/design/html/<ID>-<slug>.html`（例 `P-00-splash.html`） |
| 画板根 class | **与文件名 stem 相同**：`class="P-00-splash"` → 选择器 `div.P-00-splash` |
| 帧 ID 属性 | `data-frame-id="P-00"`（与 ui-plan ID 一致） |
| 可选 id | `id="P-00"`（便于对照 IXD） |
| 尺寸 | 根 `div` 内联 `width` / `height`（px），与 ui-plan 该帧一致 |

**HTML 文件结构：**

```html
<body>
  <div data-frame-id="P-00" id="P-00" class="P-00-splash"
       style="width:375px;height:812px;position:relative;overflow:hidden;...">
    <!-- 仅画板内图层，全部用 div + absolute 定位 -->
  </div>
</body>
```

- 画板外可有 `<html>` / `<body>`（仅本地预览），**Pixso 不导入它们**。
- 导入脚本 `pixso_code_to_design.py` 查找顺序：`div.{stem}` → `#` 帧 ID → `[data-frame-id]` →（旧）`pixso-import` 标记。

## 导入流程

1. 从 HTML 中 **只提取** `div.P-00-splash`（或对应 stem）的 outerHTML。
2. 读取该根节点上的 `width` / `height` 作为画板尺寸（改 ui-plan 尺寸时只改此处）。
3. 为绕过 Pixso 视口问题，脚本内部再包一层同尺寸的 `html/body` 壳后调用 MCP；**设计真理源仍是画板根 div**。

## 普通帧（P- / H- / V- / DS-）

- 仅用 `div` + 内联样式；子层 `position:absolute` + `left/top/width/height`。
- 不用 `button` / `input` / `form`；不用 `flex:1`、`right`、`bottom`、`opacity`、`rgba` 蒙层、`inset`。

## 叠加层（O- / G-）

1. `layer-bg`（可选）  
2. `layer-scrim`：全屏纯色蒙层（`#` 色值，非 rgba）  
3. `layer-sheet` / `layer-dialog` 等：显式 `left/top/width/height`

根节点仍遵守 `class="<stem>"`（例 `O-01-bottom-sheet`）。

## 导入后（用户操作）

1. 在 Pixso 图层树选中 **`div.P-00-splash`**（或对应 class）  
2. 确认尺寸 = 根 div 上的 width/height  
3. 重命名 Frame → ui-plan **ID**（如 `P-00`）  
4. 拖入 ui-plan §5 对应分区  

## 故障排查

| 现象 | 检查 |
| ---- | ---- |
| 找不到画板 | 是否存在 `class` = 文件名 stem（无 `.html`） |
| 画板变成整屏 | 是否误导入 `<body>`；用脚本重导，勿手贴整页 HTML |
| 尺寸不对 | 改画板根 `div` 的 width/height，不是改脚本常量 |
| 换基准尺寸 | 更新 ui-plan §9 → 改根 div 尺寸 → 重新导入该帧 |
