import { CSSProperties, FormEvent, useMemo, useState } from "react";
import { ExhibitionLink } from "../../shared/ExhibitionLink";
import { useReducedMotion } from "../../shared/useReducedMotion";
import { WeatherCanvas, type WeatherMode } from "./WeatherCanvas";
import "./site-02.css";

const modeLabels: { id: WeatherMode; label: string; description: string }[] = [
  { id: "gather", label: "Gather", description: "restore the word" },
  { id: "shear", label: "Shear", description: "cross a pressure front" },
  { id: "rain", label: "Rain", description: "release letter matter" },
];

type GlyphStyle = CSSProperties & {
  "--glyph": number;
  "--glyph-count": number;
};

export default function Site02() {
  const reducedMotion = useReducedMotion();
  const [input, setInput] = useState("ECHO");
  const [word, setWord] = useState("ECHO");
  const [mode, setMode] = useState<WeatherMode>("gather");
  const [status, setStatus] = useState("ECHO is gathering into a readable formation.");
  const [eventCount, setEventCount] = useState(1);

  const seed = useMemo(
    () =>
      word
        .split("")
        .reduce((total, letter, index) => (total * 31 + letter.charCodeAt(0) + index) >>> 0, 2166136261)
        .toString(16)
        .toUpperCase()
        .padStart(8, "0"),
    [word],
  );

  function submitWord(event: FormEvent) {
    event.preventDefault();
    const normalized = input.replace(/[^a-zA-Z]/g, "").slice(0, 10).toUpperCase();
    if (!normalized) {
      setStatus("Enter at least one letter, then form the weather again.");
      return;
    }
    setWord(normalized);
    setInput(normalized);
    setMode("gather");
    setEventCount((count) => count + 1);
  }

  function selectMode(nextMode: WeatherMode) {
    setMode(nextMode);
    setEventCount((count) => count + 1);
  }

  function reset() {
    setMode("return");
    setEventCount((count) => count + 1);
  }

  return (
    <main className="grammar">
      {/* Direction contract: the white field is the interface and type is matter.
          Preserve one complete reversible toy loop; do not add dashboard chrome. */}
      <section className="grammar-hero" aria-label="Playable typographic weather field">
        <header className="grammar-header">
          <a href="#weather" className="grammar-title">
            GRAMMAR WEATHER
          </a>
          <p aria-live="polite">{status}</p>
          <ExhibitionLink />
        </header>

        <div className="grammar-field" data-mode={mode} id="weather">
          <WeatherCanvas
            mode={mode}
            onState={setStatus}
            reducedMotion={reducedMotion}
            word={word}
          />
          <div
            aria-hidden="true"
            className="grammar-type-echo"
            data-mode={mode}
            key={`${word}-${eventCount}`}
          >
            {word.split("").map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                style={
                  {
                    "--glyph": index,
                    "--glyph-count": word.length,
                  } as GlyphStyle
                }
              >
                {letter}
              </span>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="grammar-pressure-front"
            data-mode={mode}
            key={`front-${eventCount}`}
          />
          <p className="grammar-field__axis" aria-hidden="true">
            Pressure field / {mode}
          </p>
        </div>

        <form className="weather-controls" onSubmit={submitWord}>
          <label>
            <span>Type a word</span>
            <input
              aria-describedby="word-help"
              autoComplete="off"
              maxLength={10}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              value={input}
            />
          </label>
          <button className="word-submit" type="submit">
            Form
            <span aria-hidden="true">→</span>
          </button>
          <p id="word-help">Letters only, up to ten. Everything runs locally in your browser.</p>
        </form>

        <div className="weather-modes" aria-label="Weather forces">
          {modeLabels.map((item) => (
            <button
              aria-describedby={`mode-${item.id}`}
              aria-pressed={mode === item.id}
              data-mode={item.id}
              key={item.id}
              onClick={() => selectMode(item.id)}
              type="button"
            >
              {item.label}
              <span id={`mode-${item.id}`}>{item.description}</span>
            </button>
          ))}
        </div>

        <div className="grammar-reset">
          <button onClick={reset} type="button">
            Return
          </button>
          <span>Seed {seed}</span>
        </div>

        <ol className="grammar-history" aria-label="Transformation states">
          {["Form", "Front", "Weather", "Return"].map((label, index) => (
            <li
              data-active={
                (mode === "gather" && index === 0) ||
                (mode === "shear" && index === 1) ||
                (mode === "rain" && index === 2) ||
                (mode === "return" && index === 3)
              }
              key={label}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>

        <aside className="weather-log" aria-label="Weather event log">
          <span>Event {eventCount.toString().padStart(2, "0")}</span>
          <strong>{mode}</strong>
          <p>{status}</p>
        </aside>
      </section>

      <section className="grammar-notes" aria-labelledby="notes-heading">
        <div>
          <h1 id="notes-heading">A word stays readable until you choose to break it.</h1>
          <p>
            This local toy samples the submitted glyphs into particles. Gather attracts each point to
            its letter; Shear offsets the field by height; Rain adds gravity; Return restores the same
            deterministic formation.
          </p>
        </div>
        <div className="grammar-distance" aria-hidden="true">
          <span>Across the room</span>
          <b>{word}</b>
          <span>Arm’s length</span>
          <b>{word.split("").join(" ")}</b>
          <span>Nose close</span>
          <i />
        </div>
      </section>
    </main>
  );
}
