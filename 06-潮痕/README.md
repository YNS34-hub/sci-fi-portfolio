# 潮痕 · THE WATERLINE

《潮痕》是一部原创互动电影档案：六张严格 21:9 的真人实景感主镜头与
六张证物近景，沿“秩序 → 异常 → 证据 / 侵入 → 选择 → 残留”组成四组
三联叙事。
页面中的水线随章节改变高度，观众可以通过滚动、章节导航或数字键 1–6
进入档案，并在终章做一个不会被保存的选择。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

默认地址为 `http://localhost:3000`。

## 验证

```bash
npm run lint
npm test
```

`npm test` 会重新构建 vinext 产物，验证服务端首屏、Open Graph 绝对地址、
十二张 1911×819 WebP、1800×2400 海报、1200×630 分享图以及全部下载入口。

## 作品结构

- `app/`：互动档案站点
- `public/art/`：六章主镜头、六张证物 WebP 与网页海报
- `public/downloads/`：制作圣经、证物图谱、两套 21:9 静帧包与正式海报
- `.openai/hosting.json`：Sites 项目配置
- `tests/`：服务端渲染和发布资产契约

原始静帧、三联画、正式海报和生成清单保存在本地交付目录
`outputs/waterline/`，不进入站点源码仓库。
