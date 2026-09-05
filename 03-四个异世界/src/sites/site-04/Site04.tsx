import { useEffect, useRef, useState } from "react";
import { ExhibitionLink } from "../../shared/ExhibitionLink";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { useWebGLSupport } from "../../shared/useWebGLSupport";
import { FossilScene } from "./FossilScene";
import "./site-04.css";

const stages = [
  {
    number: "01",
    title: "Threshold",
    depth: "−000 m",
    state: "A porous limit holds the surface light.",
  },
  {
    number: "02",
    title: "Vein",
    depth: "−1168 m",
    state: "Mineral seams answer the moving probe.",
  },
  {
    number: "03",
    title: "Choir",
    depth: "−3120 m",
    state: "The fossil detaches and begins to listen.",
  },
];

export default function Site04() {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const journeyRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [dragVelocity, setDragVelocity] = useState(0);
  const wheelRef = useRef(0);
  const lastChangeRef = useRef(0);
  const active = stages[stage];

  function selectStage(next: number) {
    setStage(Math.min(2, Math.max(0, next)));
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") selectStage(stage + 1);
      if (event.key === "ArrowUp" || event.key === "PageUp") selectStage(stage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  useEffect(() => {
    const journey = journeyRef.current;
    if (!journey) return;
    const onWheel = (event: WheelEvent) => {
      if ((stage === 0 && event.deltaY < 0) || (stage === 2 && event.deltaY > 0)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastChangeRef.current < 650) return;
      wheelRef.current += event.deltaY;
      if (Math.abs(wheelRef.current) > 100) {
        selectStage(stage + Math.sign(wheelRef.current));
        wheelRef.current = 0;
        lastChangeRef.current = now;
      }
    };
    journey.addEventListener("wheel", onWheel, { passive: false });
    return () => journey.removeEventListener("wheel", onWheel);
  }, [stage]);

  return (
    <main className="pale">
      {/* Direction contract: a three-chamber descent with one directly controlled
          fossil instrument. Avoid generic space, portal and HUD vocabularies. */}
      <section
        className="pale-journey"
        data-stage={stage}
        ref={journeyRef}
        aria-label="Unknown-world descent"
      >
        <header className="pale-header">
          <a href="#journey" className="pale-title">
            <strong>THE PALE BELOW</strong>
            <span>Blind observatory</span>
          </a>
          <p>
            Coordinate <span>00°17′B</span>
          </p>
          <ExhibitionLink />
        </header>

        <nav className="depth-rail" aria-label="Descent chambers">
          <ol>
            {stages.map((item, index) => (
              <li data-active={stage === index} data-visited={stage > index} key={item.number}>
                <button onClick={() => selectStage(index)} type="button">
                  <span>{item.number}</span>
                  <strong>{item.title}</strong>
                  <small>{item.depth}</small>
                </button>
              </li>
            ))}
          </ol>
          <ExhibitionLink label="Exit descent" />
        </nav>

        <div className="pale-world" id="journey">
          {webgl ? (
            <FossilScene
              onDragVelocity={setDragVelocity}
              reducedMotion={reducedMotion}
              stage={stage}
            />
          ) : (
            <div className="fossil-fallback" aria-label="Sectional silhouette of the fossil instrument">
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
          <p className="pale-instruction">
            {stage === 0 ? "Move the probe" : stage === 1 ? "Follow the seam" : "Drag the fossil"}
          </p>
        </div>

        <aside className="pale-observation" aria-live="polite">
          <span>Observation / {active.number}</span>
          <h1 key={active.title}>{active.title}</h1>
          <p>{active.state}</p>
          <dl>
            <div>
              <dt>Current depth</dt>
              <dd>{active.depth}</dd>
            </div>
            <div>
              <dt>Resonance</dt>
              <dd>{dragVelocity > 0.66 ? "Rising" : dragVelocity > 0.08 ? "Present" : "Quiet"}</dd>
            </div>
            <div>
              <dt>Probe state</dt>
              <dd>{stage === 2 ? "Listening" : "Scanning"}</dd>
            </div>
          </dl>
        </aside>

        <div className="pale-transcript" aria-label="Journey progress">
          <span>{active.depth} / {active.title}</span>
          <ol>
            {stages.map((item, index) => (
              <li data-active={stage === index} data-visited={stage > index} key={item.number}>
                {item.title}
              </li>
            ))}
          </ol>
          <a href="#field-notes">Field notes ↓</a>
        </div>
      </section>

      <section className="pale-notes" id="field-notes">
        <div>
          <p>Observation without conquest</p>
          <h2>The world does not become familiar because it becomes visible.</h2>
        </div>
        <figure>
          <img
            alt="Abstract fossil membrane texture with branching mineral ridges"
            src="/assets/site-04/fossil-surface.webp"
          />
          <figcaption>
            Surface sample / synthetic xenogeology study / no real specimen implied
          </figcaption>
        </figure>
        <p>
          Threshold establishes scale. Vein introduces response. Choir grants direct control but withholds
          an explanation. Every label describes only what this fictional instrument can observe.
        </p>
        <a href="#journey">Return to the descent</a>
      </section>
    </main>
  );
}
