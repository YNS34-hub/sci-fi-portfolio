# KIPPU 票根档案馆

![KIPPU 票根档案馆界面预览](../docs/previews/05-kippu-ticket-archive.jpg)

使用 `frontend-design` 独立完成的 React 网站作品。

## 本地运行

执行生产构建后，文件会输出到 `dist`。

开发方式：

```powershell
npm install
npm run dev
```

生产构建：

```powershell
npm run build
```

## 已实现

- 首页、馆藏、到访三个独立视图
- 路线、日期与票纸实时联动的票根排版机
- 可随路线、日期和票纸同步变化的实体票背与 3D 翻面
- 临时票夹与结果确认
- 馆藏分类筛选、深链接与侧滑档案
- 真实人数控制、工坊预约与确认状态
- 手机、窄屏、键盘焦点与 `prefers-reduced-motion`

## 本轮质感优化

- 将 6 张城市风景占位图替换为真实历史票券扫描，并按票面信息重写馆藏文案
- 票面保留纸边、存根、冲孔、印章与纸张厚度；3D 只用于排版机，不泛化到馆藏卡片
- 馆藏详情加入逐项图像来源，完整清单见 `public/media/SOURCES.txt`
- 完成 1440、390、320 像素实机验证；修复 320 像素馆藏卡片末端 18px 溢出
