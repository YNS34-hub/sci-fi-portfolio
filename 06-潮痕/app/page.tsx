/* eslint-disable @next/next/no-img-element -- Pre-compressed, art-directed stills share one source with the CSS reflection layer. */
"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Chapter = {
  id: string;
  title: string;
  titleEn: string;
  image: string;
  alt: string;
  note: string;
  evidence: string;
  accent: string;
  waterFrom: number;
  waterTo: number;
  focus: string;
};

const chapters: Chapter[] = [
  {
    id: "WL-01/06",
    title: "退潮",
    titleEn: "LOW WATER",
    image: "/art/chapter-01-low-water.webp",
    alt: "退潮后的巨大混凝土档案盆地里，一名穿褪色橙色潜水服的女人停在黑色库门前，其他工作人员正背向她离开。",
    note: "她看见一扇只对自己有意义的库门。",
    evidence: "年度退潮 / 禁止入内的第七码头库 bay",
    accent: "#bd633f",
    waterFrom: 18,
    waterTo: 36,
    focus: "56% 52%",
  },
  {
    id: "WL-02/06",
    title: "空席",
    titleEn: "THE EMPTY PLACE",
    image: "/art/chapter-02-empty-place.webp",
    alt: "旧公共泳池里的纪念仪式秩序整齐，唯一空椅上放着一只褪色橙色呼吸面罩，一名女人站在画面边缘。",
    note: "城市为一次成功救援庆祝了二十年。",
    evidence: "纪念席位 27 / 登记对象不存在",
    accent: "#c96e49",
    waterFrom: 36,
    waterTo: 58,
    focus: "62% 48%",
  },
  {
    id: "WL-03/06",
    title: "干罐",
    titleEn: "THE DRY VESSEL",
    image: "/art/chapter-03-dry-vessel.webp",
    alt: "低矮档案压力室中，维护架正在下降，女人用力拖出唯一没有凝露的骨白陶瓷档案罐。",
    note: "所有罐体都在呼吸，只有它保持干燥。",
    evidence: "回水槽 C / 异常冷凝记录为空",
    accent: "#b97245",
    waterFrom: 58,
    waterTo: 43,
    focus: "51% 55%",
  },
  {
    id: "WL-04/06",
    title: "回水",
    titleEn: "INGRESS",
    image: "/art/chapter-04-ingress.webp",
    alt: "夜晚的普通厨房被清水淹到脚踝，母亲抵住橱柜门，成年女儿站在另一端，高处挂着一件完全干燥的儿童橙色雨衣。",
    note: "海水先进入家中，证词随后才抵达。",
    evidence: "旧居 04-B / 水线高于城市记录",
    accent: "#ca7c52",
    waterFrom: 43,
    waterTo: 71,
    focus: "50% 58%",
  },
  {
    id: "WL-05/06",
    title: "改道",
    titleEn: "THE DIVERSION",
    image: "/art/chapter-05-diversion.webp",
    alt: "Y形混凝土分流渠里泥金色潮水涌来，渺小的档案潜水员正拔出机械制动楔，让水流转向城市管线。",
    note: "她没有打开真相，只是撤掉了阻止潮水的楔子。",
    evidence: "分流阀 Y-2 / 手动制动已解除",
    accent: "#a86b3f",
    waterFrom: 71,
    waterTo: 88,
    focus: "53% 48%",
  },
  {
    id: "WL-06/06",
    title: "潮痕",
    titleEn: "THE WATERLINE",
    image: "/art/chapter-06-waterline.webp",
    alt: "洪水退去后的清晨，一个孩子沿着路缘盐痕平衡行走，居民在普通清理街道，空潜水服挂在公交站栏杆上。",
    note: "城市终于记起她，却没有人知道她去了哪里。",
    evidence: "城市水位归零 / 人员记录仍未闭合",
    accent: "#d7c5a4",
    waterFrom: 88,
    waterTo: 24,
    focus: "61% 48%",
  },
];

const evidenceItems = [
  {
    id: "WL-E01",
    title: "门封",
    titleEn: "THE SEAL",
    image: "/art/evidence-01-seal.webp",
    alt: "湿手套从巨大黑色库门上掀起开裂封层，下面露出褪色橙色底漆和儿童尺寸的浅掌印。",
    clue: "封层之下，救援橙比现行档案更早。",
  },
  {
    id: "WL-E02",
    title: "空席",
    titleEn: "THE VACANT CHAIR",
    image: "/art/evidence-02-vacant-chair.webp",
    alt: "旧泳池纪念仪式中，一只手只提起褪色橙色呼吸面罩的带子，面罩仍压在唯一空椅上。",
    clue: "空椅周围的浅水没有脚印。",
  },
  {
    id: "WL-E03",
    title: "干圈",
    titleEn: "THE DRY RING",
    image: "/art/evidence-03-dry-ring.webp",
    alt: "俯视湿润档案架，重复骨白罐体中央留下唯一干燥圆形空位，湿手套正触摸底板。",
    clue: "所有罐位都在凝露，只有缺席的位置保持干燥。",
  },
  {
    id: "WL-E04",
    title: "柜内",
    titleEn: "INSIDE THE CABINET",
    image: "/art/evidence-04-inside-cabinet.webp",
    alt: "从被淹厨房的橱柜内部看出去，母亲用手压窄门缝，远处只见女儿湿透的小腿和高处干燥雨衣。",
    clue: "当前水位以下，柜内还留着更老的盐线。",
  },
  {
    id: "WL-E05",
    title: "楔落",
    titleEn: "THE WEDGE",
    image: "/art/evidence-05-wedge.webp",
    alt: "湿格栅高度的近景里，两只承重的手把刚拔出的沉重制动楔放下，后方机械轴开始转动。",
    clue: "楔体落下时，两条水路已不再等量。",
  },
  {
    id: "WL-E06",
    title: "无主",
    titleEn: "UNCLAIMED",
    image: "/art/evidence-06-unclaimed.webp",
    alt: "灾后清晨，装满盐晶的空白色潜水靴立在路缘，孩子的脚印在靴前终止，扫帚影子从旁经过。",
    clue: "没有成人脚印从靴子继续离开。",
  },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export default function Home() {
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [active, setActive] = useState(0);
  const [decision, setDecision] = useState(50);

  const scrollAndFocusChapter = useCallback((index: number) => {
    const section = chapterRefs.current[index];
    if (!section) return;
    section.scrollIntoView({
      behavior: reducedMotionRef.current ? "auto" : "smooth",
    });
    window.setTimeout(
      () => section.focus({ preventScroll: true }),
      reducedMotionRef.current ? 0 : 420,
    );
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    const drawWaterline = () => {
      const canvas = lineCanvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = 40;
      if (canvas.width !== Math.floor(width * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const y =
          20 +
          Math.sin(x * 0.018 + activeRef.current * 1.7) * 0.75 +
          Math.sin(x * 0.053 + 0.8) * 0.32;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(229,224,211,0)");
      gradient.addColorStop(0.18, "rgba(229,224,211,.52)");
      gradient.addColorStop(0.74, "rgba(229,224,211,.68)");
      gradient.addColorStop(1, "rgba(229,224,211,0)");
      context.strokeStyle = gradient;
      context.lineWidth = 1;
      context.stroke();
    };

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      let nextActive = 0;
      let closest = Number.POSITIVE_INFINITY;

      chapterRefs.current.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewport / 2);
        if (distance < closest) {
          closest = distance;
          nextActive = index;
        }
      });

      const section = chapterRefs.current[nextActive];
      const chapter = chapters[nextActive];
      let localProgress = 0;
      if (section) {
        const rect = section.getBoundingClientRect();
        localProgress = clamp(
          (viewport * 0.55 - rect.top) / Math.max(1, rect.height - viewport),
        );
      }
      const water =
        chapter.waterFrom +
        (chapter.waterTo - chapter.waterFrom) * localProgress;
      document.documentElement.style.setProperty("--water-y", `${water}%`);
      document.documentElement.style.setProperty(
        "--active-accent",
        chapter.accent,
      );
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      if (!reducedMotionRef.current) drawWaterline();
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.matches("input, button, a, textarea, select") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= chapters.length) {
        scrollAndFocusChapter(digit - 1);
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        scrollAndFocusChapter(
          Math.min(chapters.length - 1, activeRef.current + 1),
        );
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollAndFocusChapter(Math.max(0, activeRef.current - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scrollAndFocusChapter]);

  const enterArchive = () => scrollAndFocusChapter(0);

  const handleDecisionKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Home") setDecision(0);
    if (event.key === "End") setDecision(100);
  };

  return (
    <div className="archive-shell">
      <a className="skip-link" href="#chapter-01">
        跳过开场，进入第一章
      </a>

      <header className="opening" aria-labelledby="main-title">
        <div className="opening-meta" aria-hidden="true">
          <span>WL / ARCHIVE 000</span>
          <span>COASTAL MEMORY AUTHORITY</span>
          <span>31°14′N / TIDE −06.8M</span>
        </div>
        <p className="eyebrow">一部被潮水打捞的六章电影档案</p>
        <div className="title-lockup">
          <h1 id="main-title">潮痕</h1>
          <p>THE WATERLINE</p>
        </div>
        <p className="opening-copy">
          城市把被删除的记忆封存在海底。
          <br />
          退潮那天，她在档案里找到了自己。
        </p>
        <button className="enter-button" type="button" onClick={enterArchive}>
          <span>进入档案</span>
          <span aria-hidden="true">ENTER ARCHIVE ↓</span>
        </button>
        <div className="opening-water" aria-hidden="true">
          <span>THE WATERLINE</span>
        </div>
      </header>

      <nav className="archive-rail" aria-label="章节导航">
        <span className="rail-label">WL</span>
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                type="button"
                className={active === index ? "is-active" : ""}
                aria-label={`前往第 ${index + 1} 章：${chapter.title}`}
                aria-current={active === index ? "step" : undefined}
                onClick={() => scrollAndFocusChapter(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="rail-depth">
          {String(Math.round(chapters[active].waterTo)).padStart(2, "0")}M
        </span>
      </nav>

      <canvas
        ref={lineCanvasRef}
        className="global-waterline"
        aria-hidden="true"
      />
      <div className="waterline-shadow" aria-hidden="true" />
      <div className="chapter-announcer" aria-live="polite" aria-atomic="true">
        第 {active + 1} 章，共 {chapters.length} 章：{chapters[active].title}
      </div>

      <main id="archive">
        <div className="triptych-marker" aria-hidden="true">
          <span>TRIPTYCH I</span>
          <span>秩序 / 异常 / 证据</span>
        </div>
        {chapters.map((chapter, index) => (
          <section
            id={`chapter-${String(index + 1).padStart(2, "0")}`}
            key={chapter.id}
            tabIndex={-1}
            ref={(node) => {
              chapterRefs.current[index] = node;
            }}
            className={`chapter ${active === index ? "is-active" : ""}`}
            data-chapter={index + 1}
            style={
              {
                "--chapter-accent": chapter.accent,
                "--image-focus": chapter.focus,
              } as CSSProperties
            }
            aria-labelledby={`chapter-title-${index + 1}`}
          >
            {index === 3 && (
              <div className="triptych-marker triptych-marker-second">
                <span>TRIPTYCH II</span>
                <span>侵入 / 选择 / 残留</span>
              </div>
            )}
            <div className="chapter-sticky">
              <div className="chapter-stage">
                <div className="film-frame">
                  <img
                    className="film-image"
                    src={chapter.image}
                    alt={chapter.alt}
                    loading={index < 2 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                  <div className="reflection" aria-hidden="true">
                    <img
                      src={chapter.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <div className="water-wash" aria-hidden="true" />
                  <div className="salt-edge" aria-hidden="true" />
                  <div className="frame-corners" aria-hidden="true" />
                </div>

                <div className="chapter-copy">
                  <div className="chapter-number">
                    <span>{chapter.id}</span>
                    <span>TIDE {chapter.waterTo.toFixed(1)}M</span>
                  </div>
                  <h2 id={`chapter-title-${index + 1}`}>
                    <span>{chapter.title}</span>
                    <span>{chapter.titleEn}</span>
                  </h2>
                  <p className="chapter-note">{chapter.note}</p>
                  <p className="evidence-note">
                    <span aria-hidden="true">[</span>
                    {chapter.evidence}
                    <span aria-hidden="true">]</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="evidence-vault" aria-labelledby="evidence-title">
          <header className="evidence-intro">
            <p className="final-code">WL / EVIDENCE ATLAS</p>
            <h2 id="evidence-title">档案没有说话，材料替它作证。</h2>
            <p>
              六个近景来自同一事件的另一侧。门封、空椅、干圈、柜内盐痕、
              制动楔与无主盐靴把人物的选择压缩成可以触摸的证据。
            </p>
          </header>

          {[0, 3].map((start, groupIndex) => (
            <div className="evidence-group" key={start}>
              <div className="evidence-group-label" aria-hidden="true">
                <span>TRIPTYCH {groupIndex === 0 ? "III" : "IV"}</span>
                <span>
                  {groupIndex === 0
                    ? "门封 / 空席 / 干圈"
                    : "柜内 / 楔落 / 无主"}
                </span>
              </div>
              <div className="evidence-grid">
                {evidenceItems.slice(start, start + 3).map((item, index) => (
                  <figure
                    className={`evidence-card evidence-card-${start + index + 1}`}
                    key={item.id}
                  >
                    <div className="evidence-frame">
                      <img
                        src={item.image}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                      />
                      <span aria-hidden="true">{item.id}</span>
                    </div>
                    <figcaption>
                      <div>
                        <h3>{item.title}</h3>
                        <span>{item.titleEn}</span>
                      </div>
                      <p>{item.clue}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="final-recession" aria-labelledby="final-title">
          <div className="salt-profile" aria-hidden="true">
            {chapters.map((chapter) => (
              <span
                key={chapter.id}
                style={{ width: `${chapter.waterTo}%` }}
              />
            ))}
          </div>
          <p className="final-code">WL / ARCHIVE CLOSED</p>
          <h2 id="final-title">潮水退去，证词没有恢复原样。</h2>
          <p>
            你只能决定它下一次被谁看见。
            <br />
            这个选择不会被保存。
          </p>

          <div className="decision" style={{ "--decision": decision } as CSSProperties}>
            <div className="decision-labels" aria-hidden="true">
              <span>保留档案</span>
              <span>让城市记起</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={decision}
              aria-label="在保留档案与让城市记起之间选择"
              aria-describedby="decision-outcome"
              onChange={(event) => setDecision(Number(event.target.value))}
              onKeyDown={handleDecisionKey}
            />
            <output id="decision-outcome" aria-live="polite">
              {decision < 42
                ? "她仍存在于一个没有公开编号的库位里。"
                : decision > 58
                  ? "城市记住了失踪，却失去了唯一稳定的版本。"
                  : "闸门停在两种历史之间，没有完全关闭。"}
            </output>
          </div>
        </section>

        <section className="poster-vault" aria-labelledby="poster-title">
          <div className="poster-copy">
            <p className="final-code">WL / EXHIBIT 006-A</p>
            <h2 id="poster-title">留下来的，只有水到过的高度。</h2>
            <p>
              主海报把人物彻底移出画面：空潜水服是缺席，盐线是证词，
              水中倒影则是城市无法重新拼合的那一半。
            </p>
          </div>
          <figure>
            <img
              src="/art/waterline-poster.webp"
              alt="《潮痕》主题海报：空档案潜水服挂在混凝土栏杆，一道真实盐线贯穿画面，下方浅水映出一座并不存在于上方的城市。"
              loading="lazy"
            />
            <figcaption>
              <span>FORMAT 3:4</span>
              <span>WL-POSTER / FINAL</span>
            </figcaption>
          </figure>
        </section>

        <section className="download-archive" aria-labelledby="download-title">
          <div>
            <p className="final-code">WL / RELEASE PACKAGE</p>
            <h2 id="download-title">馆藏出库单</h2>
          </div>
          <div className="download-list">
            <a href="/downloads/production-bible.md" download>
              <span>WL-PRODUCTION-BIBLE.md</span>
              <span>镜头判断、提示词与视觉体系</span>
            </a>
            <a href="/downloads/waterline-stills.zip" download>
              <span>WL-STILLS.zip</span>
              <span>六章 21:9 电影静帧</span>
            </a>
            <a href="/downloads/waterline-poster.jpg" download>
              <span>WL-POSTER.jpg</span>
              <span>3:4 主题海报</span>
            </a>
            <a href="/downloads/evidence-atlas.md" download>
              <span>WL-EVIDENCE-ATLAS.md</span>
              <span>六件证物的镜头判断与完整提示词</span>
            </a>
            <a href="/downloads/waterline-evidence.zip" download>
              <span>WL-EVIDENCE.zip</span>
              <span>六张 21:9 证物静帧与生成清单</span>
            </a>
          </div>
          <a className="return-link" href="#main-title">
            回到水线起点 ↑
          </a>
        </section>
      </main>

      <footer>
        <span>AN ORIGINAL CINEMATIC ARCHIVE</span>
        <span>2026 / 潮痕</span>
      </footer>
    </div>
  );
}
