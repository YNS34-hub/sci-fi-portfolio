import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ExhibitionLink } from "../../shared/ExhibitionLink";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { useWebGLSupport } from "../../shared/useWebGLSupport";
import { MeridianScene } from "./MeridianScene";
import "./site-01.css";

const steps = [
  ["01", "Foundation frame", "Oxidized titanium"],
  ["02", "Tension petal", "Satin alloy"],
  ["03", "Axial heart", "Verification insert"],
  ["04", "Quartz veil", "Smoked crystal"],
  ["05", "Balance vane", "Brushed titanium"],
  ["06", "Closing frame", "Obsidian finish"],
];

export default function Site01() {
  const heroRef = useRef<HTMLElement>(null);
  const materialsRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0.08);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const update = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const next = Math.min(1, Math.max(0.04, -rect.top / travel));
      setProgress(next);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const section = materialsRef.current;
    if (!section || reducedMotion) return;
    const figures = gsap.utils.toArray<HTMLElement>("figure", section);
    gsap.set(figures, {
      clipPath: "inset(10% 0 0 0)",
      opacity: 0.28,
      y: 36,
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(figures, {
          clearProps: "clipPath,opacity,transform",
          clipPath: "inset(0% 0 0 0)",
          duration: 1.1,
          ease: "power3.out",
          opacity: 1,
          stagger: 0.14,
          y: 0,
        });
        observer.disconnect();
      },
      { threshold: 0.14 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(figures);
    };
  }, [reducedMotion]);

  const activeStep = Math.min(5, Math.floor(progress * 6));
  const active = steps[activeStep];

  return (
    <main className="vanta">
      {/* Direction contract: a ceremonial assembly ledger paired with a real
          precision object. Preserve the split, diagonal axis and measured pace. */}
      <section
        className="vanta-assembly"
        data-reduced={reducedMotion}
        ref={heroRef}
        aria-label="Meridian Instrument assembly"
      >
        <div className="vanta-assembly__sticky" data-step={activeStep}>
          <header className="vanta-header">
            <a className="vanta-mark" href="#assembly" aria-label="VANTA/FORM home">
              <strong>VANTA/FORM</strong>
              <span>Atelier for imaginary instruments</span>
            </a>
            <ExhibitionLink />
          </header>

          <div className="vanta-stage" id="assembly">
            <div className="vanta-stage__identity" aria-hidden="true">
              <strong>MERIDIAN</strong>
              <span>Instrument M/01</span>
            </div>
            {webgl ? (
              <MeridianScene progress={progress} reducedMotion={reducedMotion} />
            ) : (
              <div className="meridian-fallback" aria-label="Assembled Meridian Instrument">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            )}
            <div className="vanta-stage__meta" aria-hidden="true">
              <span>Seat {Math.round(progress * 100).toString().padStart(3, "0")}%</span>
              <span>{active[2]}</span>
            </div>
            <div className="vanta-drag" aria-hidden="true">
              <span>Inspect reflection</span>
              <i />
            </div>
          </div>

          <aside className="vanta-ledger" aria-live="polite">
            <div className="vanta-ledger__heading">
              <span>Meridian Instrument</span>
              <span>Assembly state</span>
            </div>
            <p className="vanta-step-number">{active[0]}</p>
            <div className="vanta-step-copy">
              <span>Current part</span>
              <h1>{active[1]}</h1>
              <p>{active[2]}. A fictional material study rendered as part of the assembly sequence.</p>
            </div>
            <ol className="vanta-progress" aria-label="Six assembly stages">
              {steps.map(([number, name], index) => (
                <li data-active={index === activeStep} data-complete={index < activeStep} key={number}>
                  <span>{number}</span>
                  <span>{name}</span>
                </li>
              ))}
            </ol>
            <div className="vanta-measure">
              <span>Axis</span>
              <strong>{Math.round(progress * 100).toString().padStart(3, "0")}</strong>
              <span>% seated</span>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="vanta-materials"
        aria-labelledby="material-heading"
        ref={materialsRef}
      >
        <header>
          <h2 id="material-heading">Three surfaces. One measured object.</h2>
          <p>
            Material studies are evidence of tone and tactility, not claims about a manufactured product.
          </p>
        </header>
        <figure>
          <img
            src="/assets/site-01/material-titanium.webp"
            alt="Macro study of dark brushed titanium with a warm oxidized edge"
          />
          <figcaption>
            <span>Material 01</span>
            <strong>Oxidized titanium</strong>
            <span>Directional satin, warm grazing light</span>
          </figcaption>
        </figure>
        <figure>
          <img
            src="/assets/site-01/material-quartz.webp"
            alt="Macro study of a polished smoked-quartz edge in black space"
          />
          <figcaption>
            <span>Material 02</span>
            <strong>Smoked quartz</strong>
            <span>Optical depth, restrained internal veil</span>
          </figcaption>
        </figure>
        <figure>
          <img
            src="/assets/site-01/material-linen.webp"
            alt="Macro study of warm linen paper with blind-embossed arcs"
          />
          <figcaption>
            <span>Material 03</span>
            <strong>Linen ledger stock</strong>
            <span>Blind emboss, uncoated fiber</span>
          </figcaption>
        </figure>
      </section>

      <section className="vanta-closing">
        <p>Meridian / M·01</p>
        <h2>Not a product announcement. A study in assembly, attention and restraint.</h2>
        <a href="#assembly">Return to the working bay</a>
      </section>
    </main>
  );
}
