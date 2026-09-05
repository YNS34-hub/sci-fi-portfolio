import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  FlowerLotus,
  Leaf,
  List,
  MapPin,
  MoonStars,
  SpeakerHigh,
  X,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const observations = [
  {
    time: "19:40",
    name: "夜香木的第一层气味",
    detail:
      "温度跌破 28°C 后，挥发物浓度开始上升。先闻到青叶，再出现极轻的蜂蜜与湿土。",
    image: "/media/observation-flower.jpg",
    place: "东温室 · 低光带",
    tone: "lime",
  },
  {
    time: "21:15",
    name: "叶脉里的城市低频",
    detail:
      "接触式传感器把不可闻的细微振动放大。地铁经过时，龟背竹会留下十四秒的波纹。",
    image: "/media/observation-veins.jpg",
    place: "声纹廊 · 4 号台",
    tone: "ember",
  },
  {
    time: "23:05",
    name: "月光下的气孔呼吸",
    detail:
      "热成像镜头捕捉叶面蒸腾。你看到的不是颜色变化，而是一株植物缓慢而稳定的呼吸。",
    image: "/media/observation-moonflower.jpg",
    place: "天台花房 · 西侧",
    tone: "silver",
  },
];

const voices = [
  {
    quote:
      "我原以为这是一次导览，后来发现它更像一场被植物重新校准的听觉练习。走出温室时，路边的树都变得具体了。",
    name: "林默",
    role: "声音设计师",
    portrait: "/media/portrait-lin.jpg",
  },
  {
    quote:
      "夜里没有日光替植物解释颜色，气味、温度和触感于是都被放大。九十分钟很安静，却没有一分钟是空的。",
    name: "周祺",
    role: "建筑编辑",
    portrait: "/media/portrait-zhou.jpg",
  },
  {
    quote:
      "孩子最喜欢叶脉拾音器。我最喜欢观测员不急着给答案，只让我们先看、先听，再写下自己的判断。",
    name: "陈鹭",
    role: "自然教育工作者",
    portrait: "/media/portrait-chen.jpg",
  },
];

const marqueeItems = [
  "昙花",
  "晚香玉",
  "夜来香",
  "月见草",
  "紫茉莉",
  "睡莲",
  "木本曼陀罗",
  "夜合欢",
];

function Button({ children, variant = "light", onClick, type = "button" }) {
  return (
    <button className={`button button--${variant}`} onClick={onClick} type={type}>
      <span>{children}</span>
      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
    </button>
  );
}

function BookingDialog({ dialogRef }) {
  const [submitted, setSubmitted] = useState(false);
  const [date, setDate] = useState("周五 20:00");
  const [people, setPeople] = useState("2");

  const closeDialog = () => {
    dialogRef.current?.close();
    window.setTimeout(() => setSubmitted(false), 250);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <dialog className="booking-dialog" ref={dialogRef}>
      <div className="booking-shell">
        <button
          className="dialog-close"
          type="button"
          aria-label="关闭预约窗口"
          onClick={closeDialog}
        >
          <X size={24} />
        </button>

        {submitted ? (
          <div className="booking-success" aria-live="polite">
            <span className="success-mark">
              <Check size={34} weight="bold" />
            </span>
            <p className="eyebrow">席位已暂留</p>
            <h2>夜里见。</h2>
            <p>
              已为你暂留 {date} 的 {people} 个席位。正式确认信将在十分钟内发送到你填写的邮箱。
            </p>
            <Button variant="dark" onClick={closeDialog}>
              完成
            </Button>
          </div>
        ) : (
          <>
            <div className="booking-copy">
              <p className="eyebrow">九十分钟夜间观测</p>
              <h2>选择你的入夜时刻</h2>
              <p>
                每场最多八人。门票包含观测器材、个人气味图谱与一杯当夜植物冷萃。
              </p>
            </div>
            <form className="booking-form" onSubmit={handleSubmit}>
              <fieldset>
                <legend>场次</legend>
                <div className="choice-grid">
                  {["周五 20:00", "周六 19:30", "周六 22:00"].map((slot) => (
                    <label className={date === slot ? "choice is-selected" : "choice"} key={slot}>
                      <input
                        type="radio"
                        name="date"
                        value={slot}
                        checked={date === slot}
                        onChange={(event) => setDate(event.target.value)}
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>人数</span>
                <select value={people} onChange={(event) => setPeople(event.target.value)}>
                  <option value="1">1 人</option>
                  <option value="2">2 人</option>
                  <option value="3">3 人</option>
                  <option value="4">4 人</option>
                </select>
              </label>
              <label className="field">
                <span>联系邮箱</span>
                <input type="email" placeholder="name@example.com" required />
              </label>
              <label className="consent">
                <input type="checkbox" required />
                <span>我已阅读夜间到访须知，并确认无强烈花粉过敏史。</span>
              </label>
              <Button variant="dark" type="submit">
                暂留席位 · ¥188
              </Button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

function App() {
  const root = useRef(null);
  const dialogRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);

  const openBooking = () => {
    setMenuOpen(false);
    dialogRef.current?.showModal();
  };

  const moveVoice = (direction) => {
    setVoiceIndex((current) => (current + direction + voices.length) % voices.length);
  };

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".nav-shell", { y: -28, opacity: 0, duration: 0.85 })
        .from(".hero-line", { yPercent: 115, duration: 1.05, stagger: 0.12 }, "-=0.45")
        .from(".hero-support > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.55")
        .from(".hero-visual", { scale: 0.86, opacity: 0, duration: 1.25 }, "-=1.05");

      gsap.utils.toArray(".scrub-word").forEach((word, index, words) => {
        gsap.fromTo(
          word,
          { opacity: 0.1 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".manifesto-text",
              start: `top+=${(index / words.length) * 55}% 78%`,
              end: `top+=${18 + (index / words.length) * 55}% 48%`,
              scrub: 0.7,
            },
          },
        );
      });

      gsap.utils.toArray(".scale-fade-media").forEach((media) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: media,
            start: "top 92%",
            end: "bottom 8%",
            scrub: 0.8,
          },
        });
        timeline
          .fromTo(media, { scale: 0.82, opacity: 0.42 }, { scale: 1, opacity: 1, ease: "none" })
          .to(media, { scale: 1.025, opacity: 0.24, ease: "none" });
      });

      gsap.from(".bento-card", {
        y: 70,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".archive-grid",
          start: "top 78%",
        },
      });

      const heroVisual = root.current?.querySelector(".hero-visual");
      const rotateX = heroVisual ? gsap.quickTo(heroVisual, "rotationX", { duration: 0.65, ease: "power3.out" }) : null;
      const rotateY = heroVisual ? gsap.quickTo(heroVisual, "rotationY", { duration: 0.65, ease: "power3.out" }) : null;
      const lift = heroVisual ? gsap.quickTo(heroVisual, "y", { duration: 0.65, ease: "power3.out" }) : null;

      const handleHeroPointer = (event) => {
        if (!heroVisual || !rotateX || !rotateY || !lift) return;
        const bounds = heroVisual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateX(y * -7);
        rotateY(x * 9);
        lift(-8);
      };

      const resetHeroPointer = () => {
        rotateX?.(0);
        rotateY?.(0);
        lift?.(0);
      };

      heroVisual?.addEventListener("pointermove", handleHeroPointer);
      heroVisual?.addEventListener("pointerleave", resetHeroPointer);

      const mediaQuery = gsap.matchMedia();
      mediaQuery.add("(min-width: 901px)", () => {
        ScrollTrigger.create({
          trigger: ".route-header",
          start: "top 116px",
          end: "+=220",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        });
      });

      return () => {
        heroVisual?.removeEventListener("pointermove", handleHeroPointer);
        heroVisual?.removeEventListener("pointerleave", resetHeroPointer);
        mediaQuery.revert();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: root },
  );

  const manifesto =
    "我们把植物从白天的颜色里解放出来。当视觉退后，叶片的温度、花朵的气味、茎秆里的低频与空气中细小的湿度变化，开始共同讲述一株生命真正的夜晚。";

  return (
    <main className="site-shell" ref={root}>
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="nav-wrap">
        <nav className="nav-shell" aria-label="主导航">
          <a className="brand" href="#top" aria-label="NOCTURNE 首页">
            <FlowerLotus size={22} weight="fill" />
            <span>NOCTURNE</span>
          </a>
          <div className={menuOpen ? "nav-links is-open" : "nav-links"}>
            <a href="#archive" onClick={() => setMenuOpen(false)}>
              观测档案
            </a>
            <a href="#route" onClick={() => setMenuOpen(false)}>
              今夜路线
            </a>
            <a href="#voices" onClick={() => setMenuOpen(false)}>
              到访者
            </a>
            <button className="nav-book" type="button" onClick={openBooking}>
              预约夜访
              <ArrowUpRight size={15} weight="bold" />
            </button>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-heading" aria-label="当城市熄灯，植物开始说话">
          <div className="hero-line-mask">
            <h1 className="hero-line">当城市熄灯，</h1>
          </div>
          <div className="hero-line-mask hero-line-mask--second">
            <h1 className="hero-line">
              植物
              <span
                className="inline-leaf"
                style={{
                  backgroundImage: "url(/media/inline-leaf.jpg)",
                }}
                aria-hidden="true"
              />
              开始说话。
            </h1>
          </div>
        </div>

        <div className="hero-support">
          <div className="hero-intro">
            <MoonStars size={20} weight="fill" />
            <p>一座只在日落后开放的植物感知实验室。</p>
          </div>
          <div className="hero-actions">
            <Button onClick={openBooking}>预约今夜</Button>
            <a className="text-link" href="#archive">
              进入观测档案
              <ArrowDown size={18} />
            </a>
          </div>
        </div>

        <figure className="hero-visual media-hover">
          <img
            src="/media/hero-greenhouse.jpg"
            alt="入夜后的植物温室"
            fetchPriority="high"
            decoding="async"
          />
          <figcaption>
            <span>上海 · 苏州河畔</span>
            <span>19:00 — 00:30</span>
          </figcaption>
        </figure>

        <a className="hero-scroll" href="#archive" aria-label="向下浏览观测档案">
          <span>向下</span>
          <ArrowDown size={18} />
        </a>
      </section>

      <div className="species-marquee" aria-label="本季观测植物">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <Leaf size={17} weight="fill" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <section className="archive section-pad" id="archive">
        <div className="section-intro">
          <p>感官档案，持续更新</p>
          <h2>
            不是看见一株植物，
            <br />
            而是进入它的时间。
          </h2>
        </div>

        <div className="archive-grid">
          <article className="bento-card bento-card--main media-hover">
            <img
              src="/media/archive-greenhouse.jpg"
              alt="被投影光线覆盖的叶片细节"
              loading="lazy"
              decoding="async"
            />
            <div className="card-wash" />
            <div className="bento-copy">
              <span className="card-icon">
                <SpeakerHigh size={23} weight="fill" />
              </span>
              <div>
                <h3>叶脉声纹库</h3>
                <p>
                  采集 47 种植物的茎叶振动，并将低于人耳阈值的频率转译成可以步入的六声道声场。
                </p>
              </div>
            </div>
          </article>

          <article className="bento-card bento-card--scent">
            <div className="scent-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="bento-topline">
              <Leaf size={23} weight="fill" />
              <span>每晚 20:20 采样</span>
            </div>
            <div>
              <h3>气味天气</h3>
              <p>温度、湿度与开花阶段，共同决定今晚的气味边界。</p>
            </div>
          </article>

          <article className="bento-card bento-card--light media-hover">
            <div className="light-thumb">
              <img
                src="/media/archive-flower.jpg"
                alt="植物叶片的低光影像"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="light-copy">
              <span>低光观察</span>
              <h3>不惊扰的观看</h3>
              <p>全程使用 0.3 lux 以下红光，保留植物原本的夜间节律。</p>
            </div>
          </article>
        </div>
      </section>

      <section className="manifesto section-pad">
        <p className="manifesto-kicker">请把白天的判断留在门外。</p>
        <p className="manifesto-text">
          {manifesto.split("").map((character, index) => (
            <span className="scrub-word" key={`${character}-${index}`}>
              {character}
            </span>
          ))}
        </p>
      </section>

      <section className="route section-pad" id="route">
        <div className="route-header">
          <div>
            <p>一次夜访，三次感官换挡</p>
            <h2>今夜的观测路线</h2>
          </div>
          <p>
            路线随花期与天气改变。没有统一答案，只有被精确安排的注意力。
          </p>
        </div>

        <div className="observation-list">
          {observations.map((observation, index) => (
            <article className={`observation observation--${observation.tone}`} key={observation.time}>
              <div className="observation-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="observation-media">
                <img
                  className="scale-fade-media"
                  src={observation.image}
                  alt={observation.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="observation-copy">
                <div className="observation-time">{observation.time}</div>
                <h3>{observation.name}</h3>
                <p>{observation.detail}</p>
                <span className="place">
                  <MapPin size={17} weight="fill" />
                  {observation.place}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="voices section-pad" id="voices">
        <div className="voices-stage">
          <div className="portrait-stack" aria-hidden="true">
            {voices.map((voice, index) => {
              const offset = (index - voiceIndex + voices.length) % voices.length;
              return (
                <img
                  key={voice.name}
                  src={voice.portrait}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{
                    transform: `translate(${offset * 26}px, ${offset * 15}px) rotate(${offset * 3 - 3}deg)`,
                    zIndex: voices.length - offset,
                    opacity: offset > 1 ? 0 : 1,
                  }}
                />
              );
            })}
          </div>

          <div className="voice-copy" aria-live="polite">
            <div className="quote-mark">“</div>
            <blockquote>{voices[voiceIndex].quote}</blockquote>
            <div className="voice-person">
              <strong>{voices[voiceIndex].name}</strong>
              <span>{voices[voiceIndex].role}</span>
            </div>
          </div>

          <div className="voice-controls">
            <button type="button" onClick={() => moveVoice(-1)} aria-label="上一位到访者">
              <ArrowLeft size={21} />
            </button>
            <span>
              {String(voiceIndex + 1).padStart(2, "0")} / {String(voices.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => moveVoice(1)} aria-label="下一位到访者">
              <ArrowRight size={21} />
            </button>
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="closing-image scale-fade-media">
          <img
            src="/media/closing-greenhouse.jpg"
            alt="月光照进植物温室"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="closing-wash" />
        <div className="closing-content">
          <p>最后入场时间 23:00</p>
          <h2>今晚，让别的生命成为主角。</h2>
          <Button onClick={openBooking}>预约夜访 · ¥188</Button>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <FlowerLotus size={34} weight="fill" />
          <span>NOCTURNE</span>
        </div>
        <div className="footer-columns">
          <div>
            <strong>到访</strong>
            <p>上海市静安区光复路 317 号</p>
            <p>周五至周日 19:00 — 00:30</p>
          </div>
          <div>
            <strong>联系</strong>
            <a href="mailto:night@nocturne-lab.cn">night@nocturne-lab.cn</a>
            <a href="tel:+862162083717">+86 21 6208 3717</a>
          </div>
          <div>
            <strong>关注</strong>
            <a href="#archive">小红书</a>
            <a href="#archive">微信公众号</a>
          </div>
        </div>
        <div className="footer-base">
          <span>© 2026 NOCTURNE 夜植观测所</span>
          <div>
            <a href="#top">隐私</a>
            <a href="#top">到访须知</a>
          </div>
        </div>
      </footer>

      <BookingDialog dialogRef={dialogRef} />
    </main>
  );
}

export default App;
