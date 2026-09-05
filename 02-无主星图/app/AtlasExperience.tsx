"use client";

import {
  ArrowDown,
  Check,
  Copy,
  Eye,
  HandPalm,
  PencilSimple,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";

type DecisionKey = "observe" | "name" | "contact";

type Shot = {
  src: string;
  title: string;
  log: string;
  clue: string;
  alt: string;
};

type World = {
  slug: string;
  number: string;
  name: string;
  subtitle: string;
  plate: string;
  wavelength: string;
  spectral: string;
  thesis: string;
  question: string;
  signal: string;
  refusal: string;
  obligation: string;
  accent: "cobalt" | "selenium" | "sulfur";
  shots: Shot[];
  consequences: Record<
    DecisionKey,
    { heading: string; body: string; cost: string }
  >;
};

const worlds: World[] = [
  {
    slug: "miyong",
    number: "01",
    name: "弥涌",
    subtitle: "潮盐卫星 · 会呼吸的地表",
    plate: "MY-17 / 潮差 11.8 h",
    wavelength: "436 nm",
    spectral: "/worlds/miyong/spectral.webp",
    thesis:
      "盐不是矿层，而是一种以潮汐完成呼吸的巨大生命结构。最先到达的人，决定不把“发现”变成钻孔。",
    question: "如果无法证明它会疼，撤回工具仍然是科学吗？",
    signal: "盐脊在钻头接近时提前收缩；潮水却没有改变。",
    refusal: "未取走岩芯，未为裂隙命名，撤销了采样坐标。",
    obligation: "把未知保留为未知，并公开说明样本为什么不存在。",
    accent: "cobalt",
    shots: [
      {
        src: "/worlds/miyong/shot-01.webp",
        title: "接近以前",
        log: "地表以 43 秒为周期起伏。设备记录不到声响，手掌却能感到盐壳下方的压力变化。",
        clue: "残余：所有盐脊的收缩都比预报潮汐早 2.1 秒。",
        alt: "弥涌盐原上，地质学家把手停在会呼吸的盐壳上方。",
      },
      {
        src: "/worlds/miyong/shot-02.webp",
        title: "撤回",
        log: "钻机已断电。现场负责人将钻头从琥珀色裂隙中完整抽离，动作没有留下可分析的样本。",
        clue: "残余：裂隙在金属离开后呼出温暖盐雾。",
        alt: "地质学家从琥珀色盐裂隙前撤回没有启动的钻头。",
      },
      {
        src: "/worlds/miyong/shot-03.webp",
        title: "无样本结案",
        log: "钻具装箱，坐标作废。没有命名权、没有专利、没有带回地球的证明物。",
        clue: "残余：潮湿珠点在盐面上排出类似呼吸的间隔。",
        alt: "考察队收起钻具，广阔盐原只留下未被取走的琥珀裂隙。",
      },
    ],
    consequences: {
      observe: {
        heading: "保持远距观察",
        body: "不再靠近裂隙，仅保留低功率、无接触的潮汐记录。研究价值下降，但不会制造新的伤害变量。",
        cost: "代价：无法证明生命，也无法申请发现权。",
      },
      name: {
        heading: "给予人类名称",
        body: "名称会进入航图和资源数据库，使弥涌从关系变成坐标。下一支队伍可能把“已命名”等同于“可使用”。",
        cost: "代价：地图更清楚，世界却更容易被占有。",
      },
      contact: {
        heading: "执行一次采样",
        body: "岩芯能够回答结构是否有机，却会永久穿透一次完整潮汐循环。任何结果都无法撤销这个缺口。",
        cost: "代价：知识确定性上升，生态完整性不可恢复。",
      },
    },
  },
  {
    slug: "weizhou",
    number: "02",
    name: "葳昼",
    subtitle: "双日雨林 · 雨滴中的记忆",
    plate: "WZ-04 / 雨季 197 d",
    wavelength: "546 nm",
    spectral: "/worlds/weizhou/spectral.webp",
    thesis:
      "雨滴在叶片之间传递重复结构。人类的翻译器可以把它写成句子，却没有证据表明森林愿意被读懂。",
    question: "把信号翻译成人类语言，是理解，还是覆盖？",
    signal: "设备关机后，水纹仍沿三条枝路同步延伸。",
    refusal: "关闭翻译器，删除自动词典，不发布拟人化转录。",
    obligation: "承认模式存在，但不把模式冒充成对人类说的话。",
    accent: "selenium",
    shots: [
      {
        src: "/worlds/weizhou/shot-01.webp",
        title: "第一次重复",
        log: "同一秒内，十二片叶面出现同心涟漪。附近没有足以解释它的风、虫群或落雨强度变化。",
        clue: "残余：涟漪会避开被手触碰过的叶片。",
        alt: "葳昼雨林中，语言学家举起模拟录音机观察同步水纹。",
      },
      {
        src: "/worlds/weizhou/shot-02.webp",
        title: "停止翻译",
        log: "自动模型已产生主语与请求句，但每次重跑都会得到不同的“说话者”。负责人关闭了最后一台解释设备。",
        clue: "残余：窗上的枝状雨路在断电后继续生长。",
        alt: "木屋内的语言学家关掉模拟翻译设备，雨滴在窗上继续分枝。",
      },
      {
        src: "/worlds/weizhou/shot-03.webp",
        title: "把沉默留下",
        log: "团队只带走原始水纹录像；所有带语义的文字稿留在站内，不进入公共语料库。",
        clue: "残余：泥水里的波形没有对应任何已知字母。",
        alt: "双日雨中，语言学家关门离开，翻译器被留在木屋里。",
      },
    ],
    consequences: {
      observe: {
        heading: "只记录水纹",
        body: "保存时间、位置与形态，不给波形赋予主语。它可以被继续研究，但不能被剪成一句适合传播的“外星寄语”。",
        cost: "代价：传播力变弱，证据边界更诚实。",
      },
      name: {
        heading: "命名一种语言",
        body: "“语言”这个词会预设说话者、意图和可翻译性。人类得到熟悉的框架，森林却失去保持陌生的权利。",
        cost: "代价：研究更易组织，假设被伪装成事实。",
      },
      contact: {
        heading: "回放人造水纹",
        body: "向叶面发送合成模式可能获得回应，也可能像污染一样进入森林的记忆循环。接触一旦被学习便无法收回。",
        cost: "代价：有机会建立对话，也可能永久改写原信号。",
      },
    },
  },
  {
    slug: "xiemu",
    number: "03",
    name: "斜暮",
    subtitle: "昼夜边界 · 不需要路标的迁徙",
    plate: "XM-31 / 晨昏带 9 km",
    wavelength: "612 nm",
    spectral: "/worlds/xiemu/spectral.webp",
    thesis:
      "考察队竖起的信标开始改变迁徙路线。基础设施即使不发声，也会要求另一个世界绕着人类行走。",
    question: "当我们的安全设施成为它们的地貌，谁应该让路？",
    signal: "迁徙轨迹在一个周期内向信标偏移 4.7 米。",
    refusal: "拆除信标、封闭基座、放弃永久营地许可。",
    obligation: "让观测服从迁徙，而不是让迁徙服从观测。",
    accent: "sulfur",
    shots: [
      {
        src: "/worlds/xiemu/shot-01.webp",
        title: "被看见的路标",
        log: "信标从未开启，但金属轮廓已经进入迁徙者的视觉边界。队伍第一次发现路线出现轻微弯折。",
        clue: "残余：夜侧岩缝里有更早一季的旧足迹。",
        alt: "斜暮金色地平线上，工程师隔着岩缝观察迁徙群和未开启的信标。",
      },
      {
        src: "/worlds/xiemu/shot-02.webp",
        title: "拆除坐标",
        log: "工程师松开最后一枚地脚螺栓。没有替换标记，也没有留下便于未来队伍复建的中心点。",
        clue: "残余：传统足迹正好从空出的螺孔旁经过。",
        alt: "工程师在铁红荒原上拆下迁徙路线旁的钢制信标。",
      },
      {
        src: "/worlds/xiemu/shot-03.webp",
        title: "路线恢复",
        log: "迁徙群重新走直。人类携带自己的基础设施撤向夜侧，让晨昏线恢复为没有主人设计的道路。",
        clue: "残余：三趾足迹在黑暗里继续，人类无法确认终点。",
        alt: "人类扛走信标，壳背迁徙群沿永久黄昏的原路线继续前行。",
      },
    ],
    consequences: {
      observe: {
        heading: "撤到岩缝之后",
        body: "考察点改为移动式远距观测，每个周期都避开旧足迹。数据会出现空白，但空白不再由迁徙者承担。",
        cost: "代价：连续记录中断，路线完整性恢复。",
      },
      name: {
        heading: "登记一条迁徙廊道",
        body: "保护区名称或许能阻止开发，也会把一条活的路线固定成人类边界。制度保护与制度占有在这里相邻。",
        cost: "代价：更易被保护，也更易被管理和切割。",
      },
      contact: {
        heading: "保留导航信标",
        body: "信标保障人员安全，却将持续成为迁徙地貌。几季之后，没有人还能知道哪条路线是原来的。",
        cost: "代价：营地更安全，另一物种替人类承担适应。",
      },
    },
  },
];

const decisionLabels: Record<DecisionKey, string> = {
  observe: "只观察",
  name: "给予名字",
  contact: "尝试接触",
};

const charterClauses = [
  {
    id: "unknown",
    title: "保留未知条款",
    body: "无法证明可接触，不构成接触许可；无法翻译，也不等于沉默。",
  },
  {
    id: "withdraw",
    title: "可撤回条款",
    body: "任何工具、坐标和基础设施都必须能被完整撤回，不把停留伪装成保护。",
  },
  {
    id: "evidence",
    title: "缺席证据条款",
    body: "如因不伤害而没有样本，报告必须解释样本为何缺席，不用推测填满空白。",
  },
];

function DecisionIcon({ kind }: { kind: DecisionKey }) {
  if (kind === "observe") return <Eye aria-hidden="true" weight="regular" />;
  if (kind === "name")
    return <PencilSimple aria-hidden="true" weight="regular" />;
  return <HandPalm aria-hidden="true" weight="regular" />;
}

function WorldChapter({
  world,
  decision,
  onDecision,
}: {
  world: World;
  decision: DecisionKey;
  onDecision: (decision: DecisionKey) => void;
}) {
  const consequence = world.consequences[decision];

  return (
    <section
      className={`world-section world-${world.accent}`}
      id={world.slug}
      aria-labelledby={`${world.slug}-title`}
    >
      <div className="chapter-rail" aria-hidden="true">
        <span>{world.number}</span>
        <span>{world.wavelength}</span>
        <span>{world.plate}</span>
      </div>

      <header className="world-heading">
        <div>
          <h2 id={`${world.slug}-title`}>{world.name}</h2>
          <p className="world-subtitle">{world.subtitle}</p>
        </div>
        <p className="world-thesis">{world.thesis}</p>
        <blockquote>{world.question}</blockquote>
      </header>

      <div className="shot-sequence">
        {world.shots.map((shot, index) => (
          <figure className="shot" key={shot.src}>
            <div className="shot-image">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={1920}
                height={823}
                sizes="(max-width: 820px) 100vw, 92vw"
                loading="lazy"
                unoptimized
              />
              <span className="frame-index" aria-hidden="true">
                {world.number}.{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <figcaption>
              <div>
                <span>镜头记录</span>
                <strong>{shot.title}</strong>
              </div>
              <p>{shot.log}</p>
              <p className="residual">{shot.clue}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="decision-worktable">
        <div className="decision-copy">
          <h3>你将怎样写入这份档案？</h3>
          <p>
            选择不会改变虚构世界，但会改变你的公约草案。三种答案都显示真实代价，没有“完美”按钮。
          </p>
        </div>

        <div className="decision-controls" aria-label={`${world.name}行动选择`}>
          {(Object.keys(decisionLabels) as DecisionKey[]).map((key) => (
            <button
              className="decision-button"
              key={key}
              type="button"
              aria-pressed={decision === key}
              onClick={() => onDecision(key)}
            >
              <DecisionIcon kind={key} />
              <span>{decisionLabels[key]}</span>
            </button>
          ))}
        </div>

        <div className="consequence" aria-live="polite" aria-atomic="true">
          <span>后果账本 / 当前选择</span>
          <h3>{consequence.heading}</h3>
          <p>{consequence.body}</p>
          <strong>{consequence.cost}</strong>
        </div>
      </div>
    </section>
  );
}

export function AtlasExperience() {
  const reduceMotion = useReducedMotion();
  const [spectrum, setSpectrum] = useState(58);
  const [decisions, setDecisions] = useState<Record<string, DecisionKey>>({
    miyong: "observe",
    weizhou: "observe",
    xiemu: "observe",
  });
  const [clauses, setClauses] = useState<Record<string, boolean>>({
    unknown: true,
    withdraw: true,
    evidence: true,
  });
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const selectedClauses = charterClauses.filter((clause) => clauses[clause.id]);

  const charterText = useMemo(() => {
    const decisionsText = worlds
      .map(
        (world) =>
          `${world.name}：${decisionLabels[decisions[world.slug]]}。${
            world.consequences[decisions[world.slug]].cost
          }`,
      )
      .join("\n");
    const clausesText = selectedClauses
      .map((clause, index) => `${index + 1}. ${clause.title}：${clause.body}`)
      .join("\n");
    return `《无主星图》非接触公约（个人草案）\n\n${clausesText}\n\n三界记录：\n${decisionsText}\n\n本公约只保存在当前页面，不上传、不代替现实中的科研伦理审查。`;
  }, [decisions, selectedClauses]);

  const copyCharter = async () => {
    if (!selectedClauses.length) return;
    try {
      await navigator.clipboard.writeText(charterText);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

      <header className="site-ledger">
        <a className="wordmark" href="#top" aria-label="无主星图，返回顶部">
          无主星图
        </a>
        <nav aria-label="世界索引">
          {worlds.map((world) => (
            <a href={`#${world.slug}`} key={world.slug}>
              <span>{world.number}</span>
              {world.name}
            </a>
          ))}
        </nav>
        <a className="charter-shortcut" href="#charter">
          非接触公约
        </a>
      </header>

      <main id="main-content">
        <section
          className="hero"
          id="top"
          style={{ "--reveal": `${spectrum}%` } as React.CSSProperties}
          aria-labelledby="hero-title"
        >
          <div className="hero-title">
            <h1 id="hero-title">
              有些世界，
              <br />
              不需要被抵达。
            </h1>
            <p>
              三颗虚构行星，九次克制的决定。
              <br />
              拖动光谱尺，看看“看见”如何改变被看见者。
            </p>
            <a className="primary-link" href="#primer">
              开始观察 <ArrowDown aria-hidden="true" />
            </a>
          </div>

          <motion.div
            className="contact-plate"
            initial={
              reduceMotion
                ? false
                : { x: 72, clipPath: "inset(0 0 0 14%)", filter: "blur(5px)" }
            }
            animate={{
              x: 0,
              clipPath: "inset(0 0 0 0%)",
              filter: "blur(0px)",
            }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="perforations" aria-hidden="true" />
            <div className="hero-frames">
              {worlds.map((world, index) => (
                <a
                  className={`hero-frame frame-${world.accent}`}
                  href={`#${world.slug}`}
                  key={world.slug}
                  aria-label={`进入${world.name}档案`}
                >
                  <Image
                    className="spectral-base"
                    src={world.shots[0].src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 820px) 86vw, 24vw"
                    priority={index === 0}
                    unoptimized
                  />
                  <Image
                    className="spectral-trace"
                    src={world.spectral}
                    alt={`${world.name}不可见光谱痕迹`}
                    fill
                    sizes="(max-width: 820px) 86vw, 24vw"
                    priority={index === 0}
                    unoptimized
                  />
                  <span className="hero-frame-label">
                    <b>{world.number}</b>
                    <span>
                      {world.name}
                      <small>{world.subtitle}</small>
                    </span>
                  </span>
                </a>
              ))}
            </div>
            <div className="spectral-loupe" aria-hidden="true">
              <Image src="/loupe.png" alt="" fill sizes="250px" unoptimized />
              <span>λ</span>
            </div>
            <aside className="exposure-ticket" aria-label="曝光记录">
              <span>曝光记录</span>
              <strong>PLATE 03 / 03</strong>
              {worlds.map((world) => (
                <div key={world.slug}>
                  <b>{world.name}</b>
                  <small>{world.wavelength}</small>
                  <i aria-hidden="true" />
                </div>
              ))}
              <p>光谱只显示痕迹，不授予解释权。</p>
            </aside>
            <p className="hero-scroll-hint">横向滑动查看下一张 →</p>
            <div className="spectral-control">
              <label htmlFor="spectrum">
                <span>显影光谱</span>
                <output>{spectrum}%</output>
              </label>
              <div className="spectrum-track">
                <button
                  type="button"
                  aria-label="减少显影"
                  onClick={() =>
                    setSpectrum((current) => Math.max(8, current - 8))
                  }
                >
                  −
                </button>
                <input
                  id="spectrum"
                  type="range"
                  min="8"
                  max="96"
                  value={spectrum}
                  onInput={(event) =>
                    setSpectrum(Number(event.currentTarget.value))
                  }
                  aria-describedby="spectrum-help"
                />
                <button
                  type="button"
                  aria-label="增加显影"
                  onClick={() =>
                    setSpectrum((current) => Math.min(96, current + 8))
                  }
                >
                  +
                </button>
              </div>
              <p id="spectrum-help">
                左侧保留银盐底片，右侧显影不可见痕迹；光谱不会把未知变成答案。
              </p>
            </div>
          </motion.div>

          <p className="fiction-mark">
            FICTIONAL FIELD ATLAS · 所有世界与记录均为原创虚构
          </p>
        </section>

        <section className="primer" id="primer" aria-labelledby="primer-title">
          <div className="primer-statement">
            <h2 id="primer-title">发现不是所有权。</h2>
            <p>
              人类航图习惯用命名完成抵达：一旦一个地点有了编号、坐标和可引用的样本，它就进入了我们的制度。
              《无主星图》反过来记录三次撤回——没有样本、没有翻译、没有永久信标——并把缺席本身当作证据。
            </p>
          </div>
          <dl className="primer-ledger">
            <div>
              <dt>观察</dt>
              <dd>承认自己的位置会进入结果。</dd>
            </div>
            <div>
              <dt>命名</dt>
              <dd>说明分类带来的权力，而不只说明便利。</dd>
            </div>
            <div>
              <dt>接触</dt>
              <dd>把不可逆后果写在好奇心前面。</dd>
            </div>
          </dl>
        </section>

        {worlds.map((world) => (
          <WorldChapter
            world={world}
            decision={decisions[world.slug]}
            onDecision={(decision) =>
              setDecisions((current) => ({
                ...current,
                [world.slug]: decision,
              }))
            }
            key={world.slug}
          />
        ))}

        <section className="full-archive" aria-labelledby="archive-title">
          <header>
            <div>
              <h2 id="archive-title">九幅成片，一张完整底片。</h2>
              <p>
                每个世界由三次独立机位组成：不可解决的状态、撤回介入的动作、以及仍未被解释的残余线索。
              </p>
            </div>
            <a href="/worlds/series-overview.webp" download>
              下载 1920 × 829 系列总览
            </a>
          </header>
          <figure className="series-overview">
            <Image
              src="/worlds/series-overview.webp"
              alt="弥涌、葳昼与斜暮的九幅电影镜头总览"
              width={1920}
              height={829}
              sizes="100vw"
              unoptimized
            />
            <figcaption>
              三列分别对应弥涌、葳昼与斜暮；从上至下是观察、撤回和余迹。
            </figcaption>
          </figure>
          <div className="triptych-index">
            {worlds.map((world) => (
              <a
                href={`/worlds/${world.slug}/triptych.webp`}
                download
                key={world.slug}
              >
                <Image
                  src={`/worlds/${world.slug}/triptych.webp`}
                  alt={`${world.name}三联叙事完整底片`}
                  width={1920}
                  height={2487}
                  sizes="(max-width: 820px) 92vw, 30vw"
                  loading="lazy"
                  unoptimized
                />
                <span>
                  <b>{world.name}</b>
                  打开 1920 × 2487 三联原图
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="comparison" aria-labelledby="comparison-title">
          <header>
            <h2 id="comparison-title">三份没有带回样本的报告</h2>
            <p>
              它们仍然有价值：不是因为答案足够完整，而是因为边界被完整记录。
            </p>
          </header>
          <div className="comparison-table" role="table" aria-label="三世界比较">
            <div className="comparison-row comparison-head" role="row">
              <span role="columnheader">世界</span>
              <span role="columnheader">发现的信号</span>
              <span role="columnheader">拒绝的介入</span>
              <span role="columnheader">留下的义务</span>
            </div>
            {worlds.map((world) => (
              <div className="comparison-row" role="row" key={world.slug}>
                <strong role="cell">{world.name}</strong>
                <span role="cell">{world.signal}</span>
                <span role="cell">{world.refusal}</span>
                <span role="cell">{world.obligation}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="charter" id="charter" aria-labelledby="charter-title">
          <div className="charter-intro">
            <h2 id="charter-title">写一份不以抵达为目的的公约。</h2>
            <p>
              这不是测验。你可以保留、删去或重写这些原则；页面只在本地生成文本，不保存你的选择。
            </p>
          </div>

          <div className="charter-builder">
            <fieldset>
              <legend>选择要带走的条款</legend>
              {charterClauses.map((clause) => (
                <label className="clause" key={clause.id}>
                  <input
                    type="checkbox"
                    checked={clauses[clause.id]}
                    onChange={(event) =>
                      setClauses((current) => ({
                        ...current,
                        [clause.id]: event.target.checked,
                      }))
                    }
                  />
                  <span className="check-mark" aria-hidden="true">
                    <Check weight="bold" />
                  </span>
                  <span>
                    <strong>{clause.title}</strong>
                    <small>{clause.body}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <article className="charter-receipt" aria-live="polite">
              <span>LOCAL DRAFT / 不上传</span>
              <h3>非接触公约</h3>
              {selectedClauses.length ? (
                <ol>
                  {selectedClauses.map((clause) => (
                    <li key={clause.id}>
                      <strong>{clause.title}</strong>
                      <p>{clause.body}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="empty-charter">
                  暂无条款。至少选择一条，才能生成可复制的公约。
                </p>
              )}
              <div className="world-decisions">
                {worlds.map((world) => (
                  <span key={world.slug}>
                    {world.name} / {decisionLabels[decisions[world.slug]]}
                  </span>
                ))}
              </div>
              <button
                className="copy-button"
                type="button"
                onClick={copyCharter}
                disabled={!selectedClauses.length}
              >
                {copyStatus === "copied" ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {copyStatus === "copied" ? "已复制公约" : "复制公约文本"}
              </button>
              {copyStatus === "error" && (
                <p className="copy-error" role="alert">
                  浏览器未允许复制。请选中上方条款文本后手动复制。
                </p>
              )}
            </article>
          </div>
        </section>
      </main>

      <footer>
        <p>
          《无主星图》是一件原创交互式科幻作品。它不声称记录真实天体，也不提供现实科研结论。
        </p>
        <a href="#top">返回光台</a>
      </footer>
    </>
  );
}
