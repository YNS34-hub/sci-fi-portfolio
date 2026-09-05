"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Eye,
  Quotes,
  SlidersHorizontal,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { FormEvent, useMemo, useState } from "react";

type Decision = "keep" | "erase";
type CopyState = "idle" | "copying" | "copied" | "error";

const testimonies = [
  {
    name: "周玉梅",
    role: "避难区居民，作品内虚构证言",
    quote:
      "那天我失去的，不只是一个人。还有所有人都承认那扇门关着的那一刻。",
  },
  {
    name: "陈阿澈",
    role: "热穹时代出生者，作品内虚构证言",
    quote: "没见过太阳的人，也有权知道天空曾经不是一块屏幕。",
  },
  {
    name: "唐照",
    role: "记忆校准员，作品内虚构证言",
    quote: "删除痛苦不会修复原因，只会让原因失去证人。",
  },
];

const outcomeCopy: Record<
  Decision,
  { title: string; body: string; receipt: string }
> = {
  keep: {
    title: "城市没有得到安慰",
    body: "记录被保留，听证重新开启。人们仍会痛，但痛苦不再是无主之物。",
    receipt: "我选择保留余光。不是因为痛苦正确，而是因为真相需要被感到。",
  },
  erase: {
    title: "城市恢复平静",
    body: "记录被删除，避难门从公共记忆里消失。多年后，没有人知道那份平静曾覆盖了谁。",
    receipt: "我选择抹除记忆。平静被留下，但它再也无法解释自己的来处。",
  },
};

function calibrationMeaning(value: number) {
  if (value < 34) {
    return {
      title: "证据完整",
      body: "痛苦仍然可感，城市必须继续面对责任。",
    };
  }

  if (value < 67) {
    return {
      title: "事实仍在，重量变轻",
      body: "事件可以检索，但它逐渐失去改变人的力量。",
    };
  }

  return {
    title: "平静覆盖证据",
    body: "痛苦消失，真相也失去被相信的触感。",
  };
}

export function AfterglowExperience() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const pageProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [horizon, setHorizon] = useState(56);
  const [calibration, setCalibration] = useState(42);
  const [selectedWitness, setSelectedWitness] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [memory, setMemory] = useState("");
  const [receiptReady, setReceiptReady] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const meaning = useMemo(
    () => calibrationMeaning(calibration),
    [calibration],
  );

  const scrollToRecord = () => {
    document.getElementById("record")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const choose = (value: Decision) => {
    setDecision(value);
    setReceiptReady(false);
    setCopyState("idle");
  };

  const createReceipt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!decision || !memory.trim()) return;
    setReceiptReady(true);
    setCopyState("idle");
  };

  const copyReceipt = async () => {
    if (!decision || !memory.trim()) return;
    setCopyState("copying");

    const text = [
      "《余光协议》个人记忆回执",
      outcomeCopy[decision].receipt,
      `我不愿被优化掉的一句话：${memory.trim()}`,
      "这份文字只属于此刻的选择。",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="page-progress"
        style={{ scaleX: pageProgress }}
      />

      <a className="skip-link" href="#main-content">
        跳到作品正文
      </a>

      <header className="site-header">
        <a className="brand" href="#opening" aria-label="返回余光协议开场">
          余光协议
        </a>
        <nav aria-label="作品章节">
          <a href="#record">记录</a>
          <a href="#testimony">证言</a>
          <a href="#calibration">校准</a>
          <a href="#receipt">回执</a>
        </nav>
        <button className="header-action" type="button" onClick={scrollToRecord}>
          进入
          <ArrowDown size={16} weight="light" aria-hidden="true" />
        </button>
      </header>

      <main id="main-content">
        <section className="hero" id="opening" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">余光协议</h1>
            <p>这座城市最后一次真实日落，将由你决定是否被遗忘。</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={scrollToRecord}>
                进入协议
                <ArrowRight size={18} weight="light" aria-hidden="true" />
              </button>
              <a className="text-link" href="#testimony">
                先听证言
              </a>
            </div>
          </div>

          <motion.div
            className="hero-aperture"
            initial={
              reduceMotion
                ? false
                : { clipPath: "circle(4% at 58% 58%)", opacity: 0.65 }
            }
            animate={{ clipPath: "circle(72% at 58% 58%)", opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={
              {
                "--horizon-offset": `${(horizon - 50) * 0.08}%`,
              } as React.CSSProperties
            }
          >
            <img
              src="/film/shot-01-order.webp"
              alt="市民在圆形观测窗前排队，女校准员手持记忆盘停在日落前"
              decoding="async"
              fetchPriority="high"
            />
          </motion.div>

          <div className="hero-horizon" aria-label="地平线检查控制">
            <input
              type="range"
              min="18"
              max="82"
              value={horizon}
              onChange={(event) => setHorizon(Number(event.target.value))}
              aria-label="拖动光标检查记忆切面"
              style={
                {
                  "--value": `${((horizon - 18) / 64) * 100}%`,
                } as React.CSSProperties
              }
            />
            <span>拖动光标，检查记忆切面</span>
          </div>
        </section>

        <section className="case-intro section" id="record">
          <div>
            <h2>一段光，成了证据</h2>
          </div>
          <div className="case-copy">
            <p>
              2087 年，热穹工程覆盖天空。启用前，观测站保存了最后一次未经算法修正的日落。
            </p>
            <p>
              记录里还有一扇没有及时开启的避难门。城市准备删去创伤，也可能顺手删去责任。
            </p>
          </div>
        </section>

        <section className="film-sequence section" aria-label="三段电影记录">
          <figure className="film-primary">
            <div className="film-frame">
              <img
                src="/film/shot-01-order.webp"
                alt="制度仍在运行，等待的市民不知道校准员已经停手"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>
              <strong>秩序仍在运行</strong>
              <span>等待的人不知道，她已经发现了不该被删除的内容。</span>
            </figcaption>
          </figure>

          <div className="film-pair">
            <figure>
              <div className="film-frame">
                <img
                  src="/film/shot-02-threshold.webp"
                  alt="校准员在机械夹具闭合前拉住橙色记忆胶片"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <strong>夹具闭合前</strong>
                <span>她把记忆胶片向外拉了两厘米。</span>
              </figcaption>
            </figure>

            <figure className="triptych-note">
              <div>
                <Eye size={28} weight="light" aria-hidden="true" />
                <h3>你看到的是美，系统读取的是风险</h3>
                <p>
                  同一段橙色既保存了日落，也保存了门锁的回声。协议无法只删掉其中一半。
                </p>
              </div>
              <a href="/film/afterglow-triptych.webp" target="_blank">
                查看完整三联镜头
                <ArrowRight size={18} weight="light" aria-hidden="true" />
              </a>
            </figure>
          </div>
        </section>

        <section className="testimony section" id="testimony">
          <div className="testimony-copy">
            <Quotes size={42} weight="thin" aria-hidden="true" />
            <blockquote>{testimonies[selectedWitness].quote}</blockquote>
            <p>
              {testimonies[selectedWitness].name}
              <span>{testimonies[selectedWitness].role}</span>
            </p>
            <div className="testimony-tabs" aria-label="选择证言">
              {testimonies.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selectedWitness === index}
                  onClick={() => setSelectedWitness(index)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <figure className="witness-image">
            <img
              src="/film/shot-03-witness.webp"
              alt="老人把手放进地面的最后一道橙色光线"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </section>

        <section className="timeline-section section">
          <h2>记忆不是过去，它仍在分配现在</h2>
          <ol className="timeline">
            <li>
              <strong>热穹上线</strong>
              <span>天空变得安全，也变得可编辑。</span>
            </li>
            <li>
              <strong>最后日落</strong>
              <span>美与失误被写进同一段光。</span>
            </li>
            <li>
              <strong>公开听证</strong>
              <span>城市把痛苦交给协议处理。</span>
            </li>
            <li>
              <strong>你的决定</strong>
              <span>平静与证据不能同时完整。</span>
            </li>
          </ol>
        </section>

        <section
          className="calibration section"
          id="calibration"
          aria-labelledby="calibration-title"
        >
          <div className="calibration-heading">
            <SlidersHorizontal size={34} weight="light" aria-hidden="true" />
            <h2 id="calibration-title">
              痛苦能被削弱，真相会不会一起变轻？
            </h2>
            <p>拖动校准值。这里没有无损的选项。</p>
          </div>

          <div className="calibration-control">
            <label htmlFor="memory-calibration">
              记忆抑制强度
              <output htmlFor="memory-calibration">{calibration}%</output>
            </label>
            <input
              id="memory-calibration"
              type="range"
              min="0"
              max="100"
              value={calibration}
              onChange={(event) =>
                setCalibration(Number(event.target.value))
              }
              style={
                {
                  "--value": `${calibration}%`,
                } as React.CSSProperties
              }
            />
            <div className="range-labels" aria-hidden="true">
              <span>完整保留</span>
              <span>全部抹除</span>
            </div>
          </div>

          <div className="calibration-reading" aria-live="polite">
            <strong>{meaning.title}</strong>
            <p>{meaning.body}</p>
          </div>
        </section>

        <section className="decision section" aria-labelledby="decision-title">
          <div className="decision-question">
            <h2 id="decision-title">你愿意保留痛苦吗？</h2>
            <p>请选择城市将如何处理这段共同记忆。</p>
          </div>

          <div className="decision-actions">
            <button
              className={decision === "keep" ? "is-selected" : ""}
              type="button"
              aria-pressed={decision === "keep"}
              onClick={() => choose("keep")}
            >
              <span>保留余光</span>
              <small>让证据继续被感到</small>
              <ArrowRight size={21} weight="light" aria-hidden="true" />
            </button>
            <button
              className={decision === "erase" ? "is-selected" : ""}
              type="button"
              aria-pressed={decision === "erase"}
              onClick={() => choose("erase")}
            >
              <span>抹除记忆</span>
              <small>让城市先恢复平静</small>
              <ArrowRight size={21} weight="light" aria-hidden="true" />
            </button>
          </div>

          <div className="outcome" aria-live="polite">
            {decision ? (
              <motion.div
                key={decision}
                initial={
                  reduceMotion ? false : { opacity: 0, filter: "blur(10px)" }
                }
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <Check size={28} weight="light" aria-hidden="true" />
                <h3>{outcomeCopy[decision].title}</h3>
                <p>{outcomeCopy[decision].body}</p>
              </motion.div>
            ) : (
              <div className="outcome-empty">
                <span>尚未作出决定</span>
                <p>校准不会替你回答，只有你能决定什么值得留下。</p>
              </div>
            )}
          </div>
        </section>

        <section className="receipt section" id="receipt">
          <div className="receipt-intro">
            <h2>留下一句不愿被优化掉的话</h2>
            <p>
              它只存在于当前页面，不会上传。你可以把回执复制走，也可以让它在关闭页面时消失。
            </p>
          </div>

          <form onSubmit={createReceipt}>
            <label htmlFor="memory-line">你的余光</label>
            <textarea
              id="memory-line"
              value={memory}
              maxLength={120}
              onChange={(event) => {
                setMemory(event.target.value);
                setReceiptReady(false);
                setCopyState("idle");
              }}
              placeholder="写下一句话，或一个你仍愿意承受的记忆。"
              aria-describedby="memory-help"
            />
            <div className="form-meta">
              <span id="memory-help">仅保存在当前会话</span>
              <span>{memory.length}/120</span>
            </div>
            <button
              className="button button-primary"
              type="submit"
              disabled={!decision || !memory.trim()}
            >
              生成回执
              <ArrowRight size={18} weight="light" aria-hidden="true" />
            </button>
            {!decision && (
              <p className="form-warning">
                <WarningCircle size={18} weight="light" aria-hidden="true" />
                请先完成上方决定。
              </p>
            )}
          </form>

          <div className="receipt-output" aria-live="polite">
            {receiptReady && decision ? (
              <>
                <p>{outcomeCopy[decision].receipt}</p>
                <blockquote>{memory.trim()}</blockquote>
                <button
                  type="button"
                  onClick={copyReceipt}
                  disabled={copyState === "copying"}
                >
                  {copyState === "copied" ? (
                    <Check size={18} weight="light" aria-hidden="true" />
                  ) : (
                    <Copy size={18} weight="light" aria-hidden="true" />
                  )}
                  {copyState === "copying"
                    ? "正在复制"
                    : copyState === "copied"
                      ? "已复制"
                      : "复制我的余光"}
                </button>
                {copyState === "error" && (
                  <p className="copy-error">
                    复制失败，请手动选择上方文字后复制。
                  </p>
                )}
              </>
            ) : (
              <div className="receipt-empty">
                <span>个人记忆回执</span>
                <p>完成决定并写下一句话后，回执会在这里出现。</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>《余光协议》是一部关于集体记忆、责任与安慰的互动科幻作品。</p>
        <a href="#opening">返回开场</a>
      </footer>
    </>
  );
}
