import type { ShotDef } from '../types'

export const shots: ShotDef[] = [
  { id: 'F01_EDIT_BREATH', no: 'A001', title: '空房间在呼吸', subtitle: '你说这里只有一把椅子。', asset: '/assets/shots/shot-01.webp', alt: '雨窗旁的旧剪辑室与橙色雨衣', tags: ['interior'], palette: 'cold', truthWeight: 0, origin: 'user', focal: [48, 52] },
  { id: 'F02_IRIS_SCAN', no: 'A002', title: '眼睛没有入点', subtitle: '机器从你没说的话开始。', asset: '/assets/shots/shot-02.webp', alt: '投影光前的原创人物侧脸特写', tags: ['person', 'interior'], palette: 'cold', truthWeight: 0, origin: 'user', focal: [58, 40] },
  { id: 'F03_RED_PENCIL', no: 'A003', title: '红笔划过原片', subtitle: '第一次删除发生在台词以前。', asset: '/assets/shots/shot-03.webp', alt: '手用红铅笔在纸带上标记', tags: ['interior'], palette: 'cold', truthWeight: 1, origin: 'user', focal: [53, 61] },
  { id: 'F04_BUS_GLASS', no: 'B017', title: '末班车没有停', subtitle: '23:17，雨把城市剪成两层。', asset: '/assets/shots/shot-04.webp', alt: '原创人物独自站在雨夜公交站', tags: ['person', 'city', 'rain'], palette: 'cold', truthWeight: 0, origin: 'user', focal: [48, 50] },
  { id: 'F05_VISOR_EYE', no: 'B018', title: '面罩里的第二次眨眼', subtitle: '速度会让犹豫看起来像决定。', asset: '/assets/shots/shot-05.webp', alt: '雨滴覆盖的摩托头盔眼部特写', tags: ['person', 'rain', 'motorcycle'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [48, 42] },
  { id: 'F06_MOTORCYCLE', no: 'B019', title: '后座仍然是湿的', subtitle: '系统检测到两个人的重量。', asset: '/assets/shots/shot-06.webp', alt: '桥下停着一辆黑色旧摩托', tags: ['city', 'rain', 'motorcycle'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [50, 58] },
  { id: 'F07_PARK_PAIR', no: 'C031', title: '停业前一小时', subtitle: '你把同行剪成了独行。', asset: '/assets/shots/shot-07.webp', alt: '两名原创人物走过停业游乐场', tags: ['person', 'amusement'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [50, 48] },
  { id: 'F08_ALMOST_TOUCH', no: 'C032', title: '手没有碰到', subtitle: '但两张票都留下了指纹。', asset: '/assets/shots/shot-08.webp', alt: '两只手各自拿着空白票根并将触未触', tags: ['person', 'amusement'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [50, 58] },
  { id: 'F09_CAROUSEL_MIRROR', no: 'C033', title: '镜子替你补了一格', subtitle: '倒影知道谁被移出了画面。', asset: '/assets/shots/shot-09.webp', alt: '旋转木马镜面切分原创人物面孔', tags: ['person', 'amusement'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [52, 45] },
  { id: 'F10_FOOTSTEPS', no: 'D044', title: '两串脚印在桥下分开', subtitle: '其中一串没有回到摩托旁。', asset: '/assets/shots/shot-10.webp', alt: '雨夜桥下两串分开的湿脚印', tags: ['city', 'rain'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [52, 66] },
  { id: 'F11_HELMET_PAIR', no: 'D045', title: '一只戴走，一只留下', subtitle: '删除不会改变物件的数量。', asset: '/assets/shots/shot-11.webp', alt: '长凳上两只湿摩托头盔与红围巾', tags: ['rain', 'motorcycle'], palette: 'print', truthWeight: 1, origin: 'system', focal: [50, 55] },
  { id: 'F12_TUNNEL_CUT', no: 'D046', title: '隧道吞掉后座', subtitle: '你回头了，只是没有停。', asset: '/assets/shots/shot-12.webp', alt: '摩托驶入隧道且后视镜里有人影', tags: ['motorcycle', 'city'], palette: 'print', truthWeight: 1, origin: 'system', focal: [58, 52] },
  { id: 'F13_ARGUMENT', no: 'E052', title: '门把一句话切成两半', subtitle: '你们都在等另一个人先开口。', asset: '/assets/shots/shot-13.webp', alt: '两名原创人物隔着半开门沉默', tags: ['person', 'interior'], palette: 'heated', truthWeight: 1, origin: 'system', focal: [50, 50] },
  { id: 'F14_CUP_RINGS', no: 'E053', title: '一只杯子，两个杯印', subtitle: '独处没有这种重叠。', asset: '/assets/shots/shot-14.webp', alt: '旧桌面上一个杯子与两个重叠杯印', tags: ['interior'], palette: 'print', truthWeight: 1, origin: 'system', focal: [53, 62] },
  { id: 'F15_ORANGE_DOOR', no: 'E054', title: '离开是一种暖色', subtitle: '所以你把房间调成冷蓝。', asset: '/assets/shots/shot-15.webp', alt: '冷蓝剪辑室中橙色门光与独坐人物', tags: ['person', 'interior'], palette: 'print', truthWeight: 1, origin: 'system', focal: [66, 53] },
  { id: 'M01_TWO_TICKETS', no: 'X001', title: '两张空白票', subtitle: '两张票。你不是一个人来的。', asset: '/assets/shots/shot-16.webp', alt: '售票亭吐出两张空白票根', tags: ['amusement'], palette: 'print', truthWeight: 2, origin: 'hidden', focal: [50, 62] },
  { id: 'M02_UNFINISHED_VOICE', no: 'X002', title: '未完成的声音', subtitle: '我说等雨小一点；你按下了停止。', asset: '/assets/shots/shot-17.webp', alt: '磁带机旁一只手悬在停止键上', tags: ['interior'], palette: 'print', truthWeight: 2, origin: 'hidden', focal: [50, 52] },
  { id: 'M03_DID_NOT_STOP', no: 'X003', title: '你回头了', subtitle: '后视镜里的人没有被雨删掉。', asset: '/assets/shots/shot-18.webp', alt: '摩托后视镜映出桥下被留下的人', tags: ['person', 'rain', 'motorcycle'], palette: 'print', truthWeight: 2, origin: 'hidden', focal: [48, 48] },
]

export const memoryShotIndex = { M01: 15, M02: 16, M03: 17 } as const

export const phaseLabels = {
  EMPTY: '空时间线',
  NORMAL: '正常剪辑',
  INTRUSION: '机器介入',
  FEVER: '失控蒙太奇',
  RECOVERY: '被删片段',
  EXPORT: '最终导出',
} as const
