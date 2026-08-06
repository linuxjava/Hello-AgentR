STYLEKIT_STYLE_REFERENCE
style_name: 玻璃拟态
style_slug: glassmorphism
style_source: /styles/glassmorphism

# Hard Prompt

## 什么时候用
当你希望 AI 严格按风格规则生成代码时使用。它是生产界面最稳的默认选择。

## 怎么用
- 把完整提示词复制到 ChatGPT、Claude、Cursor 或其他编码助手。
- 在提示词后追加具体产品、页面或组件需求。
- 生成后按禁止项和交互状态检查，确认没有风格漂移。

请严格遵守以下风格规则并保持一致性，禁止风格漂移。

## 执行要求

- 优先保证风格一致性，其次再做创意延展。
- 遇到冲突时以禁止项为最高优先级。
- 输出前自检：颜色、排版、间距、交互是否仍属于该风格。

## Style Rules

# Glassmorphism (玻璃拟态) Design System

> 夜航质感的高级毛玻璃。深墨夜景配克制光源，玻璃只借光、不带色：高斯模糊、饱和度增强、受光顶边与噪点颗粒，营造真实玻璃的安静高级感。

## 核心理念

玻璃拟态的本质是光学，不是配色。真实的玻璃没有颜色——它只是借用、弯曲、柔化背后的光。这也是 Apple 在 Liquid Glass 材质规范里坚持的原则：玻璃从内容层取色，自己保持中性。

核心理念：
- 玻璃无色：面板只用白色低透明度（5%-12%），所有颜色来自背景场景
- 深色夜景：背景是接近黑的深墨蓝场景，配少量柔和光源（light wells），玻璃才有东西可折射
- 光有方向：顶边受光（inset 高光）、底边背光（inset 暗缘），这是真玻璃与"半透明色块"的分界线
- 唯一强调色：香槟金 #E4B863 只出现在主要动作和高亮文字，绝不大面积铺色
- 颗粒质感：2%-3% 噪点叠加消除塑料感
- 流体动效：所有过渡使用 spring easing，模拟玻璃的物理惯性

设计原则：
- 视觉一致性：所有组件必须遵循统一的视觉语言，从色彩到字体到间距保持谐调
- 层次分明：通过颜色深浅、字号大小、留白空间建立清晰的信息层级
- 交互反馈：每个可交互元素都必须有明确的 hover、active、focus 状态反馈
- 响应式适配：设计必须在移动端、平板、桌面端上保持一致的体验
- 无障碍性：确保色彩对比度符合 WCAG 2.1 AA 标准，所有交互元素可键盘访问

---

## Token 字典（精确 Class 映射）

### 边框
```
宽度: border
颜色: border-white/15
圆角: rounded-3xl
```

### 阴影
```
小:   shadow-[0_2px_8px_rgba(3,7,18,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]
中:   shadow-[0_8px_24px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.3)]
大:   shadow-[0_16px_48px_rgba(3,7,18,0.55),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.35)]
悬停: hover:shadow-[0_20px_60px_rgba(3,7,18,0.65),0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.32)]
聚焦: focus:shadow-[0_0_0_3px_rgba(228,184,99,0.18),0_8px_24px_rgba(3,7,18,0.45)]
```

### 交互效果
```
悬停位移: undefined
过渡动画: transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
按下状态: active:scale-[0.97]
```

### 字体
```
标题: font-semibold text-white
正文: text-white/80
```

### 字号
```
Hero:  text-4xl md:text-6xl
H1:    text-3xl md:text-5xl
H2:    text-2xl md:text-3xl
H3:    text-xl md:text-2xl
正文:  text-sm md:text-base
小字:  text-xs
```

### 间距
```
Section: py-16 md:py-24
容器:    px-6 md:px-8
卡片:    p-6 md:p-8
```

---

## [FORBIDDEN] 绝对禁止

以下 class 在本风格中**绝对禁止使用**，生成时必须检查并避免：

### 禁止的 Class
- `rounded-none`
- `rounded-sm`
- `rounded`
- `bg-white`
- `bg-black`
- `bg-gray-100`
- `bg-gray-900`
- `shadow-none`
- `backdrop-blur-sm`
- `backdrop-blur`
- `duration-100`
- `duration-150`
- `border-black`
- `border-gray-500`
- `from-indigo-600`
- `via-purple-600`
- `to-pink-500`

### 禁止的模式
- 匹配 `^rounded-none`
- 匹配 `^rounded-sm$`
- 匹配 `^rounded$`
- 匹配 `^bg-(?!white\/|gradient|\[|transparent)`
- 匹配 `^border-(?!white\/|\[)`
- 匹配 `^backdrop-blur$`
- 匹配 `^backdrop-blur-sm$`
- 匹配 `^duration-(100|150)$`

### 禁止原因
- `rounded-none`: Glassmorphism requires large rounded corners (rounded-2xl or rounded-3xl)
- `rounded-sm`: Glassmorphism requires large rounded corners (rounded-2xl or rounded-3xl)
- `rounded`: Glassmorphism requires large rounded corners (rounded-2xl or rounded-3xl)
- `bg-white`: Glassmorphism uses semi-transparent surfaces (bg-white/5 to bg-white/12)
- `bg-black`: Glassmorphism requires semi-transparent surfaces, not opaque colors
- `backdrop-blur-sm`: Glassmorphism requires high blur (backdrop-blur-[40px] or higher)
- `backdrop-blur`: Glassmorphism requires high blur (backdrop-blur-[40px] or higher)
- `duration-100`: Glassmorphism uses fluid animations (duration-500 with spring easing)
- `duration-150`: Glassmorphism uses fluid animations (duration-500 with spring easing)
- `border-black`: Glassmorphism uses luminous white borders (border-white/15 to border-white/35)
- `from-indigo-600`: The purple-pink AI gradient is the exact cliche this style rejects; use deep night scenes with light wells
- `via-purple-600`: The purple-pink AI gradient is the exact cliche this style rejects; use deep night scenes with light wells
- `to-pink-500`: The purple-pink AI gradient is the exact cliche this style rejects; use deep night scenes with light wells

> WARNING: 如果你的代码中包含以上任何 class，必须立即替换。

---

## [REQUIRED] 必须包含

### 按钮必须包含
```
bg-white/10 backdrop-blur-[40px] backdrop-saturate-[180%]
border border-white/20
rounded-2xl
text-white
shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)]
hover:bg-white/15 hover:border-white/35 hover:shadow-[0_10px_32px_rgba(3,7,18,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]
hover:-translate-y-0.5
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

### 卡片必须包含
```
bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%]
border border-white/15
rounded-3xl
shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)]
[background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)]
```

### 输入框必须包含
```
bg-white/6 backdrop-blur-[40px] backdrop-saturate-[180%]
border border-white/15
rounded-2xl
text-white placeholder-white/35
shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)]
focus:outline-none focus:border-white/35 focus:bg-white/10
focus:shadow-[0_0_0_3px_rgba(228,184,99,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

---

## [COMPARE] 错误 vs 正确对比

### 按钮

[WRONG] **错误示例**（使用了圆角和模糊阴影）：
```html
<button class="rounded-lg shadow-lg bg-blue-500 text-white px-4 py-2 hover:bg-blue-600">
  点击我
</button>
```

[CORRECT] **正确示例**（使用硬边缘、无圆角、位移效果）：
```html
<button class="bg-white/10 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/15 hover:border-white/35 hover:shadow-[0_10px_32px_rgba(3,7,18,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#ff006e] text-white px-4 py-2 md:px-6 md:py-3">
  点击我
</button>
```

### 卡片

[WRONG] **错误示例**（使用了渐变和圆角）：
```html
<div class="rounded-xl shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6">
  <h3 class="text-xl font-semibold">标题</h3>
</div>
```

[CORRECT] **正确示例**（纯色背景、硬边缘阴影）：
```html
<div class="bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%] border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)] p-6 md:p-8">
  <h3 class="font-semibold text-white text-xl md:text-2xl">标题</h3>
</div>
```

### 输入框

[WRONG] **错误示例**（灰色边框、圆角）：
```html
<input class="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500" />
```

[CORRECT] **正确示例**（黑色粗边框、聚焦阴影）：
```html
<input class="bg-white/6 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/15 rounded-2xl text-white placeholder-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)] focus:outline-none focus:border-white/35 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(228,184,99,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-3 py-2 md:px-4 md:py-3" placeholder="请输入..." />
```

---

## [TEMPLATES] 页面骨架模板

使用以下模板生成页面，只需替换 `{PLACEHOLDER}` 部分：

### 导航栏骨架
```html
<nav class="bg-white border-b-2 md:border-b-4 border-black px-4 md:px-8 py-3 md:py-4">
  <div class="flex items-center justify-between max-w-6xl mx-auto">
    <a href="/" class="font-black text-xl md:text-2xl tracking-wider">
      {LOGO_TEXT}
    </a>
    <div class="flex gap-4 md:gap-8 font-mono text-sm md:text-base">
      {NAV_LINKS}
    </div>
  </div>
</nav>
```

### Hero 区块骨架
```html
<section class="min-h-[60vh] md:min-h-[80vh] flex items-center px-4 md:px-8 py-12 md:py-0 bg-{ACCENT_COLOR} border-b-2 md:border-b-4 border-black">
  <div class="max-w-4xl mx-auto">
    <h1 class="font-black text-4xl md:text-6xl lg:text-8xl leading-tight tracking-tight mb-4 md:mb-6">
      {HEADLINE}
    </h1>
    <p class="font-mono text-base md:text-xl max-w-xl mb-6 md:mb-8">
      {SUBHEADLINE}
    </p>
    <button class="bg-black text-white font-black px-6 py-3 md:px-8 md:py-4 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm md:text-base">
      {CTA_TEXT}
    </button>
  </div>
</section>
```

### 卡片网格骨架
```html
<section class="py-12 md:py-24 px-4 md:px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="font-black text-2xl md:text-4xl mb-8 md:mb-12">{SECTION_TITLE}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Card template - repeat for each card -->
      <div class="bg-white border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 hover:shadow-[4px_4px_0px_0px_rgba(255,0,110,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(255,0,110,1)] hover:-translate-y-1 transition-all">
        <h3 class="font-black text-lg md:text-xl mb-2">{CARD_TITLE}</h3>
        <p class="font-mono text-sm md:text-base text-gray-700">{CARD_DESCRIPTION}</p>
      </div>
    </div>
  </div>
</section>
```

### 页脚骨架
```html
<footer class="bg-black text-white py-12 md:py-16 px-4 md:px-8 border-t-2 md:border-t-4 border-black">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <span class="font-black text-xl md:text-2xl">{LOGO_TEXT}</span>
        <p class="font-mono text-sm mt-4 text-gray-400">{TAGLINE}</p>
      </div>
      <div>
        <h4 class="font-black text-lg mb-4">{COLUMN_TITLE}</h4>
        <ul class="space-y-2 font-mono text-sm text-gray-400">
          {FOOTER_LINKS}
        </ul>
      </div>
    </div>
  </div>
</footer>
```

---

## [CHECKLIST] 生成后自检清单

**在输出代码前，必须逐项验证以下每一条。如有违反，立即修正后再输出：**

### 1. 圆角检查
- [ ] 搜索代码中的 `rounded-`
- [ ] 确认只有 `rounded-none` 或无圆角
- [ ] 如果发现 `rounded-lg`、`rounded-md` 等，替换为 `rounded-none`

### 2. 阴影检查
- [ ] 搜索代码中的 `shadow-`
- [ ] 确认只使用 `shadow-[Xpx_Xpx_0px_0px_rgba(...)]` 格式
- [ ] 如果发现 `shadow-lg`、`shadow-xl` 等，替换为正确格式

### 3. 边框检查
- [ ] 搜索代码中的 `border-`
- [ ] 确认边框颜色是 `border-black`
- [ ] 如果发现 `border-gray-*`、`border-slate-*`，替换为 `border-black`

### 4. 交互检查
- [ ] 所有按钮都有 `hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]`
- [ ] 所有卡片都有 hover 效果（阴影变色或位移）
- [ ] 都包含 `transition-all`

### 5. 响应式检查
- [ ] 边框有 `border-2 md:border-4`
- [ ] 阴影有 `shadow-[4px...] md:shadow-[8px...]`
- [ ] 间距有 `p-4 md:p-6` 或类似的响应式值
- [ ] 字号有 `text-sm md:text-base` 或类似的响应式值

### 6. 字体检查
- [ ] 标题使用 `font-black`
- [ ] 正文使用 `font-mono`

> CRITICAL: **如果任何一项检查不通过，必须修正后重新生成代码。**

---

## [EXAMPLES] 示例 Prompt

### 1. 夜航玻璃仪表盘

深夜景毛玻璃数据面板

```
Create a nocturne glassmorphism dashboard with:
1. Background: deep ink #0B1322 with three soft radial light wells — rgba(124,156,196,0.28) top right, rgba(51,81,122,0.35) bottom left, rgba(228,184,99,0.12) center accent
2. Film grain: full-viewport 2.5% SVG feTurbulence noise overlay
3. Top nav: fixed, bg-white/6 backdrop-blur-[60px] backdrop-saturate-[180%], border-b border-white/10
4. Stat cards: bg-white/8 backdrop-blur-[60px], directional shadows (outer depth + inset top highlight + inset bottom shade), key numbers in champagne #E4B863, hover lift
5. Chart area: large colorless glass panel; chart line in moonlight #7C9CC4 with champagne highlight point
6. All transitions: duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
7. Specular sweep on card hover; NO purple-pink gradients anywhere
```

### 2. 夜航玻璃登录页

安静高级的深夜毛玻璃登录页

```
Create a nocturne glassmorphism login page with:
1. Background: near-black #060A13 to #0B1322, one moonlight well rgba(124,156,196,0.25) upper right, one faint champagne well rgba(228,184,99,0.1) lower left, 2.5% film grain
2. Login card: centered, bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%], rounded-3xl, shadow with inset top highlight and inset bottom shade
3. Inner luminance: gradient overlay from-white/12 to transparent at top
4. Inputs: bg-white/6, inset shade, focus ring rgba(228,184,99,0.15)
5. Submit button: the ONLY champagne element — bg-[#E4B863]/15 border-[#E4B863]/40 text-[#F3DCA8]
6. Serif display headline (e.g. Playfair Display) over the glass for editorial luxury
7. All corners rounded-2xl or rounded-3xl, spring easing transitions
```

### 3. 夜航玻璃音乐播放器

沉浸式深夜毛玻璃音乐播放器

```
Create a nocturne glassmorphism music player with:
1. Background: blurred album art darkened with a rgba(6,10,19,0.6) scrim so the glass stays readable, plus 2.5% film grain
2. Player card: bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%], rounded-3xl, directional shadows
3. Album art: rounded-2xl with border-white/15 frame and inset top highlight
4. Controls: colorless glass buttons; the play button is the single champagne accent (#E4B863/15 fill, #F3DCA8 icon)
5. Progress bar: glass track bg-white/8; fill in moonlight #7C9CC4; thumb with champagne ring on drag
6. Playlist: glass sidebar with hover-highlighted rows (hover:bg-white/8)
7. All transitions spring easing; NO purple-pink gradients
```

## 绝对禁止（匹配即拒绝）

以下模式一旦出现，视为风格违规——不找借口，直接重写。

- 紫粉 AI 渐变背景（#667eea、#764ba2、#f093fb 一类的 indigo-purple-pink 组合）
- 在纯色平面背景上使用（必须有光源或图片，玻璃才有东西可模糊）
- 玻璃透明度超过 15%（会变成实心色块，失去玻璃感）
- 使用低模糊值 backdrop-blur-sm 或 backdrop-blur
- 省略 backdrop-saturate（饱和度增强让暗景光源透过玻璃发亮）
- 给玻璃面板本身上色（玻璃无色，颜色属于背景）
- 使用不透明背景 bg-white, bg-black
- 使用快速过渡 duration-100, duration-150

## 自检清单（交付前逐条确认）

如果任何一条不通过，说明风格漂移了——修改后再交付。

- [ ] 没有紫色到蓝色的渐变
- [ ] 没有使用 Inter / Roboto / Geist 等过度使用的字体
- [ ] 没有嵌套卡片（卡片里面套卡片）
- [ ] 没有在彩色背景上放灰色文字
- [ ] 正文对比度满足 WCAG AA（≥4.5:1）
- [ ] 没有 bounce / elastic 缓动曲线
- [ ] 动效有 prefers-reduced-motion 备选方案
- [ ] 正文行宽不超过 65-75 个字符
- [ ] 没有单侧粗边框装饰（border-left/right accent stripe）
- [ ] 没有渐变文字（background-clip: text）
- [ ] 没有把玻璃态（glassmorphism）当作默认风格
- [ ] 没有 tiny uppercase tracked eyebrow 放在每个 section 标题上面
- [ ] 禁止紫粉 AI 渐变背景（#667eea、#764ba2、#f093fb 一类的 indigo-purple-pink 组合）
- [ ] 禁止在纯色平面背景上使用（必须有光源或图片，玻璃才有东西可模糊）
- [ ] 禁止玻璃透明度超过 15%（会变成实心色块，失去玻璃感）
- [ ] 禁止使用低模糊值 backdrop-blur-sm 或 backdrop-blur
- [ ] 禁止省略 backdrop-saturate（饱和度增强让暗景光源透过玻璃发亮）