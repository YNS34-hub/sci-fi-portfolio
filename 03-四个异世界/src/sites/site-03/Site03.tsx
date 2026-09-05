import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { ExhibitionLink } from "../../shared/ExhibitionLink";
import { useReducedMotion } from "../../shared/useReducedMotion";
import "./site-03.css";

const chapters = [
  {
    number: "01",
    title: "Prologue",
    word: "TRACE",
    image: "/assets/site-03/look-01-vermilion.webp",
    alt: "Close architectural crop of an adult wearing a vermilion coat beside a pale slatted wall",
    look: "Vermilion / architectural wool",
    line: "A first image holds its ground.",
  },
  {
    number: "02",
    title: "Afterimage",
    word: "AFTER",
    image: "/assets/site-03/look-02-cobalt.webp",
    alt: "Adult fashion model in a cobalt coat holding pigeons before Milan Cathedral",
    look: "Cobalt / folded technical twill",
    line: "The portrait remains after the surface moves.",
  },
  {
    number: "03",
    title: "Displacement",
    word: "LINE",
    image: "/assets/site-03/look-03-pleat.webp",
    alt: "Adult model in precise black tailoring against a violet dusk field",
    look: "Black tailoring / violet field",
    line: "Clothing redraws the body’s edge.",
  },
  {
    number: "04",
    title: "Reassembly",
    word: "RETURN",
    image: "/assets/site-03/look-04-sleeve.webp",
    alt: "Wind-swept profile of an adult wearing a deep lacquer-red coat",
    look: "Lacquer red / wind profile",
    line: "What was underneath becomes the final surface.",
  },
];

type TearStyle = CSSProperties & { "--tear": number; "--tension": number };

export default function Site03() {
  const reducedMotion = useReducedMotion();
  const issueRef = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const [tear, setTear] = useState(68);
  const [dragging, setDragging] = useState(false);
  const [tension, setTension] = useState(0);
  const dragRef = useRef<{ lastX: number; startX: number; startTear: number } | null>(null);
  const wheelRef = useRef(0);
  const lastChangeRef = useRef(0);

  const active = chapters[chapter];
  const under = chapters[(chapter + 1) % chapters.length];

  function selectChapter(next: number) {
    const clamped = Math.min(chapters.length - 1, Math.max(0, next));
    setChapter(clamped);
    setTear(reducedMotion ? 62 : 73);
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    dragRef.current = { lastX: event.clientX, startX: event.clientX, startTear: tear };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const next = drag.startTear + ((event.clientX - drag.startX) / window.innerWidth) * 100;
    setTension(Math.min(1, Math.abs(event.clientX - drag.lastX) / 24));
    drag.lastX = event.clientX;
    setTear(Math.min(88, Math.max(34, next)));
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    dragRef.current = null;
    setDragging(false);
    setTension(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") selectChapter(chapter + 1);
      if (event.key === "ArrowLeft") selectChapter(chapter - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, reducedMotion]);

  useEffect(() => {
    const issue = issueRef.current;
    if (!issue) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      const delta = event.deltaY + event.deltaX;
      if ((chapter === 0 && delta < 0) || (chapter === chapters.length - 1 && delta > 0)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastChangeRef.current < 520) return;
      wheelRef.current += delta;
      if (Math.abs(wheelRef.current) > 110) {
        selectChapter(chapter + Math.sign(wheelRef.current));
        wheelRef.current = 0;
        lastChangeRef.current = now;
      }
    };
    issue.addEventListener("wheel", onWheel, { passive: false });
    return () => issue.removeEventListener("wheel", onWheel);
  }, [chapter, reducedMotion]);

  const style = { "--tear": tear, "--tension": tension } as TearStyle;

  return (
    <main className="tearline" data-dragging={dragging} style={style}>
      {/* Direction contract: a full-bleed horizontal issue where the tear is
          timeline, mask and navigation. Keep photography dominant and UI flat. */}
      <section className="tear-issue" ref={issueRef} aria-label="TEAR/LINE fashion issue">
        <header className="tear-header">
          <a href="#issue" className="tear-masthead">
            TEAR/LINE
          </a>
          <p>
            Sequence {active.number} <span>{active.title}</span>
          </p>
          <ExhibitionLink />
        </header>

        <div className="tear-stage" id="issue">
          <figure className="tear-layer tear-layer--under">
            <img alt={under.alt} src={under.image} />
          </figure>
          <figure className="tear-layer tear-layer--front">
            <img alt={active.alt} src={active.image} />
          </figure>
          <div className="tear-fiber" aria-hidden="true" />

          <p className="tear-word tear-word--front" aria-hidden="true">
            {active.word}
          </p>
          <p className="tear-word tear-word--under" aria-hidden="true">
            {active.word}
          </p>

          <div className="tear-caption">
            <p>{active.line}</p>
            <span>{active.look}</span>
            <span>Licensed 4K photograph / original composite</span>
          </div>

          <button
            aria-label={`Drag the tear to reveal ${under.title}`}
            className="tear-handle"
            onPointerCancel={endDrag}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            type="button"
          >
            <span>Pull / {under.title}</span>
            <i aria-hidden="true" />
          </button>
        </div>

        <nav className="tear-rail" aria-label="Issue chapters">
          <ol>
            {chapters.map((item, index) => (
              <li key={item.number}>
                <button
                  aria-current={chapter === index ? "page" : undefined}
                  onClick={() => selectChapter(index)}
                  type="button"
                >
                  <span>{item.number}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
          <a href="#production">Production notes ↓</a>
        </nav>
      </section>

      <section className="tear-production" id="production">
        <div>
          <p>Four image eras</p>
          <h1>The campaign changes by revealing what it covered.</h1>
        </div>
        <p>
          Four licensed high-resolution photographs are reframed into an original fictional editorial.
          The names, chapter structure and publication have no commercial counterpart. The tear remains
          code-native so it can respond to wheel, pointer, keyboard and viewport changes.
        </p>
        <a href="#issue">Return to the issue</a>
      </section>
    </main>
  );
}
