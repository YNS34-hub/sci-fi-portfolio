# 科幻作品集

这是一个面向源码保存与后续维护的私人作品集仓库，收录 10 个可独立运行的网页作品。每个项目保留自己的依赖清单、说明文档、源码和必要素材。

## 项目索引

| 目录 | 项目 | 技术栈 |
| --- | --- | --- |
| `01-余光协议` | 余光协议 | React / Next.js / Vite |
| `02-无主星图` | 无主星图 | React / Next.js / Vite |
| `03-四个异世界` | 四个异世界 | React / Three.js / GSAP / Vite |
| `04-BLUE-DIVE` | BLUE // DIVE | React / Three.js / Vite |
| `04-NOCTURNE夜植观测所` | NOCTURNE 夜植观测所 | React / GSAP / Vite |
| `05-KIPPU票根档案馆` | KIPPU 票根档案馆 | React / Vite |
| `06-潮痕` | 潮痕 / THE WATERLINE | React / Next.js / Vite |
| `07-CUT-FEVER` | CUT // FEVER | React / Vite |
| `08-一毫米之外` | 一毫米之外 / ONE MILLIMETRE OFF | React / GSAP / Vite |
| `09-三小时之后` | 三小时之后 / AFTER THREE HOURS | Vite |

## 本地运行

建议安装 Node.js 20 LTS。进入任意项目目录后，根据该目录的锁文件安装依赖并启动：

```powershell
cd "01-余光协议"
npm install
npm run dev
```

`03-四个异世界` 使用 `pnpm-lock.yaml`，建议运行：

```powershell
corepack enable
cd "03-四个异世界"
pnpm install
pnpm dev
```

各项目支持的构建与测试命令以各自的 `package.json` 和 README 为准。

## 仓库整理规则

本仓库保存源码与必要素材。以下内容不进入 Git：第三方依赖、构建输出、测试报告、开发工具缓存、Windows 快捷方式和重复版本备份。它们都可以通过安装依赖、执行构建或从原始桌面交付目录重新生成。

仓库没有附加开源许可证，默认保留作者权利。
