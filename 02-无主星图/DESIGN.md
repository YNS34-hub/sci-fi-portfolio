---
name: 无主星图
description: 一座以克制为主要交互的暗房星谱档案
colors:
  ink: "#0b0b0d"
  ink-raised: "#111114"
  ink-soft: "#18181b"
  ink-hover: "#2a2926"
  bone: "#e9e6da"
  bone-dim: "#bdb9ac"
  bone-faint: "#918d82"
  plate-paper: "#ccc6b4"
  cobalt: "#376da8"
  cobalt-dark: "#244f86"
  selenium: "#d64a32"
  sulfur: "#e2b64e"
  rule: "#3e3d39"
typography:
  display:
    fontFamily: "Songti SC, STSong, Noto Serif SC, Source Han Serif SC, Georgia, serif"
    fontSize: "clamp(3.7rem, 4.4vw, 4.8rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Songti SC, STSong, Noto Serif SC, Source Han Serif SC, Georgia, serif"
    fontSize: "clamp(3.4rem, 6vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Songti SC, STSong, Noto Serif SC, Source Han Serif SC, Georgia, serif"
    fontSize: "1.65rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Geist, Noto Sans SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.68
  label:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.63rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  square: "0"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section-x: "clamp(1.5rem, 6vw, 7rem)"
  section-y: "clamp(5.5rem, 8vw, 8.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bone}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.7rem 1rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.bone}"
    rounded: "{rounded.square}"
  button-decision:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bone-dim}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "1.2rem 0.8rem"
    height: "150px"
  button-decision-selected:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  charter-receipt:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "clamp(2rem, 4vw, 4.5rem)"
---

# Design System: 无主星图

## Overview

**Creative North Star: "暗房星谱档案"**

《无主星图》像一张放在射电天文暗房工作台上的玻璃底片：近黑空间承载未知，骨白接触印样承载证据，少量钴蓝、硒红与硫黄只从光谱、警戒与标记材料中出现。界面不是通用太空 HUD，也不把未知包装成可消费的目的地；它用显影、对焦、抽片和后果账本把“发现创造义务”变成可操作的视觉秩序。

系统在大幅电影影像与微型档案索引之间保持强烈尺度差。硬边网格、穿孔、细规则线、银盐颗粒和纸质检验单构成材料连续性；宽阔留白不是奢华装饰，而是给观察与撤回保留时间。所有交互都应像机械装置产生可追溯的状态变化，而不是凭空出现的光效。

**Key Characteristics:**

- 暗房近黑与摄影骨白构成主场，三种色彩只服务于光谱、风险和生命信号。
- 宋体大标题与等宽微标注形成极端尺度差，正文保持安静、可长读。
- 所有主要表面直角、硬边，以规则线和材料层次而非圆角卡片组织信息。
- 运动来自显影、插片、对焦与机械导轨，并尊重减少动态效果设置。
- 三组 21:9 电影记录是证据主体，界面始终把行动后果放在奇观之前。

## Colors

色彩是一套暗房材料体系：墨黑承载未知，骨白承载证据，三种信号色分别标记观察、接触风险与生命义务。

### Primary

- **暗房近黑**：页面底色、底片间隙、决策按钮与深色容器的默认表面。
- **摄影骨白**：正文、接触印样、被选中的决策与最终公约收据。

### Secondary

- **潮汐钴蓝**：弥涌章节、观察光谱与低温信号的章节身份。
- **硒红警戒**：葳昼章节、显影滑尺和不可逆接触风险。
- **硫黄生命信号**：斜暮章节、可见焦点、勾选状态和后果账本中的义务。

### Neutral

- **抬升墨黑**：公约区域和深色表面的轻微层级变化。
- **柔化墨黑**：悬停反馈与相邻底片之间的暗色分隔。
- **墨黑悬停**：骨白收据上主要按钮的悬停状态。
- **骨白次级**：深色背景上的解释正文与镜头日志。
- **骨白残影**：索引、坐标、脚注和低优先级档案文字。
- **底片纸色**：首屏接触底片的物理基底。
- **石墨规则线**：网格、章节边界、表格和容器的结构骨架。

### Named Rules

**The Darkroom Rule.** 信号色必须看起来来自背光、乳剂、滤镜、油性铅笔或警示胶带；不得演变成霓虹、蓝紫渐变或发光按钮。

**The Evidence First Rule.** 骨白大表面只用于证据、比较与公约，不把整页漂白成营销落地页。

## Typography

**Display Font:** Songti SC（回退至 STSong、Noto Serif SC、Source Han Serif SC、Georgia）
**Body Font:** Geist（回退至 Noto Sans SC、Microsoft YaHei）
**Label/Mono Font:** Geist Mono（回退至 SFMono-Regular、Consolas）

**Character:** 宋体承担电影片名、伦理命题与世界名称的重量；无衬线正文承担阅读；等宽微标注把编号、波长、坐标和状态锁进档案语气。三者分工明确，不用花体或未来感字形制造科幻感。

### Hierarchy

- **Display**（500，流体大号，紧凑行高）：仅用于首屏价值钩子，宽度保持在约八个汉字以内。
- **Headline**（500，流体超大号，紧凑行高）：用于章节、比较和公约的主要标题，通常限制在 11–12 个汉字宽。
- **Title**（500，中型衬线）：用于世界标签、决策后果、镜头名与收据标题。
- **Body**（400，标准字号，宽松行高）：用于叙事、科学说明和伦理后果，阅读行长通常不超过 65–68 个字符。
- **Label**（400，微型等宽、宽字距）：用于编号、曝光记录、字段名和状态，不承担长段阅读。

### Named Rules

**The Scale Contrast Rule.** 一张屏幕必须同时存在有重量的衬线命题与安静的等宽证据标签；不要用一套中号无衬线覆盖所有层级。

**The Archive Voice Rule.** 大写英文只用于短档案状态，中文负责意义；不使用伪科幻术语堆叠气氛。

## Layout

桌面采用硬边分栏：72px 粘性总账导航置顶，首屏左侧为约 29vw 的价值钩子，右侧为三格接触底片。内容章节以 12 列镜头网格展开，第一幅横跨全宽，第二、三幅各占六列；世界标题以三栏并置名称、说明与伦理问题。页面横向内边距采用流体值，章节纵向留白也随视口扩大，形成暗房工作台而非卡片瀑布。

1120px 以下首屏只保留一个可见底片格并重排世界标题；820px 以下转为单列，顶部索引成为第二条 40px 导轨，三张首屏底片改为横向吸附轨道，镜头、决策、比较与公约全部堆叠；520px 以下三项决策改为纵向机械开关。触摸端提供“横向滑动”提示，锚点为粘性导航保留滚动偏移。

**The Plate Rhythm Rule.** 用细规则线、跨栏和宽阔章节间距建立秩序；不要用重复圆角卡片和均匀三栏营销模块填满空白。

## Elevation & Depth

系统以材料叠层为主、阴影为辅。大多数深色表面保持平面，边界来自规则线；只有真实可拿起的对象——接触底片、曝光票、完整系列印样和公约收据——获得阴影。全局银盐颗粒以极低不透明度覆盖，底片、纸张和检验单另有局部纹理，深度必须看起来来自物理堆叠。

### Shadow Vocabulary

- **接触底片阴影**：用于首屏厚重玻璃底片，使其从近黑光台上抬起。
- **曝光票阴影**：较短的偏移阴影，配合轻微旋转，表现纸票贴在底片上。
- **接触印样阴影**：用于九幅系列总览，表现大张纸质印样。
- **公约工作台阴影**：用于最终生成器的整块深色容器，不施加于每一条条款。

### Named Rules

**The Lift Only What Can Be Held Rule.** 阴影只属于可被抽出、贴上、翻阅或递交的物件；导航、章节和普通文本不悬浮。

## Shapes

形态以直角和一像素规则线为默认。接触底片、镜头、按钮、表格、票据与公约均保持方形边角；视觉个性来自穿孔、裁切、底片比例、轻微纸张旋转和局部遮罩。圆形只保留给首屏真实放大镜及其光学遮罩，它是工具而不是通用组件语言。

**The Hard Edge Rule.** 除物理放大镜外不引入圆角、胶囊或玻璃面板；状态变化通过色反转、边线和位移表达。

## Components

组件像暗房设备：克制、可读、硬边，状态必须留下明确痕迹。

### Buttons

- **Shape:** 直角、无圆角，最小触控高度 48px；主行动使用实心近黑与骨白文字。
- **Primary:** 公约复制按钮使用紧凑水平内边距、细边线和图标；停用时退为空白纸面、灰色边线与灰色文字。
- **Hover / Focus:** 悬停只轻微抬高墨黑层级；键盘焦点统一使用 2px 硫黄外轮廓和 4px 偏移。
- **Decision:** 三项决策在桌面形成共享边线的三格机械面板；默认近黑，悬停柔化，选中时整体反转为骨白。

### Chips

- **Style:** 不使用装饰性胶囊。世界决策摘要以等宽小字放入共享规则线网格。
- **State:** 状态来自文字与所在格，不以彩色圆角徽章代替后果说明。

### Cards / Containers

- **Corner Style:** 直角。
- **Background:** 深色章节保持近黑；证据、比较和收据使用骨白或底片纸色。
- **Shadow Strategy:** 只有可持有的物理对象使用阴影，其余容器用规则线分层。
- **Border:** 一像素石墨或材料对应的灰色边线。
- **Internal Padding:** 从紧凑的一倍间距到流体大间距，随内容层级而不是统一卡片模板变化。

### Inputs / Fields

- **Style:** 光谱范围输入嵌在两枚 34px 方形步进按钮之间；复选框被 2rem 方形金属框取代。
- **Focus:** 全局硫黄焦点轮廓；勾选后复选框以硫黄填充并显示深色勾号。
- **Error / Disabled:** 复制错误使用纸面上的暗红文字；无条款时按钮保持透明、灰色且不可点击。

### Navigation

粘性总账导航以 72px 三栏网格呈现，词标使用衬线，世界索引用等宽编号配无衬线名称，公约入口只用硫黄文字强调。820px 以下压缩为 60px 主栏与 40px 世界导轨，不使用汉堡抽屉。

### Contact Plate

首屏接触底片是系统的签名组件：骨纸底片承载三格 21:9 记录、独立不可见光谱、可移动显影分界、物理放大镜、曝光票和沿底部的光谱尺。它在首次出现时执行一次抽片与对焦，之后所有状态变化都由用户的显影操作驱动。

### Charter Builder

公约生成器由深色条款工作台和骨白收据并排组成。每次世界决策和条款勾选都写入本地收据；复制是明确的最终动作，界面同时声明“不上传”，不制造账户、保存或机构背书。

## Do's and Don'ts

### Do:

- **Do** 让所有信号色都能被解释为一种物理光源、胶片乳剂或人工标记。
- **Do** 让每组电影影像显示一个正在撤回介入的具体动作，并保持真实 21:9 摄影比例。
- **Do** 用宋体命题、无衬线正文和等宽证据标签建立可复用的信息层级。
- **Do** 让选择产生可读的后果账本，并把最终结果保留在当前页面。
- **Do** 在移动端把宽网格转换为堆叠或可发现的横向轨道，并保持键盘焦点与减少动态效果支持。

### Don't:

- **Don't** 使用霓虹赛博朋克、蓝紫渐变、星空粒子、玻璃拟态或通用太空 HUD。
- **Don't** 用圆角卡片、胶囊徽章和同质阴影把暗房材料语言抹平。
- **Don't** 把光谱、波长或档案标签伪装成真实科研数据或实时监测。
- **Don't** 让漂亮星球压过人的撤回动作、生态残余和选择代价。
- **Don't** 把未知世界写成可命名、可占领或可消费的奖励。
