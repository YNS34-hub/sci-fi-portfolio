import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DeviationField, {
  type DeviationFieldHandle,
  type FieldMode,
  type FieldStats,
} from "./DeviationField";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MODES: Array<{
  id: FieldMode;
  name: string;
  english: string;
  statement: string;
  instruction: string;
}> = [
  {
    id: "pressure",
    name: "压力",
    english: "PRESSURE",
    statement: "越靠近，秩序越用力把你推回原位。",
    instruction: "移动指针，观察十字刻度如何让出一条边界。",
  },
  {
    id: "drift",
    name: "漂移",
    english: "DRIFT",
    statement: "没有任何坐标真正静止，稳定只是观看得不够久。",
    instruction: "停下来，微小的位移会继续替你完成动作。",
  },
  {
    id: "echo",
    name: "回声",
    english: "ECHO",
    statement: "每一次决定，都比你晚一毫米抵达。",
    instruction: "拖动留下轨迹，朱砂色记录它没有重合的部分。",
  },
];

const INITIAL_STATS: FieldStats = {
  points: 0,
  maxDeviation: 0,
  energy: 0,
  pulses: 0,
};

function useLocalSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const enabledRef = useRef(false);
  const modeRef = useRef<FieldMode>("pressure");

  const ensureContext = useCallback(() => {
    if (contextRef.current && masterRef.current) {
      return { context: contextRef.current, master: masterRef.current };
    }

    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.14;
    master.connect(context.destination);
    contextRef.current = context;
    masterRef.current = master;
    return { context, master };
  }, []);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      enabledRef.current = enabled;
      if (!enabled) return;
      const audio = ensureContext();
      if (audio?.context.state === "suspended") {
        await audio.context.resume();
      }
    },
    [ensureContext],
  );

  const setMode = useCallback((mode: FieldMode) => {
    modeRef.current = mode;
  }, []);

  const play = useCallback(
    (strength = 0.5) => {
      if (!enabledRef.current) return;
      const audio = ensureContext();
      if (!audio) return;

      const { context, master } = audio;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const baseFrequency =
        modeRef.current === "pressure"
          ? 92
          : modeRef.current === "drift"
            ? 124
            : 168;

      oscillator.type = modeRef.current === "echo" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(baseFrequency + strength * 72, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, baseFrequency * 0.62),
        now + 0.48,
      );
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(720 + strength * 880, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16 + strength * 0.1, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + 0.56);
    },
    [ensureContext],
  );

  useEffect(
    () => () => {
      void contextRef.current?.close();
    },
    [],
  );

  return useMemo(
    () => ({ play, setEnabled, setMode }),
    [play, setEnabled, setMode],
  );
}

function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<DeviationFieldHandle>(null);
  const [mode, setMode] = useState<FieldMode>("pressure");
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [stats, setStats] = useState<FieldStats>(INITIAL_STATS);
  const [observationIndex, setObservationIndex] = useState(0);
  const [announcement, setAnnouncement] = useState(
    "校准场已就绪。移动指针，或按住拖动。",
  );
  const sound = useLocalSound();

  const handleStats = useCallback((nextStats: FieldStats) => {
    setStats((previous) => {
      if (
        previous.points === nextStats.points &&
        previous.maxDeviation === nextStats.maxDeviation &&
        previous.energy === nextStats.energy &&
        previous.pulses === nextStats.pulses
      ) {
        return previous;
      }
      return nextStats;
    });
  }, []);

  const selectMode = useCallback(
    (nextMode: FieldMode) => {
      setMode(nextMode);
      sound.setMode(nextMode);
      const selected = MODES.find((item) => item.id === nextMode);
      setAnnouncement(`${selected?.name ?? "偏差"}模式已启用。`);
      sound.play(0.42);
    },
    [sound],
  );

  const toggleSound = useCallback(() => {
    setSoundOn((current) => {
      const next = !current;
      void sound.setEnabled(next);
      setAnnouncement(next ? "声音已开启。" : "声音已关闭。");
      if (next) window.setTimeout(() => sound.play(0.62), 40);
      return next;
    });
  }, [sound]);

  const toggleMotion = useCallback(() => {
    setReducedMotion((current) => {
      const next = !current;
      setAnnouncement(next ? "动态已减弱。" : "完整动态已恢复。");
      return next;
    });
  }, []);

  const clearField = useCallback(() => {
    fieldRef.current?.clear();
    setAnnouncement("轨迹已清空，可以重新校准。");
  }, []);

  const createPulse = useCallback(() => {
    fieldRef.current?.pulse();
    setAnnouncement("偏差脉冲已释放。");
  }, []);

  const exportField = useCallback(() => {
    fieldRef.current?.exportArtwork();
    setAnnouncement("正在封存这一刻，图像将下载到本机。");
    sound.play(0.9);
  }, [sound]);

  useEffect(() => {
    sound.setMode(mode);
  }, [mode, sound]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      setAnnouncement(event.matches ? "已跟随系统减弱动态。" : "已跟随系统恢复完整动态。");
    };
    preference.addEventListener("change", handlePreferenceChange);
    return () => preference.removeEventListener("change", handlePreferenceChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (event.code === "Space") {
        event.preventDefault();
        createPulse();
      } else if (event.key === "1") {
        selectMode("pressure");
      } else if (event.key === "2") {
        selectMode("drift");
      } else if (event.key === "3") {
        selectMode("echo");
      } else if (event.key.toLowerCase() === "m") {
        toggleSound();
      } else if (event.key.toLowerCase() === "r") {
        toggleMotion();
      } else if (event.key.toLowerCase() === "c") {
        clearField();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearField, createPulse, selectMode, toggleMotion, toggleSound]);

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set(".hero-copy > *", { clearProps: "all" });
        gsap.set(".stack-plate", { clearProps: "transform" });
        return;
      }

      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTimeline
        .from(".hero-title-line", {
          yPercent: 118,
          duration: 1.15,
          stagger: 0.12,
        })
        .from(
          ".hero-intro, .hero-actions, .hero-guidance",
          { y: 22, opacity: 0, duration: 0.76, stagger: 0.09 },
          "-=0.52",
        );

      gsap.to(".progress-fill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: 0.25,
        },
      });

      ScrollTrigger.matchMedia({
        "(min-width: 900px)": () => {
          ScrollTrigger.create({
            trigger: ".laboratory",
            start: "top top+=104",
            end: "bottom bottom-=72",
            pin: ".laboratory-intro",
            pinSpacing: false,
          });
        },
      });

      gsap.utils.toArray<HTMLElement>(".stack-plate").forEach((plate, index) => {
        gsap.fromTo(
          plate,
          {
            y: 180 + index * 24,
            rotate: index % 2 === 0 ? -1.8 : 1.5,
            scale: 0.94,
          },
          {
            y: 0,
            rotate: index === 2 ? 0 : index % 2 === 0 ? -0.3 : 0.35,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: plate,
              start: "top 92%",
              end: "top 15%",
              scrub: 1.1,
            },
          },
        );
      });

      gsap.from(".manifesto-word", {
        opacity: 0.12,
        stagger: 0.025,
        ease: "none",
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top 72%",
          end: "bottom 54%",
          scrub: 0.8,
        },
      });
    },
    { scope: shellRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  const observations = useMemo(
    () => [
      {
        title: stats.points > 8 ? "你的手拒绝成为直线。" : "一条尚未发生的线。",
        text:
          stats.points > 8
            ? `它已经做出 ${stats.points} 个局部决定，没有一个需要被修正。`
            : "按住校准场并拖动。作品不会替你完成这一步。",
      },
      {
        title: stats.maxDeviation > 12 ? "误差开始拥有尺度。" : "偏差仍然很轻。",
        text: `最远位移被记录为 ${stats.maxDeviation.toFixed(1)} 毫米。这里的数字不是成绩，只是证词。`,
      },
      {
        title: stats.pulses > 0 ? "系统听见了你的停顿。" : "空间仍在等待一次脉冲。",
        text:
          stats.pulses > 0
            ? `${stats.pulses} 次脉冲经过网格，秩序恢复了，但没有回到原处。`
            : "按空格键，让一个圆从你所在的位置穿过整张纸。",
      },
    ],
    [stats],
  );

  const currentMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const manifesto =
    "精确让机器可靠，偏差让人能够被认出。我们把每一次犹豫称作噪声，把每一次偏离称作错误，却忘记生命从不与坐标完全重合。";

  return (
    <div
      ref={shellRef}
      className="artwork-shell"
      data-mode={mode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <a className="skip-link" href="#laboratory">
        跳到偏差实验
      </a>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" />
      </div>

      <header className="instrument-rail" aria-label="作品控制栏">
        <a className="wordmark" href="#entry" aria-label="返回作品开头">
          <span>1MM</span>
          <span className="wordmark-offset">OFF</span>
        </a>
        <div className="rail-reading" aria-hidden="true">
          <span>{currentMode.english}</span>
          <span>{String(stats.points).padStart(3, "0")} TRACE</span>
        </div>
        <div className="rail-controls">
          <button type="button" onClick={toggleSound} aria-pressed={soundOn}>
            声音 {soundOn ? "开" : "关"}
          </button>
          <button
            type="button"
            onClick={toggleMotion}
            aria-pressed={reducedMotion}
          >
            动态 {reducedMotion ? "减弱" : "完整"}
          </button>
        </div>
      </header>

      <main className="main-canvas overflow-x-hidden">
        <section className="hero" id="entry" aria-labelledby="hero-title">
          <DeviationField
            ref={fieldRef}
            mode={mode}
            reducedMotion={reducedMotion}
            onStats={handleStats}
            onImpulse={sound.play}
          />
          <div className="hero-wash" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-intro">一件关于控制、偏差与生命痕迹的交互作品</p>
            <h1 className="hero-title max-w-6xl" id="hero-title">
              <span className="hero-title-mask">
                <span className="hero-title-line">一毫米之外</span>
              </span>
              <span className="hero-title-mask hero-title-english">
                <span className="hero-title-line">ONE MILLIMETRE OFF</span>
              </span>
            </h1>
            <p className="hero-summary">
              移动，让秩序变形。拖动，留下无法复刻的线。你不需要把它画好。
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="button button-dark"
                onClick={() =>
                  document
                    .getElementById("laboratory")
                    ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
                }
              >
                进入偏差实验
              </button>
              <button
                type="button"
                className="button button-light"
                onClick={createPulse}
              >
                释放一次脉冲
              </button>
            </div>
          </div>
          <div className="hero-guidance" aria-hidden="true">
            <span>移动 / 影响</span>
            <span>拖动 / 留痕</span>
            <span>空格 / 脉冲</span>
          </div>
        </section>

        <div className="measure-tape" aria-hidden="true">
          <div className="measure-tape-track">
            {[0, 1].map((copy) => (
              <div className="measure-tape-copy" key={copy}>
                <span>PERFECTION IS A CLOSED SYSTEM</span>
                <i />
                <span>差异从一毫米开始</span>
                <i />
                <span>STAY SLIGHTLY UNALIGNED</span>
                <i />
                <span>不要急着归零</span>
                <i />
              </div>
            ))}
          </div>
        </div>

        <section className="manifesto" aria-label="作品宣言">
          <p>
            {manifesto.split("").map((character, index) => (
              <span className="manifesto-word" key={`${character}-${index}`}>
                {character}
              </span>
            ))}
          </p>
        </section>

        <section
          className="laboratory"
          id="laboratory"
          aria-labelledby="laboratory-title"
        >
          <div className="laboratory-layout">
            <div className="laboratory-intro">
              <p className="overline">偏差不是故障，是一种观看方法。</p>
              <h2 id="laboratory-title">三种力，作用于同一张纸。</h2>
              <p>
                选择一种模式，再回到上方的校准场。数字键 1、2、3 也可以切换。
              </p>
              <div className="mode-readout" aria-live="polite">
                <span>{currentMode.name}</span>
                <span>{currentMode.english}</span>
              </div>
            </div>

            <div className="mode-accordion" aria-label="偏差模式">
              {MODES.map((item) => {
                const active = item.id === mode;
                return (
                  <article
                    className="mode-panel"
                    data-active={active ? "true" : "false"}
                    key={item.id}
                  >
                    <button
                      type="button"
                      className="mode-panel-trigger"
                      aria-expanded={active}
                      onClick={() => selectMode(item.id)}
                      onFocus={() => selectMode(item.id)}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") selectMode(item.id);
                      }}
                    >
                      <span className="mode-name">{item.name}</span>
                      <span className="mode-english">{item.english}</span>
                    </button>
                    <div className="mode-panel-content" aria-hidden={!active}>
                      <p>{item.statement}</p>
                      <small>{item.instruction}</small>
                      <div className={`mode-figure mode-figure-${item.id}`}>
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="measurement-grid grid-flow-dense">
            <div className="measurement-cell measurement-trace">
              <span className="measurement-title">正在形成的轨迹</span>
              <strong>{String(stats.points).padStart(3, "0")}</strong>
              <div className="trace-rule" aria-hidden="true">
                <span style={{ width: `${Math.min(100, stats.points / 3)}%` }} />
              </div>
              <p>每个采样点都来自你的手，不由随机数补齐。</p>
            </div>
            <div className="measurement-cell measurement-signal">
              <span className="measurement-title">当前力场</span>
              <strong>{currentMode.name}</strong>
              <p>{currentMode.statement}</p>
            </div>
            <div className="measurement-cell measurement-deviation">
              <span className="measurement-title">最远偏差</span>
              <div>
                <strong>{stats.maxDeviation.toFixed(1)}</strong>
                <span>毫米</span>
              </div>
              <p>这是证词，不是分数。</p>
            </div>
            <div className="measurement-cell measurement-energy">
              <span className="measurement-title">尚未消散的能量</span>
              <div className="energy-field" aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => (
                  <span
                    key={index}
                    style={{
                      opacity: index < Math.ceil(stats.energy / 8.34) ? 1 : 0.16,
                    }}
                  />
                ))}
              </div>
              <p>停止移动，能量会慢慢回到纸面。</p>
            </div>
          </div>
        </section>

        <section className="stack-chapter" aria-labelledby="stack-title">
          <header className="stack-heading">
            <p className="overline">所有系统都想结束偏差。</p>
            <h2 id="stack-title">但生命靠它保持可辨认。</h2>
          </header>
          <div className="stack-zone">
            <article className="stack-plate plate-zero">
              <div className="plate-word">归零</div>
              <div className="plate-copy">
                <span>ZERO</span>
                <h3>精确是一种善意，也是一种压力。</h3>
                <p>
                  网格帮助我们抵达同一个地方。它也让那些没有对齐的部分，看起来像需要被删除。
                </p>
              </div>
              <div className="zero-mark" aria-hidden="true" />
            </article>
            <article className="stack-plate plate-noise">
              <div className="plate-word">噪声</div>
              <div className="plate-copy">
                <span>NOISE</span>
                <h3>身体从不输出完全相同的信号。</h3>
                <p>
                  呼吸、迟疑、力度与疲惫，把同一个动作变成无数个版本。差别很小，但足以证明你来过。
                </p>
              </div>
              <div className="noise-field" aria-hidden="true">
                {Array.from({ length: 42 }, (_, index) => <i key={index} />)}
              </div>
            </article>
            <article className="stack-plate plate-presence">
              <div className="plate-word">在场</div>
              <div className="plate-copy">
                <span>PRESENCE</span>
                <h3>不要修复所有误差。</h3>
                <p>
                  留下一毫米，给那些不能被模板化的部分。它不完美，却比完美更接近一个人。
                </p>
              </div>
              <button type="button" className="pulse-button" onClick={createPulse}>
                让偏差穿过一次
              </button>
            </article>
          </div>
        </section>

        <section className="observatory" aria-labelledby="observation-title">
          <div className="observation-specimen" aria-hidden="true">
            <div className="specimen-ring specimen-ring-one" />
            <div className="specimen-ring specimen-ring-two" />
            <div className="specimen-origin" />
            <span>{stats.maxDeviation.toFixed(1)}</span>
          </div>
          <div className="observation-copy">
            <p className="overline">作品正在回应你的动作。</p>
            <div className="observation-window">
              <p className="observation-count">
                {String(observationIndex + 1).padStart(2, "0")} / 03
              </p>
              <h2 id="observation-title">{observations[observationIndex].title}</h2>
              <p>{observations[observationIndex].text}</p>
            </div>
            <div className="observation-controls">
              <button
                type="button"
                onClick={() =>
                  setObservationIndex((current) =>
                    current === 0 ? observations.length - 1 : current - 1,
                  )
                }
              >
                上一则
              </button>
              <button
                type="button"
                onClick={() =>
                  setObservationIndex((current) =>
                    current === observations.length - 1 ? 0 : current + 1,
                  )
                }
              >
                下一则
              </button>
            </div>
          </div>
        </section>

        <section className="archive" aria-labelledby="archive-title">
          <div className="archive-preview" aria-hidden="true">
            <div className="archive-grid" />
            <div
              className="archive-orbit"
              style={{
                transform: `translate(${Math.min(26, stats.maxDeviation * 0.32)}px, ${Math.min(18, stats.points * 0.04)}px)`,
              }}
            />
            <div className="archive-cross">+</div>
          </div>
          <div className="archive-copy">
            <p className="overline">这件作品不会把你的数据上传到任何地方。</p>
            <h2 id="archive-title">把误差留下。</h2>
            <p>
              将当前轨迹封存为一张本地图像，或清空它，让下一次动作重新开始。所有运算只发生在这台电脑上。
            </p>
            <div className="archive-actions">
              <button type="button" className="button button-paper" onClick={exportField}>
                封存为图像
              </button>
              <button type="button" className="button button-outline" onClick={clearField}>
                重新校准
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="artwork-footer">
        <p>一毫米之外 / ONE MILLIMETRE OFF</p>
        <p>本地版 · 无需账号 · 不上传数据</p>
        <a href="#entry">回到开头</a>
      </footer>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

export default App;
