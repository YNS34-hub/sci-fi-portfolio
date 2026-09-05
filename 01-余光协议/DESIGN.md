---
name: "余光协议"
description: "一套把公共记忆呈现为太阳观测仪器的克制科幻视觉系统"
colors:
  civic-iron: "#081512"
  chamber-shadow: "#0d211c"
  raised-instrument: "#132b24"
  smoke-silver: "#b6bbb4"
  inspection-paper: "#d6d8d0"
  archive-white: "#e4e7df"
  witness-grey: "#a7afa8"
  dormant-grey: "#6f7e76"
  calibration-grey: "#8d958e"
  state-grey: "#7e8b83"
  placeholder-grey: "#87938c"
  selected-copy-grey: "#46544d"
  instrument-line: "#40544b"
  instrument-line-bright: "#697a71"
  afterglow-orange: "#d66d2f"
  afterglow-deep: "#8b3f1d"
  warning-skin: "#e7a184"
typography:
  display:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(3.6rem, 8vw, 6rem)"
    fontWeight: 430
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.8vw, 4.9rem)"
    fontWeight: 430
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  section-display:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.5vw, 4.25rem)"
    fontWeight: 430
    lineHeight: 1.08
  witness-quote:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 3.6vw, 3.85rem)"
    fontWeight: 430
    lineHeight: 1.35
  decision:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4.25rem)"
    fontWeight: 440
    lineHeight: 1
    letterSpacing: "-0.035em"
  outcome:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(1.65rem, 3.1vw, 3rem)"
    fontWeight: 480
    lineHeight: 1.15
  receipt-quote:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.2vw, 2.2rem)"
    fontWeight: 440
    lineHeight: 1.35
  hero-body:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.3vw, 1.12rem)"
    fontWeight: 400
    lineHeight: 1.75
  section-body:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "clamp(1.08rem, 1.6vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 620
    lineHeight: 1
  meta:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Geist, Microsoft YaHei UI, PingFang SC, Noto Sans CJK SC, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0px"
  aperture: "50%"
spacing:
  page-x: "clamp(1rem, 3.4vw, 4rem)"
  section-y: "clamp(5.5rem, 11vw, 10rem)"
  control-min-height: "48px"
components:
  button-primary:
    backgroundColor: "{colors.afterglow-orange}"
    textColor: "{colors.civic-iron}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.82rem 1.15rem"
    height: "{spacing.control-min-height}"
  button-primary-hover:
    backgroundColor: "{colors.inspection-paper}"
    textColor: "{colors.civic-iron}"
    rounded: "{rounded.square}"
  input-memory:
    backgroundColor: "{colors.civic-iron}"
    textColor: "{colors.archive-white}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "1rem"
---

# Design System: 余光协议

## Overview

**Creative North Star: "公共余晖观测站"**

这套系统把未来想象成一项已经进入日常运行的公共制度，而不是一场炫技。界面像一座处理证据、记忆和责任的太阳观测站：深色表面负责秩序，纸白表面负责检查，唯一有体温的橙色负责指出仍未被制度消化的事实。

视觉密度中等，文字和真实电影影像交替承担叙事。空间必须让访客感到一项决定正在被谨慎记录，而不是被营销。所有未来感都来自尺度、仪器逻辑、公共空间和人的选择。

**Key Characteristics:**

- 铁绿色公共机构空间
- 一条同时承担叙事和控制的余晖线
- 方角语义控件与圆形观测孔
- 克制的实拍科幻，不使用霓虹奇观
- 大标题、长留白和低频橙色共同制造压力

## Colors

色彩以近黑铁绿和低饱和银灰建立制度秩序，纸白用于短暂的检查状态，余晖橙只在仍需要被感到的地方出现。

### Primary

- **余晖橙**：主行动、焦点、进度、可拖动标记和真实日落的视觉联结。
- **余晖深橙**：浅色校准区内的强调色，避免亮橙在纸白表面失去重量。

### Neutral

- **公共铁绿**：全局背景和最深层空间。
- **舱室阴影**：回执与次级章节背景。
- **升起仪器绿**：禁用状态与少量层级差。
- **烟银**：孔径、机械线和冷静的制度材料。
- **检查纸白**：校准区与被选中的决定状态。
- **档案白**：主要正文和标题。
- **证言灰**：次级叙述、说明和注释。
- **仪器线**：分隔、输入边界和容器轮廓。

**The One Warm Signal Rule.** 一个视口只允许余晖橙成为主动色。它必须指向决定、证据或当前状态，不能用来填充装饰。

**The Paper Means Inspection Rule.** 纸白表面只在校准或选择被制度检查时出现，不能扩散成普通浅色卡片。

## Typography

**Display Font:** Geist，后备为中文系统无衬线  
**Body Font:** Geist，后备为中文系统无衬线  
**Label Font:** Geist，使用更高字重

**Character:** 字体保持公共机构的冷静与现代感。标题以紧字距、轻中等字重和接近一比一的行高形成电影级尺度，正文则依靠较松行高保持伦理文本的可读性。

### Hierarchy

- **Display**：仅用于首屏作品名，桌面端采用流体尺度，移动端保持足够占屏比例。
- **Headline**：章节命题和道德问题，通常限制在 10 至 14 个汉字宽度内。
- **Title**：证言、决定后果和回执内容。
- **Body**：解释性文本，行高宽松，单段不超过约 38rem。
- **Label**：导航、状态、输入标签和按钮，尺寸小但字重明确。

**The Question Carries Scale Rule.** 最大字号只给作品名和真正要求访客回答的问题，不给功能标题或装饰口号。

## Layout

桌面使用不对称双栏和三栏组合，首屏左侧文字不超过约三分之一宽度，右侧圆形观测孔主动越出画布。章节采用流体水平边距和大幅纵向节奏，避免均匀卡片堆叠。校准区切换为纸白整面，决定区使用 1.2 比 0.8 的不等宽行动边界，回执区采用 0.72 比 1 比 0.9 的三列。

1024px 以下逐步压缩双栏。767px 以下导航折叠，所有核心章节转为单列，时间线从水平变为垂直，决定按钮堆叠，观测孔仍保留越界尺度。420px 以下主行动与次级链接纵向排列。

**The Horizon Reappears Rule.** 余晖线必须在首屏、时间线和校准控件中反复出现，但每次都承担功能，不能作为无意义装饰线。

## Elevation & Depth

系统不使用卡片阴影。深度来自真实电影影像、圆形裁切、跨层线条、不同色域的整面切换以及黏性导航的轻微透明度。控件在按下时只下移 1px，避免漂浮感。

**The Flat Institution Rule.** 公共系统默认平整、坚硬、有边界。任何浮起都必须来自交互状态，而不是永久阴影。

## Shapes

语义控件、输入、按钮、容器和章节边界全部使用方角。圆形只属于观测孔、校准标记和地平线节点。两种几何的对比是系统的核心语法：方形代表制度，圆形代表仍在运动的光。

**The Circle Has Evidence Rule.** 大圆必须包含真实影像，小圆必须标记可测量状态。不要添加空心装饰圆。

## Components

### Buttons

- **Shape:** 方角，最小高度 48px。
- **Primary:** 余晖橙底、公共铁绿字、紧凑水平内边距。
- **Hover / Focus:** 悬停转为检查纸白；键盘焦点使用 2px 余晖橙外轮廓。
- **Ghost:** 透明背景和烟银边界，悬停时边界与文字转橙。

### Decision Actions

- 两个行动组成一条共同边界，不拆成独立卡片。
- 标题使用章节级流体字号，说明贴近底部。
- 悬停或选中时整面切换为纸白，文字回到公共铁绿。

### Inputs / Fields

- **Style:** 公共铁绿底、明亮仪器线、方角、1rem 内边距。
- **Focus:** 边界转为余晖橙，外部保留全局可见焦点。
- **Disabled:** 升起仪器绿底、休眠灰字，不改变布局。

### Navigation

导航固定在顶部，桌面保持品牌、章节和进入动作三段平衡。链接默认使用证言灰，悬停时从右向左显现一条橙线。移动端隐藏章节链接，只保留品牌和进入动作。

### Horizon Control

原生 range 控件保留键盘和触控行为，轨道前段由余晖橙显示已检查范围，拇指是带深色中心的圆形仪器节点。首屏版本与整页地平线对齐，校准版本在纸白表面使用深橙。

## Do's and Don'ts

### Do:

- **Do** 让每一个橙色元素对应当前证据、选择或进度。
- **Do** 使用真实电影感影像承担空间材料，不用界面特效替代场景。
- **Do** 保持标题短、正文诚实，并明确虚构证言与本地会话边界。
- **Do** 在移动端保留观测孔、证言人物和决定压力，而不是只做缩小版桌面。

### Don't:

- **Don't** 使用蓝紫霓虹、发光 HUD、通用科技网格或赛博朋克装饰。
- **Don't** 把章节拆成圆角卡片网格。
- **Don't** 给方角公共机构表面添加拟物金属浮雕或永久阴影。
- **Don't** 用更多动画稀释孔径揭示、页面进度和结果显现这三类核心运动。
