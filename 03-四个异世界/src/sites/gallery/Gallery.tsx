import { useState } from "react";
import "./gallery.css";

const works = [
  {
    id: "01",
    route: "/site-01",
    title: "VANTA/FORM",
    mode: "Ceremonial object assembly",
    className: "portal--vanta",
  },
  {
    id: "02",
    route: "/site-02",
    title: "GRAMMAR WEATHER",
    mode: "Playable typographic physics",
    className: "portal--grammar",
  },
  {
    id: "03",
    route: "/site-03",
    title: "TEAR/LINE",
    mode: "Fashion décollage",
    className: "portal--tear",
  },
  {
    id: "04",
    route: "/site-04",
    title: "THE PALE BELOW",
    mode: "Unknown-world descent",
    className: "portal--pale",
  },
];

function PortalPreview({ id }: { id: string }) {
  if (id === "01") {
    return (
      <span className="portal-preview portal-preview--vanta" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (id === "02") {
    return (
      <span className="portal-preview portal-preview--grammar" aria-hidden="true">
        <b>E</b>
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (id === "03") {
    return (
      <span className="portal-preview portal-preview--tear" aria-hidden="true">
        <span />
      </span>
    );
  }

  return (
    <span className="portal-preview portal-preview--pale" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function Gallery() {
  const [active, setActive] = useState("01");

  return (
    <main className="gallery">
      {/* Direction contract: an archival contact sheet of four expanding apertures;
          no project cards, shared hero template, or generic hover lift. */}
      <header className="gallery__header">
        <p>Four unrelated worlds</p>
        <p>Original creative-web studies</p>
        <p>Desktop exhibition · 2026</p>
      </header>

      <section className="portal-stack" aria-label="Creative works">
        {works.map((work) => (
          <a
            className={`portal ${work.className}`}
            data-active={active === work.id}
            href={work.route}
            key={work.id}
            onFocus={() => setActive(work.id)}
            onMouseEnter={() => setActive(work.id)}
          >
            <span className="portal__number">{work.id}</span>
            <span className="portal__title">{work.title}</span>
            <PortalPreview id={work.id} />
            <span className="portal__mode">{work.mode}</span>
            <span className="portal__open">
              Enter <span aria-hidden="true">↗</span>
            </span>
          </a>
        ))}
      </section>

      <footer className="gallery__footer">
        <span>Mouse, wheel and keyboard</span>
        <span>Each route has a reduced-motion state</span>
      </footer>
    </main>
  );
}
