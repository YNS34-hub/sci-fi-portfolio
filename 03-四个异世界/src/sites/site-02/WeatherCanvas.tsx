import { useEffect, useRef } from "react";

export type WeatherMode = "gather" | "shear" | "rain" | "return";

type WeatherCanvasProps = {
  word: string;
  mode: WeatherMode;
  reducedMotion: boolean;
  onState: (message: string) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
  phase: number;
};

function sampleWord(word: string, width: number, height: number) {
  const surface = document.createElement("canvas");
  const context = surface.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  surface.width = Math.min(3480, Math.max(720, Math.floor(width * 0.92)));
  surface.height = Math.min(1360, Math.max(320, Math.floor(height * 0.64)));
  let fontSize = surface.height * 0.78;
  context.font = `800 ${fontSize}px Bahnschrift, sans-serif`;
  while (context.measureText(word).width > surface.width * 0.92 && fontSize > 50) {
    fontSize *= 0.92;
    context.font = `800 ${fontSize}px Bahnschrift, sans-serif`;
  }
  context.fillStyle = "#000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(word, surface.width / 2, surface.height / 2);
  const image = context.getImageData(0, 0, surface.width, surface.height);
  const points: { x: number; y: number }[] = [];
  const step = Math.max(4, Math.ceil(Math.sqrt((surface.width * surface.height) / 22000)));
  for (let y = 0; y < surface.height; y += step) {
    for (let x = 0; x < surface.width; x += step) {
      const alpha = image.data[(y * surface.width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({
          x: x - surface.width / 2 + width / 2,
          y: y - surface.height / 2 + height / 2,
        });
      }
    }
  }
  return points;
}

export function WeatherCanvas({ word, mode, reducedMotion, onState }: WeatherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef(word);
  const modeRef = useRef(mode);
  const stateCallbackRef = useRef(onState);

  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    stateCallbackRef.current = onState;
  }, [onState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const canvasElement: HTMLCanvasElement = canvas;
    const context2d: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let currentWord = "";
    let announcedMode = "";
    let frame = 0;
    let elapsed = 0;
    let lastTick = performance.now();
    const pointer = { x: 0, y: 0, active: false, speedX: 0, speedY: 0 };

    function rebuild(nextWord: string) {
      const points = sampleWord(nextWord, width, height);
      const source = points.length ? points : [{ x: width / 2, y: height / 2 }];
      particles = source.map((point, index) => {
        const angle = (index * 2.399963) % (Math.PI * 2);
        const radius = Math.min(width, height) * (0.16 + (index % 19) / 40);
        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          tx: point.x,
          ty: point.y,
          size: 1.05 + (index % 5) * 0.2,
          phase: (index % 127) / 127,
        };
      });
      currentWord = nextWord;
    }

    function resize() {
      const rect = canvasElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio, 1.6);
      canvasElement.width = Math.floor(width * dpr);
      canvasElement.height = Math.floor(height * dpr);
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild(wordRef.current);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      pointer.speedX = nextX - pointer.x;
      pointer.speedY = nextY - pointer.y;
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function drawContours() {
      if (!pointer.active) return;
      context2d.save();
      context2d.strokeStyle = "rgba(17,17,17,0.11)";
      context2d.lineWidth = 0.7;
      for (let i = 1; i <= 9; i += 1) {
        context2d.beginPath();
        context2d.ellipse(
          pointer.x,
          pointer.y,
          18 + i * 18 + Math.sin(elapsed * 0.02 + i) * 3,
          11 + i * 11,
          pointer.speedX * 0.008,
          0,
          Math.PI * 2,
        );
        context2d.stroke();
      }
      context2d.restore();
    }

    function drawPressureField(currentMode: WeatherMode) {
      const progress = (elapsed * 0.006) % 1;
      const frontX =
        currentMode === "shear"
          ? width * progress
          : currentMode === "rain"
            ? width * (0.18 + progress * 0.64)
            : width * 0.5;
      context2d.save();
      const gradient = context2d.createLinearGradient(frontX - 90, 0, frontX + 90, 0);
      gradient.addColorStop(0, "rgba(17,17,17,0)");
      gradient.addColorStop(0.48, "rgba(17,17,17,0.045)");
      gradient.addColorStop(0.5, "rgba(17,17,17,0.16)");
      gradient.addColorStop(0.52, "rgba(17,17,17,0.045)");
      gradient.addColorStop(1, "rgba(17,17,17,0)");
      context2d.fillStyle = gradient;
      context2d.fillRect(frontX - 90, 0, 180, height);
      context2d.restore();
    }

    function tick(timestamp = performance.now()) {
      const delta = Math.min(4, Math.max(0.5, (timestamp - lastTick) / (1000 / 60)));
      lastTick = timestamp;
      elapsed += delta;
      const nextWord = wordRef.current;
      const currentMode = modeRef.current;
      if (currentWord !== nextWord) rebuild(nextWord);

      context2d.clearRect(0, 0, width, height);
      context2d.fillStyle = "#f2f0e9";
      context2d.fillRect(0, 0, width, height);
      drawContours();
      drawPressureField(currentMode);

      const settled = currentMode === "gather" || currentMode === "return";
      particles.forEach((particle, index) => {
        const dx = particle.tx - particle.x;
        const dy = particle.ty - particle.y;
        if (reducedMotion) {
          if (currentMode === "rain") {
            particle.x = particle.tx;
            particle.y = Math.min(height * 0.88, particle.ty + (index % 13) * 7);
          } else if (currentMode === "shear") {
            particle.x = particle.tx + (particle.ty - height / 2) * 0.22;
            particle.y = particle.ty;
          } else {
            particle.x = particle.tx;
            particle.y = particle.ty;
          }
        } else if (settled) {
          const convergence = 1 - Math.pow(0.94, delta);
          particle.vx = dx * convergence;
          particle.vy = dy * convergence;
          particle.x += particle.vx;
          particle.y += particle.vy;
        } else if (currentMode === "shear") {
          particle.vx += (dx * 0.006 + (particle.ty - height / 2) * 0.00058) * delta;
          particle.vy +=
            (dy * 0.006 + Math.sin(particle.phase * 22 + elapsed * 0.018) * 0.028) * delta;
        } else {
          particle.vx += dx * 0.003 * delta;
          particle.vy += (0.08 + particle.phase * 0.08) * delta;
          if (particle.y > height * 0.91) {
            particle.y = height * 0.18 - particle.phase * 90;
            particle.vy *= 0.25;
          }
        }

        if (!reducedMotion && pointer.active) {
          const pdx = particle.x - pointer.x;
          const pdy = particle.y - pointer.y;
          const distanceSquared = pdx * pdx + pdy * pdy;
          if (distanceSquared < 30000 && distanceSquared > 40) {
            const force = (1 - distanceSquared / 30000) * 0.12;
            const impulseX = (pdx * force + pointer.speedX * 0.18) / 12;
            const impulseY = (pdy * force + pointer.speedY * 0.18) / 12;
            if (settled) {
              particle.x += impulseX;
              particle.y += impulseY;
            } else {
              particle.vx += impulseX;
              particle.vy += impulseY;
            }
          }
        }

        if (!reducedMotion && !settled) {
          const damping = Math.pow(0.91, delta);
          particle.vx *= damping;
          particle.vy *= damping;
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
        }

        const speed = Math.min(1, Math.hypot(particle.vx, particle.vy) / 4);
        if (speed > 0.12) {
          context2d.fillStyle = `rgba(17,17,17,${speed * 0.1})`;
          context2d.fillRect(
            particle.x - particle.vx * 2.6,
            particle.y - particle.vy * 2.6,
            Math.max(0.7, particle.size * 0.55),
            Math.max(0.7, particle.size * 0.55),
          );
        }
        context2d.fillStyle = `rgba(17,17,17,${0.62 + speed * 0.34})`;
        context2d.beginPath();
        context2d.ellipse(
          particle.x,
          particle.y,
          particle.size + speed * 0.8,
          particle.size * (1 + speed * 1.8),
          Math.atan2(particle.vy, particle.vx),
          0,
          Math.PI * 2,
        );
        context2d.fill();
      });

      pointer.speedX *= 0.82;
      pointer.speedY *= 0.82;

      if (announcedMode !== currentMode) {
        announcedMode = currentMode;
        stateCallbackRef.current(
          currentMode === "gather"
            ? `${nextWord} is gathering into a readable formation.`
            : currentMode === "shear"
              ? `${nextWord} is crossing a lateral pressure front.`
              : currentMode === "rain"
                ? `${nextWord} is releasing as falling letter matter.`
                : `${nextWord} is returning to its original form.`,
        );
      }
      frame = requestAnimationFrame(tick);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvasElement);
    canvasElement.addEventListener("pointermove", onPointerMove);
    canvasElement.addEventListener("pointerleave", onPointerLeave);
    resize();
    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvasElement.removeEventListener("pointermove", onPointerMove);
      canvasElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reducedMotion]);

  return <canvas className="weather-canvas" ref={canvasRef} aria-hidden="true" />;
}
